import { Category, Product, User } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

const toPlain = (row) => (row?.get ? row.get({ plain: true }) : row)

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
      fullname: seller.fullname || 'Seller'
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
    page = 1,
    limit = 20
  } = filters

  const where = {
    deleted: false,
    available: { [Op.gt]: 0 } // Chỉ lấy sản phẩm còn hàng
  }

  // Filter by category
  if (categoryId) {
    where.category_id = categoryId
  }

  // Search by title
  if (search && search.trim()) {
    where.title = { [Op.like]: `%${search.trim()}%` }
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
        attributes: ['id', 'fullname']
      }
    ],
    order,
    limit: Number(limit),
    offset,
    distinct: true
  })

  return {
    products: rows.map(mapProductToPublicDto),
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
        attributes: ['id', 'fullname', 'email']
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

  return mapProductToPublicDto(product)
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
        attributes: ['id', 'fullname']
      }
    ],
    order: [['sold', 'DESC']], // Sản phẩm bán chạy nhất
    limit: Number(limit)
  })

  return products.map(mapProductToPublicDto)
}

/**
 * Search products
 */
export const searchProducts = async (query, filters = {}) => {
  return getPublicProducts({ ...filters, search: query })
}
