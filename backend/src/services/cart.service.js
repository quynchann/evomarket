import { Cart, Product, ProductVariant, User } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

const toPlain = (row) => (row?.get ? row.get({ plain: true }) : row)

/**
 * Max có thể đặt cho một dòng giỏ (theo tồn kho sản phẩm hoặc biến thể)
 */
const getMaxAvailable = (product, variant) => {
  if (!product) return 0
  if (variant) return Math.max(0, Number(variant.stock) || 0)
  return Math.max(0, Number(product.available) || 0)
}

const mapCartRowToDto = (cartRow, product, variant) => {
  const unitPrice = Number(product.price) || 0
  const qty = Number(cartRow.quantity) || 0
  const maxQty = getMaxAvailable(product, variant)
  const seller = product.Seller || {}
  const sellerName = (() => {
    const sn = seller.shop_name != null ? String(seller.shop_name).trim() : ''
    return sn || seller.fullname || 'Seller'
  })()
  return {
    id: cartRow.id,
    productId: product.id,
    variantId: variant ? variant.id : null,
    quantity: qty,
    title: product.title || '',
    thumbnail: product.thumbnail || '',
    unitPrice,
    lineTotal: unitPrice * qty,
    maxQuantity: maxQty,
    seller: {
      id: seller.id,
      fullname: seller.fullname || 'Seller',
      shopName: sellerName,
    },
    variantLabel: variant
      ? [variant.size, variant.color].filter(Boolean).join(' · ') || null
      : null
  }
}

/**
 * Lấy giỏ hàng + dọn dòng không còn hợp lệ
 */
export const getCartForUser = async (userId) => {
  const rows = await Cart.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        include: [{ model: User, as: 'Seller', attributes: ['id', 'fullname', 'shop_name'] }]
      },
      { model: ProductVariant, required: false }
    ],
    order: [['added_at', 'ASC']]
  })

  const items = []
  let subtotal = 0
  let totalQuantity = 0

  for (const row of rows) {
    const plain = toPlain(row)
    const product = row.Product
    const variant = row.ProductVariant

    if (
      !product ||
      product.deleted ||
      (variant && variant.product_id !== product.id)
    ) {
      await row.destroy()
      continue
    }

    const maxQty = getMaxAvailable(product, variant)
    if (maxQty <= 0) {
      await row.destroy()
      continue
    }

    let qty = Number(plain.quantity) || 1
    if (qty > maxQty) {
      qty = maxQty
      await row.update({ quantity: qty })
    }

    const dto = mapCartRowToDto({ ...plain, quantity: qty }, product, variant)
    subtotal += dto.lineTotal
    totalQuantity += dto.quantity
    items.push(dto)
  }

  return {
    items,
    summary: {
      lineCount: items.length,
      totalQuantity,
      subtotal
    }
  }
}

const findExistingLine = async (userId, productId, variantId) => {
  return Cart.findOne({
    where: {
      userId,
      productId,
      variantId:
        variantId != null && variantId !== ''
          ? variantId
          : { [Op.is]: null }
    }
  })
}

/**
 * Thêm hoặc cộng dồn số lượng
 */
export const addOrUpdateItem = async (userId, { productId, variantId, quantity }) => {
  const qty = Number(quantity)
  if (!Number.isFinite(qty) || qty < 1) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Invalid quantity', 'VALIDATION_ERROR')
  }

  const product = await Product.findOne({
    where: { id: productId, deleted: false },
    include: [{ model: User, as: 'Seller', attributes: ['id', 'fullname', 'shop_name'] }]
  })

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found', 'PRODUCT_NOT_FOUND')
  }

  let variant = null
  if (variantId != null && variantId !== '') {
    variant = await ProductVariant.findOne({
      where: { id: variantId, product_id: productId }
    })
    if (!variant) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product variant', 'INVALID_VARIANT')
    }
  }

  const maxAvailable = getMaxAvailable(product, variant)
  if (maxAvailable <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product is out of stock', 'OUT_OF_STOCK')
  }

  const existing = await findExistingLine(userId, productId, variantId ?? null)
  const nextQty = (existing ? Number(existing.quantity) || 0 : 0) + qty

  if (nextQty > maxAvailable) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only ${maxAvailable} item(s) available in stock`,
      'INSUFFICIENT_STOCK',
      { maxAvailable }
    )
  }

  if (existing) {
    await existing.update({ quantity: nextQty })
  } else {
    await Cart.create({
      userId,
      productId,
      variantId: variantId != null && variantId !== '' ? variantId : null,
      quantity: qty
    })
  }

  return getCartForUser(userId)
}

/**
 * Cập nhật số lượng một dòng
 */
export const updateLineQuantity = async (userId, cartItemId, quantity) => {
  const qty = Number(quantity)
  if (!Number.isFinite(qty) || qty < 1) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Invalid quantity', 'VALIDATION_ERROR')
  }

  const row = await Cart.findOne({
    where: { id: cartItemId, userId },
    include: [
      { model: Product, include: [{ model: User, as: 'Seller', attributes: ['id', 'fullname', 'shop_name'] }] },
      { model: ProductVariant, required: false }
    ]
  })

  if (!row) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found', 'CART_ITEM_NOT_FOUND')
  }

  const product = row.Product
  const variant = row.ProductVariant
  if (!product || product.deleted) {
    await row.destroy()
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product no longer available', 'PRODUCT_NOT_FOUND')
  }

  const maxAvailable = getMaxAvailable(product, variant)
  if (qty > maxAvailable) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only ${maxAvailable} item(s) available in stock`,
      'INSUFFICIENT_STOCK',
      { maxAvailable }
    )
  }

  await row.update({ quantity: qty })
  return getCartForUser(userId)
}

/**
 * Xóa một dòng
 */
export const removeLine = async (userId, cartItemId) => {
  const deleted = await Cart.destroy({
    where: { id: cartItemId, userId }
  })
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found', 'CART_ITEM_NOT_FOUND')
  }
  return getCartForUser(userId)
}

/**
 * Xóa toàn bộ giỏ
 */
export const clearCart = async (userId) => {
  await Cart.destroy({ where: { userId } })
  return getCartForUser(userId)
}
