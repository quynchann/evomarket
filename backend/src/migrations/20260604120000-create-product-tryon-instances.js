'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductTryonInstances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      model_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Link .glb từ Cloudinary/CDN',
      },
      anchor_index: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'MediaPipe pose landmark index, e.g. 168, 127',
      },
      transform_config: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'position, rotation, scale cho AR overlay',
      },
    })

    await queryInterface.addIndex('ProductTryonInstances', ['product_id'], {
      name: 'product_tryon_instances_product_id_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ProductTryonInstances')
  },
}
