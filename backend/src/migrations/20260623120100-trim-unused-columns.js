'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('Products', 'quantity')
    await queryInterface.removeColumn('Products', 'profit_margin')
    await queryInterface.removeColumn('OrderItems', 'price')
    await queryInterface.removeColumn('Payments', 'coupons_id')
    await queryInterface.removeColumn('PlatformConfig', 'description')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('PlatformConfig', 'description', {
      type: Sequelize.STRING(500),
      allowNull: true,
    })
    await queryInterface.addColumn('Payments', 'coupons_id', {
      type: Sequelize.INTEGER,
      references: { model: 'Coupons', key: 'id' },
    })
    await queryInterface.addColumn('OrderItems', 'price', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addColumn('Products', 'profit_margin', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addColumn('Products', 'quantity', {
      type: Sequelize.STRING,
    })
  },
}
