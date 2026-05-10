'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const variantsData = [
      { id: 1, product_id: 1, size: 'Freesize', color: 'Đen', stock: 20 },
      { id: 2, product_id: 1, size: 'Freesize', color: 'Trắng', stock: 25 },
      { id: 3, product_id: 1, size: 'Freesize', color: 'Be', stock: 25 },
      { id: 4, product_id: 1, size: 'Freesize', color: 'Xám', stock: 15 },
      { id: 5, product_id: 1, size: 'Freesize', color: 'Navy', stock: 15 },

      { id: 6, product_id: 2, size: 'OneSize', color: 'Gọng đen mờ', stock: 20 },
      { id: 7, product_id: 2, size: 'OneSize', color: 'Gọng vàng', stock: 20 },
      { id: 8, product_id: 2, size: 'OneSize', color: 'Gọng bạc', stock: 20 },

      { id: 9, product_id: 3, size: 'OneSize', color: 'Tròng xám đậm', stock: 20 },
      { id: 10, product_id: 3, size: 'OneSize', color: 'Tròng nâu', stock: 25 },
      { id: 11, product_id: 3, size: 'OneSize', color: 'Tròng xanh rêu', stock: 25 },
      { id: 12, product_id: 3, size: 'OneSize', color: 'Tròng gương', stock: 25 },
      { id: 13, product_id: 3, size: 'OneSize', color: 'Tròng đen', stock: 25 },

      { id: 14, product_id: 4, size: 'Cặp', color: 'Bạc 925', stock: 15 },
      { id: 15, product_id: 4, size: 'Cặp', color: 'Vàng hồng', stock: 18 },
      { id: 16, product_id: 4, size: 'Cặp', color: 'Mạ vàng 14K', stock: 15 },

      { id: 17, product_id: 5, size: '40cm', color: 'Bạc', stock: 15 },
      { id: 18, product_id: 5, size: '42cm', color: 'Bạc', stock: 20 },
      { id: 19, product_id: 5, size: '45cm', color: 'Bạc', stock: 20 },
      { id: 20, product_id: 5, size: '48cm', color: 'Bạc', stock: 20 },
      { id: 21, product_id: 5, size: '50cm', color: 'Bạc', stock: 15 },

      { id: 22, product_id: 6, size: 'Cặp', color: 'Trắng ngà', stock: 12 },
      { id: 23, product_id: 6, size: 'Cặp', color: 'Đen titan', stock: 15 },
      { id: 24, product_id: 6, size: 'Cặp', color: 'Vàng champagne', stock: 15 },
      { id: 25, product_id: 6, size: 'Cặp', color: 'Bạc sáng', stock: 15 },
      { id: 26, product_id: 6, size: 'Cặp', color: 'Hồng gold', stock: 13 },

      { id: 27, product_id: 7, size: 'OneSize', color: 'Xanh denim', stock: 20 },
      { id: 28, product_id: 7, size: 'OneSize', color: 'Be kem', stock: 20 },

      { id: 29, product_id: 8, size: 'OneSize', color: 'Đen gọng', stock: 55 },
      { id: 30, product_id: 8, size: 'OneSize', color: 'Nâu tortoise', stock: 55 }
    ]

    await queryInterface.bulkInsert('ProductVariants', variantsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProductVariants', null, {})
  }
}
