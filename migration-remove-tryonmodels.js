// MIGRATION: Remove TryonModels table
// File: backend/src/migrations/YYYYMMDDHHMMSS-remove-tryon-models.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop TryonModels table
    await queryInterface.dropTable('TryonModels');
    
    console.log('✅ TryonModels table removed successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate TryonModels table if rollback needed
    await queryInterface.createTable('TryonModels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      model_url: {
        type: Sequelize.STRING(500),
      },
      type: {
        type: Sequelize.ENUM('clothing', 'shoes', 'glasses', 'hats', 'jewelry'),
      },
    });
    
    console.log('⚠️ TryonModels table restored (rollback)');
  },
};
