'use strict'

const { buildProductCatalog } = require('./helpers/productSeedCatalog')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [sellerRows] = await queryInterface.sequelize.query(
      `
      SELECT id, email
      FROM Users
      WHERE email IN ('seller1@test.com', 'seller2@test.com', 'seller3@test.com')
      ORDER BY id ASC;
      `,
    )

    const sellerIds = sellerRows.map((r) => r.id)
    const seller1 = sellerIds[0] || null
    const seller2 = sellerIds[1] || null
    const seller3 = sellerIds[2] || null

    const productsData = buildProductCatalog(seller1, seller2, seller3)

    await queryInterface.bulkInsert('Products', productsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {})
  },
}
