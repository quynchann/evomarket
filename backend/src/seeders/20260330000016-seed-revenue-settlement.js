'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const revenueData = [
      {
        id: 1,
        seller_id: 5,
        order_id: 1,
        total_revenue: 500000,
        platform_fee: 50000,
        final_amount: 450000,
        created_at: new Date('2026-03-20')
      },
      {
        id: 2,
        seller_id: 6,
        order_id: 2,
        total_revenue: 630000,
        platform_fee: 63000,
        final_amount: 567000,
        created_at: new Date('2026-03-22')
      },
      {
        id: 3,
        seller_id: 5,
        order_id: 3,
        total_revenue: 450000,
        platform_fee: 45000,
        final_amount: 405000,
        created_at: new Date('2026-03-26')
      }
    ]

    await queryInterface.bulkInsert('RevenueSettlement', revenueData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RevenueSettlement', null, {})
  }
}
