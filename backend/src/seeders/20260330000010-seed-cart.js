'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cartSpecs = [
      { id: 1, user_id: 2, product_id: 1, quantity: 2 },
      { id: 2, user_id: 2, product_id: 3, quantity: 1 },
      { id: 3, user_id: 3, product_id: 2, quantity: 1 },
      { id: 4, user_id: 3, product_id: 7, quantity: 1 },
      { id: 6, user_id: 4, product_id: 8, quantity: 2 },
    ]

    const productIds = [...new Set(cartSpecs.map((c) => c.product_id))]
    const [variantRows] = await queryInterface.sequelize.query(`
      SELECT id, product_id
      FROM ProductVariants
      WHERE product_id IN (${productIds.join(',')})
      ORDER BY product_id ASC, id ASC
    `)

    const firstVariant = {}
    variantRows.forEach((v) => {
      if (!firstVariant[v.product_id]) firstVariant[v.product_id] = v.id
    })

    const cartData = cartSpecs.map((c) => ({
      id: c.id,
      user_id: c.user_id,
      product_id: c.product_id,
      variant_id: firstVariant[c.product_id],
      quantity: c.quantity,
    }))

    await queryInterface.bulkInsert('Cart', cartData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cart', null, {})
  },
}
