import { Category, Product, User, sequelize } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { Op, QueryTypes } from 'sequelize'
import { getSellerTodayStats } from './order.service.js'
import { emitSellerTodayStats } from '../sockets/emitters/system.emitter.js'
import { getProductRatingBatch } from './review.service.js'

const emptyRatingSummary = () => ({ average: null, count: 0 })

const withRatingSummaries = async (dtos) => {
  if (!dtos?.length) return dtos
  const batch = await getProductRatingBatch(dtos.map((d) => d.id))
  return dtos.map((d) => ({
    ...d,
    ratingSummary: batch.get(d.id) || emptyRatingSummary(),
  }))
}

const toPlain = (row) => (row?.get ? row.get({ plain: true }) : row)

const sellerDisplayName = (seller) => {
  const sn =
    seller?.shop_name != null ? String(seller.shop_name).trim() : ''
  const fn = seller?.fullname != null ? String(seller.fullname).trim() : ''
  return sn || fn || 'Seller'
}

/**
 * Map product to public DTO (for buyers)
 * Không hiển thị import_price, profit, seller info
 */
export const mapProductToPublicDto = (row) => {
  const plain = toPlain(row)
  if (!plain) return null
  
  const cat = plain.Category || {}
  const seller = plain.Seller || {}
  const available = Number(plain.available) || 0
  const deleted = Boolean(plain.deleted)
  
  // Parse images
  let images = []
  if (plain.images) {
    try {
      images = JSON.parse(plain.images)
      if (!Array.isArray(images)) images = []
    } catch (e) {
      images = []
    }
  }
  if (plain.thumbnail && !images.includes(plain.thumbnail)) {
    images = [plain.thumbnail, ...images]
  }

  return {
    id: plain.id,
    title: plain.title || '',
    price: Number(plain.price) || 0,
    thumbnail: plain.thumbnail || '',
    images: images,
    description: plain.description || '',
    category: {
      id: cat.id,
      name: cat.name || ''
    },
    seller: {
      id: seller.id,
      fullname: seller.fullname || 'Seller',
      shopName: sellerDisplayName(seller),
    },
    stock: available,
    sold: Number(plain.sold) || 0,
    inStock: available > 0 && !deleted,
    createdAt: plain.created_at,
    updatedAt: plain.updated_at
  }
}

/**
 * Get all active products (for buyers)
 * Filters: categoryId, search, minPrice, maxPrice, sortBy
 */
export const getPublicProducts = async (filters = {}) => {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    sortBy = 'latest', // latest, popular, price_asc, price_desc
    sellerId,
    page = 1,
    limit = 20
  } = filters

  const where = {
    deleted: false,
    available: { [Op.gt]: 0 } // Chỉ lấy sản phẩm còn hàng
  }

  const sid = sellerId != null ? Number(sellerId) : NaN
  if (Number.isFinite(sid)) {
    where.seller_id = sid
  }

  // Filter by category
  if (categoryId) {
    where.category_id = categoryId
  }

  // Search by title (case-insensitive)
  if (search && search.trim()) {
    where[Op.and] = [
      sequelize.where(
        sequelize.fn('LOWER', sequelize.col('title')),
        'LIKE',
        `%${search.trim().toLowerCase()}%`
      )
    ]
  }

  // Price range
  if (minPrice !== undefined && minPrice !== null) {
    where.price = { ...where.price, [Op.gte]: Number(minPrice) }
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    where.price = { ...where.price, [Op.lte]: Number(maxPrice) }
  }

  // Sorting
  let order = [['id', 'DESC']] // Default: latest
  if (sortBy === 'popular') {
    order = [['sold', 'DESC']]
  } else if (sortBy === 'price_asc') {
    order = [['price', 'ASC']]
  } else if (sortBy === 'price_desc') {
    order = [['price', 'DESC']]
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(limit)

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'Seller',
        attributes: ['id', 'fullname', 'shop_name']
      }
    ],
    order,
    limit: Number(limit),
    offset,
    distinct: true
  })

  return {
    products: await withRatingSummaries(rows.map(mapProductToPublicDto)),
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit))
    }
  }
}

