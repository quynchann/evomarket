'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const refundsData = [
      {
        id: 2,
        payment_id: 1,
        user_id: 2,
        order_id: 1,
        amount: 150000,
        reason: 'Sản phẩm bị lỗi',
        status: 'Pending',
        created_at: new Date('2026-03-22')
      }
    ]

    await queryInterface.bulkInsert('Refunds', refundsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Refunds', null, {})
  }
}
