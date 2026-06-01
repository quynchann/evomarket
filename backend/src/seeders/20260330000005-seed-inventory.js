'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const inventoryData = [
      { id: 1, product_id: 1, total_stock: 100, sold: 15, available: 85, import_price: 100000 },
      { id: 2, product_id: 2, total_stock: 80, sold: 20, available: 60, import_price: 180000 },
      { id: 3, product_id: 3, total_stock: 120, sold: 35, available: 85, import_price: 250000 },
      { id: 4, product_id: 4, total_stock: 60, sold: 12, available: 48, import_price: 200000 },
      { id: 6, product_id: 6, total_stock: 70, sold: 18, available: 52, import_price: 280000 },
      { id: 7, product_id: 7, total_stock: 50, sold: 10, available: 40, import_price: 380000 },
      { id: 8, product_id: 8, total_stock: 150, sold: 40, available: 110, import_price: 130000 },
      { id: 9, product_id: 9, total_stock: 75, sold: 8, available: 67, import_price: 75000 },
      { id: 11, product_id: 11, total_stock: 65, sold: 22, available: 43, import_price: 250000 },
      { id: 12, product_id: 12, total_stock: 95, sold: 18, available: 77, import_price: 140000 },
      { id: 13, product_id: 13, total_stock: 88, sold: 16, available: 72, import_price: 130000 },
      { id: 15, product_id: 15, total_stock: 72, sold: 28, available: 44, import_price: 330000 }
    ]

    await queryInterface.bulkInsert('Inventory', inventoryData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inventory', null, {})
  }
}