/**
 * Get product detail by ID (for buyers)
 */
export const getProductById = async (productId) => {
  const product = await Product.findOne({
    where: {
      id: productId,
      deleted: false
    },
    include: [
      {
        model: Category,
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'Seller',
        attributes: ['id', 'fullname', 'email', 'shop_name']
      }
    ]
  })

  if (!product) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND'
    )
  }

  const dto = mapProductToPublicDto(product)
  const [withRating] = await withRatingSummaries([dto])
  return withRating
}

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId, filters = {}) => {
  return getPublicProducts({ ...filters, categoryId })
}

/**
 * Get all categories with product count
 */
export const getAllCategories = async () => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'],
    order: [['id', 'ASC']]
  })

  // Count products for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.count({
        where: {
          category_id: cat.id,
          deleted: false,
          available: { [Op.gt]: 0 }
        }
      })
      return {
        id: cat.id,
        name: cat.name,
        productCount: count
      }
    })
  )

  return categoriesWithCount
}

/**
 * Get featured/popular products
 */
export const getFeaturedProducts = async (limit = 8) => {
  const products = await Product.findAll({
    where: {
      deleted: false,
      available: { [Op.gt]: 0 }
    },
    include: [
      {
        model: Category,
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'Seller',
        attributes: ['id', 'fullname', 'shop_name']
      }
    ],
    order: [['sold', 'DESC']], // Sản phẩm bán chạy nhất
    limit: Number(limit)
  })

  return withRatingSummaries(products.map(mapProductToPublicDto))
}

/**
 * Ghi nhận lượt xem sản phẩm → đếm khách duy nhất theo shop trong ngày (bảng SellerShopVisits).
 * @param {number|string} productId
 * @param {{ buyerUserId: number|null, visitorKey: string|undefined, viewerUserId: number|null }} opts
 */
export const recordProductView = async (
  productId,
  { buyerUserId = null, visitorKey, viewerUserId = null } = {},
) => {
  const pid = Number(productId)
  if (!Number.isFinite(pid)) {
    return { recorded: false, reason: 'invalid_product' }
  }

  const product = await Product.findOne({
    where: { id: pid, deleted: false },
    attributes: ['id', 'seller_id'],
  })
  if (!product) {
    return { recorded: false, reason: 'not_found' }
  }

  const sellerId = Number(product.seller_id)
  if (!Number.isFinite(sellerId)) {
    return { recorded: false, reason: 'invalid_seller' }
  }

  if (
    viewerUserId != null &&
    Number(viewerUserId) === sellerId
  ) {
    return { recorded: false, skipped: 'self' }
  }

  let storageKey
  if (buyerUserId != null && Number.isFinite(Number(buyerUserId))) {
    storageKey = `u:${Number(buyerUserId)}`
  } else {
    const vk = visitorKey != null ? String(visitorKey).trim() : ''
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(vk)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'visitorKey bắt buộc (8–64 ký tự chữ, số, _ hoặc -) khi chưa đăng nhập buyer',
        'INVALID_VISITOR_KEY',
      )
    }
    storageKey = `a:${vk}`
  }

  const [, meta] = await sequelize.query(
    `INSERT IGNORE INTO SellerShopVisits (seller_id, visit_date, visitor_key) VALUES (?, CURDATE(), ?)`,
    { replacements: [sellerId, storageKey] },
  )
  const inserted = Number(meta?.affectedRows) === 1

  if (inserted) {
    try {
      const stats = await getSellerTodayStats(sellerId)
      emitSellerTodayStats(sellerId, stats)
    } catch (e) {
      console.error('[recordProductView] push stats:', e?.message || e)
    }
  }

  return { recorded: true, newUniqueToday: inserted }
}

/**
 * Search products
 */
export const searchProducts = async (query, filters = {}) => {
  return getPublicProducts({ ...filters, search: query })
}
