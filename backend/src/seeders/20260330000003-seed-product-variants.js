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

      { id: 22, product_id: 6, size: 'Cặp', color: 'Trắng ngà', stock: 12 },
      { id: 23, product_id: 6, size: 'Cặp', color: 'Đen titan', stock: 15 },
      { id: 24, product_id: 6, size: 'Cặp', color: 'Vàng champagne', stock: 15 },
      { id: 25, product_id: 6, size: 'Cặp', color: 'Bạc sáng', stock: 15 },
      { id: 26, product_id: 6, size: 'Cặp', color: 'Hồng gold', stock: 13 },

      { id: 27, product_id: 7, size: 'Freesize', color: 'Xanh denim', stock: 25 },
      { id: 28, product_id: 7, size: 'Freesize', color: 'Be kem', stock: 25 },

      { id: 29, product_id: 8, size: 'OneSize', color: 'Đen gọng', stock: 55 },
      { id: 30, product_id: 8, size: 'OneSize', color: 'Nâu tortoise', stock: 55 },

      { id: 31, product_id: 9, size: 'Freesize', color: 'Đen', stock: 25 },
      { id: 32, product_id: 9, size: 'Freesize', color: 'Xám', stock: 25 },
      { id: 33, product_id: 9, size: 'Freesize', color: 'Navy', stock: 25 },

      { id: 34, product_id: 11, size: 'OneSize', color: 'Vàng', stock: 20 },
      { id: 35, product_id: 11, size: 'OneSize', color: 'Bạc', stock: 23 },

      { id: 36, product_id: 12, size: 'Cặp', color: 'Bạc 925', stock: 35 },
      { id: 37, product_id: 12, size: 'Cặp', color: 'Vàng hồng', stock: 42 },

      { id: 38, product_id: 13, size: 'Freesize', color: 'Đen', stock: 30 },
      { id: 39, product_id: 13, size: 'Freesize', color: 'Trắng', stock: 28 },
      { id: 40, product_id: 13, size: 'Freesize', color: 'Navy', stock: 14 },

      { id: 41, product_id: 15, size: 'OneSize', color: 'Vàng kim loại', stock: 22 },
      { id: 42, product_id: 15, size: 'OneSize', color: 'Bạc kim loại', stock: 22 }
    ]

    await queryInterface.bulkInsert('ProductVariants', variantsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProductVariants', null, {})
  }
}
