'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const withdrawalsData = [
      {
        id: 1,
        seller_id: 5,
        amount: 5000000,
        account_number: '0123456789',
        bank_name: 'Vietcombank',
        status: 'Approved',
        created_at: new Date('2026-03-10')
      },
      {
        id: 2,
        seller_id: 6,
        amount: 3500000,
        account_number: '9876543210',
        bank_name: 'Techcombank',
        status: 'Pending',
        created_at: new Date('2026-03-25')
      },
      {
        id: 3,
        seller_id: 7,
        amount: 2000000,
        account_number: '5555666677',
        bank_name: 'BIDV',
        status: 'Approved',
        created_at: new Date('2026-03-18')
      }
    ]

    await queryInterface.bulkInsert('Withdrawals', withdrawalsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Withdrawals', null, {})
  }
}
