import { Category, Product } from '@/models/index.js'

export const findAllBySeller = (sellerId) =>
  Product.findAll({
    where: { seller_id: sellerId, deleted: false },
    include: [{ model: Category, attributes: ['id', 'name'] }],
    order: [['id', 'DESC']]
  })

export const findByIdForSeller = (productId, sellerId) =>
  Product.findOne({
    where: { id: productId, seller_id: sellerId, deleted: false },
    include: [{ model: Category, attributes: ['id', 'name'] }]
  })
