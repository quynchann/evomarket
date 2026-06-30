'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productIds = [1, 2, 3, 4, 6, 8]

    const [productRows] = await queryInterface.sequelize.query(`
      SELECT id, seller_id, title, thumbnail, import_price, price
      FROM Products
      WHERE id IN (${productIds.join(',')})
    `)

    const productMap = {}
    productRows.forEach((p) => {
      productMap[p.id] = p
    })

    const [variantRows] = await queryInterface.sequelize.query(`
      SELECT id, product_id, color
      FROM ProductVariants
      WHERE product_id IN (${productIds.join(',')})
      ORDER BY product_id ASC, id ASC
    `)

    const variantByProduct = {}
    variantRows.forEach((v) => {
      if (!variantByProduct[v.product_id]) {
        variantByProduct[v.product_id] = v
      }
    })

    const platformFeePercent = 5.0

    const lines = [
      { id: 1, order_id: 1, product_id: 1, quantity: 2, variant_name: 'Màu trắng' },
      { id: 2, order_id: 1, product_id: 8, quantity: 1, variant_name: 'Màu đen' },
      { id: 3, order_id: 2, product_id: 2, quantity: 1, variant_name: 'Gọng vàng' },
      { id: 4, order_id: 2, product_id: 6, quantity: 1, variant_name: 'Màu bạc' },
      { id: 5, order_id: 3, product_id: 3, quantity: 1, variant_name: 'Tròng xanh' },
      { id: 6, order_id: 4, product_id: 4, quantity: 1, variant_name: 'Màu vàng' },
    ]

    const orderItemsData = lines.map((line) => {
      const product = productMap[line.product_id]
      const variant = variantByProduct[line.product_id]
      const sellingPrice = Number(product.price)
      const totalPrice = sellingPrice * line.quantity

      return {
        id: line.id,
        order_id: line.order_id,
        product_id: line.product_id,
        variant_id: variant.id,
        seller_id: product.seller_id,
        quantity: line.quantity,
        total_price: totalPrice,
        selling_price: sellingPrice,
        import_price: Number(product.import_price),
        platform_fee: Math.round((totalPrice * platformFeePercent) / 100),
        platform_fee_percent: platformFeePercent,
        product_title: product.title,
        product_thumbnail: product.thumbnail,
        variant_name: line.variant_name,
      }
    })

    await queryInterface.bulkInsert('OrderItems', orderItemsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderItems', null, {})
  },
}
