'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userPaymentsData = [
      {
        id: 1,
        user_id: 2,
        method: 'Credit Card',
        provider: 'Visa',
        account_number: '4111111111111111',
        expiry_date: '2028-12-31',
        coupon_id: null
      },
      {
        id: 2,
        user_id: 3,
        method: 'PayPal',
        provider: 'PayPal',
        account_number: 'buyer2@test.com',
        expiry_date: null,
        coupon_id: null
      },
      {
        id: 3,
        user_id: 4,
        method: 'COD',
        provider: null,
        account_number: null,
        expiry_date: null,
        coupon_id: 1
      }
    ]

    await queryInterface.bulkInsert('UserPayments', userPaymentsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserPayments', null, {})
  }
}
