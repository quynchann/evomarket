'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tryonModelsData = [
      {
        id: 1,
        product_id: 1,
        model_url: 'https://example.com/3d-models/ao-thun-nam-1.glb',
        type: 'clothing'
      },
      {
        id: 2,
        product_id: 2,
        model_url: 'https://example.com/3d-models/ao-so-mi-nu-1.glb',
        type: 'clothing'
      },
      {
        id: 3,
        product_id: 5,
        model_url: 'https://example.com/3d-models/giay-the-thao-1.glb',
        type: 'shoes'
      },
      {
        id: 4,
        product_id: 6,
        model_url: 'https://example.com/3d-models/giay-cao-got-1.glb',
        type: 'shoes'
      },
      {
        id: 5,
        product_id: 8,
        model_url: 'https://example.com/3d-models/mat-kinh-1.glb',
        type: 'glasses'
      }
    ]

    await queryInterface.bulkInsert('TryonModels', tryonModelsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TryonModels', null, {})
  }
}
