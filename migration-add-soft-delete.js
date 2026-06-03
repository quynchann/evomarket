// MIGRATION: Add Soft Delete to Multiple Tables
// File: backend/src/migrations/YYYYMMDDHHMMSS-add-soft-delete.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🚀 Adding soft delete columns to tables...');
    
    // 1. Users
    await queryInterface.addColumn('Users', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Users', ['deleted']);
    console.log('✅ Users: added soft delete');

    // 2. UserAddresses
    await queryInterface.addColumn('UserAddresses', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('UserAddresses', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('UserAddresses', ['deleted']);
    console.log('✅ UserAddresses: added soft delete');

    // 3. Categories
    await queryInterface.addColumn('Categories', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Categories', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Categories', ['deleted']);
    console.log('✅ Categories: added soft delete');

    // 4. Products - already has 'deleted', just add 'deleted_at'
    await queryInterface.addColumn('Products', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    console.log('✅ Products: added deleted_at timestamp');

    // 5. ProductVariants
    await queryInterface.addColumn('ProductVariants', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('ProductVariants', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('ProductVariants', ['deleted']);
    console.log('✅ ProductVariants: added soft delete');

    // 6. Coupons
    await queryInterface.addColumn('Coupons', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Coupons', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Coupons', ['deleted']);
    console.log('✅ Coupons: added soft delete');

    // 7. ShippingProviders
    await queryInterface.addColumn('ShippingProviders', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('ShippingProviders', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('ShippingProviders', ['deleted']);
    console.log('✅ ShippingProviders: added soft delete');

    // 8. Reviews
    await queryInterface.addColumn('Reviews', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Reviews', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Reviews', ['deleted']);
    console.log('✅ Reviews: added soft delete');

    console.log('🎉 Soft delete migration completed!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⏮️ Rolling back soft delete columns...');

    // Remove from Users
    await queryInterface.removeIndex('Users', ['deleted']);
    await queryInterface.removeColumn('Users', 'deleted');
    await queryInterface.removeColumn('Users', 'deleted_at');

    // Remove from UserAddresses
    await queryInterface.removeIndex('UserAddresses', ['deleted']);
    await queryInterface.removeColumn('UserAddresses', 'deleted');
    await queryInterface.removeColumn('UserAddresses', 'deleted_at');

    // Remove from Categories
    await queryInterface.removeIndex('Categories', ['deleted']);
    await queryInterface.removeColumn('Categories', 'deleted');
    await queryInterface.removeColumn('Categories', 'deleted_at');

    // Remove from Products
    await queryInterface.removeColumn('Products', 'deleted_at');

    // Remove from ProductVariants
    await queryInterface.removeIndex('ProductVariants', ['deleted']);
    await queryInterface.removeColumn('ProductVariants', 'deleted');
    await queryInterface.removeColumn('ProductVariants', 'deleted_at');

    // Remove from Coupons
    await queryInterface.removeIndex('Coupons', ['deleted']);
    await queryInterface.removeColumn('Coupons', 'deleted');
    await queryInterface.removeColumn('Coupons', 'deleted_at');

    // Remove from ShippingProviders
    await queryInterface.removeIndex('ShippingProviders', ['deleted']);
    await queryInterface.removeColumn('ShippingProviders', 'deleted');
    await queryInterface.removeColumn('ShippingProviders', 'deleted_at');

    // Remove from Reviews
    await queryInterface.removeIndex('Reviews', ['deleted']);
    await queryInterface.removeColumn('Reviews', 'deleted');
    await queryInterface.removeColumn('Reviews', 'deleted_at');

    console.log('✅ Rollback completed');
  },
};
