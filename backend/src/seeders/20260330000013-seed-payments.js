'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const paymentsData = [
      {
        id: 1,
        order_id: 1,
        user_id: 2,
        amount: 500000,
        method: 'Online',
        status: 'Success',
        created_at: new Date('2026-03-15')
      },
      {
        id: 2,
        order_id: 2,
        user_id: 3,
        amount: 630000,
        method: 'COD',
        status: 'Pending',
        created_at: new Date('2026-03-20')
      },
      {
        id: 3,
        order_id: 3,
        user_id: 4,
        amount: 450000,
        method: 'Online',
        status: 'Success',
        created_at: new Date('2026-03-25')
      },
      {
        id: 4,
        order_id: 4,
        user_id: 2,
        amount: 280000,
        method: 'Online',
        status: 'Failed',
        created_at: new Date('2026-03-28')
      }
    ]

    await queryInterface.bulkInsert('Payments', paymentsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {})
  }
}
