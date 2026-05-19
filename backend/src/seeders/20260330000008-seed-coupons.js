'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const couponsData = [
      {
        id: 1,
        code: 'WELCOME10',
        discount_type: 'Percentage',
        discount_value: 10.00,
        min_order_value: 200000.00,
        max_uses: 1000,
        used_count: 25,
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        new_user_only: true
      },
      {
        id: 2,
        code: 'SUMMER50',
        discount_type: 'Fixed',
        discount_value: 50000.00,
        min_order_value: 500000.00,
        max_uses: 500,
        used_count: 12,
        start_date: new Date('2026-03-01'),
        end_date: new Date('2026-06-30'),
        new_user_only: false
      },
      {
        id: 3,
        code: 'FREESHIP',
        discount_type: 'Fixed',
        discount_value: 30000.00,
        min_order_value: 300000.00,
        max_uses: 2000,
        used_count: 150,
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        new_user_only: false
      },
      {
        id: 4,
        code: 'MEGA20',
        discount_type: 'Percentage',
        discount_value: 20.00,
        min_order_value: 1000000.00,
        max_uses: 100,
        used_count: 8,
        start_date: new Date('2026-03-15'),
        end_date: new Date('2026-04-15'),
        new_user_only: false
      }
    ]

    await queryInterface.bulkInsert('Coupons', couponsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Coupons', null, {})
  }
}
