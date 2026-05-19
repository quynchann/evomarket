'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'vnpay_transaction_no', {
      type: Sequelize.STRING(32),
      allowNull: true,
    })
    await queryInterface.addColumn('Payments', 'vnpay_transaction_date', {
      type: Sequelize.STRING(20),
      allowNull: true,
    })
    await queryInterface.addColumn('Payments', 'refunded_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Payments', 'refunded_at')
    await queryInterface.removeColumn('Payments', 'vnpay_transaction_date')
    await queryInterface.removeColumn('Payments', 'vnpay_transaction_no')
  },
}
