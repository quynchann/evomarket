'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cartData = [
      { id: 1, user_id: 2, product_id: 1, variant_id: 2, quantity: 2 },
      { id: 2, user_id: 2, product_id: 3, variant_id: 10, quantity: 1 },
      { id: 3, user_id: 3, product_id: 2, variant_id: 6, quantity: 1 },
      { id: 4, user_id: 3, product_id: 7, variant_id: 27, quantity: 1 },
      { id: 6, user_id: 4, product_id: 8, variant_id: 29, quantity: 2 }
    ]

    await queryInterface.bulkInsert('Cart', cartData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cart', null, {})
  }
}
