'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [cRows] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM Coupons LIKE 'seller_id'",
    )
    if (!Array.isArray(cRows) || cRows.length === 0) {
      await queryInterface.sequelize.query(
        'ALTER TABLE Coupons ADD COLUMN seller_id INTEGER NULL',
      )
      await queryInterface.addIndex('Coupons', ['seller_id'], {
        name: 'coupons_seller_id_idx',
      })
    }

    const orderCols = await queryInterface.describeTable('Orders')
    if (!orderCols.buyer_note) {
      await queryInterface.addColumn('Orders', 'buyer_note', {
        type: Sequelize.STRING(500),
        allowNull: true,
      })
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Coupons', 'coupons_seller_id_idx').catch(() => {})
    await queryInterface.removeColumn('Coupons', 'seller_id').catch(() => {})
    await queryInterface.removeColumn('Orders', 'buyer_note').catch(() => {})
  },
}
