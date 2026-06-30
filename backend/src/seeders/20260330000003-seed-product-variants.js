'use strict'

const { buildProductCatalog, buildVariantCatalog } = require('./helpers/productSeedCatalog')

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
    const products = buildProductCatalog(
      sellerIds[0] || null,
      sellerIds[1] || null,
      sellerIds[2] || null,
    )
    const variantsData = buildVariantCatalog(products)

    await queryInterface.bulkInsert('ProductVariants', variantsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProductVariants', null, {})
  },
}
