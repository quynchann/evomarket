'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const discountsData = [
      {
        id: 1,
        product_id: 1,
        discount_type: 'Percentage',
        discount_value: 10.00,
        start_date: new Date('2026-03-01'),
        end_date: new Date('2026-04-30')
      },
      {
        id: 2,
        product_id: 3,
        discount_type: 'Fixed',
        discount_value: 50000.00,
        start_date: new Date('2026-03-15'),
        end_date: new Date('2026-04-15')
      },
      {
        id: 3,
        product_id: 5,
        discount_type: 'Percentage',
        discount_value: 15.00,
        start_date: new Date('2026-03-20'),
        end_date: new Date('2026-05-20')
      }
    ]

    await queryInterface.bulkInsert('Discounts', discountsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Discounts', null, {})
  }
}
