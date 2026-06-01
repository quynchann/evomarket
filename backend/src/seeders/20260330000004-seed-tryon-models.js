'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tryonModelsData = [
      {
        id: 1,
        product_id: 1,
        model_url: 'https://example.com/3d-models/mu-luoi-trai-1.glb',
        type: 'hats'
      },
      {
        id: 2,
        product_id: 2,
        model_url: 'https://example.com/3d-models/kinh-gong-manh-1.glb',
        type: 'glasses'
      },
      {
        id: 3,
        product_id: 3,
        model_url: 'https://example.com/3d-models/kinh-ram-1.glb',
        type: 'glasses'
      },
      {
        id: 4,
        product_id: 4,
        model_url: 'https://example.com/3d-models/hoa-tai-khuyen-1.glb',
        type: 'jewelry'
      },
      {
        id: 5,
        product_id: 8,
        model_url: 'https://example.com/3d-models/kinh-ram-vintage-1.glb',
        type: 'glasses'
      }
    ]

    await queryInterface.bulkInsert('TryonModels', tryonModelsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TryonModels', null, {})
  }
}
