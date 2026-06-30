'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tables = [
      'FailedShipments',
      'Shipments',
      'ShippingProviders',
      'RevenueSettlement',
      'Withdrawals',
      'UserPayments',
      'Discounts',
      'Inventory',
      'TryonModels',
    ]

    for (const table of tables) {
      await queryInterface.dropTable(table)
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('TryonModels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Products', key: 'id' },
      },
      model_url: { type: Sequelize.STRING(500) },
      type: {
        type: Sequelize.ENUM('clothing', 'shoes', 'glasses', 'hats', 'jewelry'),
      },
    })

    await queryInterface.createTable('Inventory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Products', key: 'id' },
      },
      total_stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      sold: { type: Sequelize.INTEGER, defaultValue: 0 },
      available: { type: Sequelize.INTEGER, defaultValue: 0 },
      import_price: { type: Sequelize.INTEGER },
    })

    await queryInterface.createTable('Discounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Products', key: 'id' },
      },
      discount_type: { type: Sequelize.ENUM('Percentage', 'Fixed') },
      discount_value: { type: Sequelize.DECIMAL(10, 2) },
      start_date: { type: Sequelize.DATE },
      end_date: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('UserPayments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      method: { type: Sequelize.ENUM('COD', 'Credit Card', 'PayPal') },
      provider: { type: Sequelize.STRING(50) },
      account_number: { type: Sequelize.STRING(100), unique: true },
      expiry_date: { type: Sequelize.DATE },
      coupon_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Coupons', key: 'id' },
      },
    })

    await queryInterface.createTable('Withdrawals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      amount: { type: Sequelize.INTEGER },
      account_number: { type: Sequelize.STRING(100) },
      bank_name: { type: Sequelize.STRING(100) },
      status: { type: Sequelize.ENUM('Pending', 'Approved', 'Rejected') },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('RevenueSettlement', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Orders', key: 'id' },
      },
      total_revenue: { type: Sequelize.INTEGER },
      platform_fee: { type: Sequelize.INTEGER },
      final_amount: { type: Sequelize.INTEGER },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('ShippingProviders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: { type: Sequelize.STRING(100), unique: true },
      contact: { type: Sequelize.STRING(100) },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('Shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Orders', key: 'id' },
      },
      provider_id: {
        type: Sequelize.INTEGER,
        references: { model: 'ShippingProviders', key: 'id' },
      },
      shipping_method: {
        type: Sequelize.ENUM('Standard', 'Express', 'Same Day'),
      },
      tracking_number: { type: Sequelize.STRING(50), unique: true },
      status: {
        type: Sequelize.ENUM(
          'Pending',
          'Picked Up',
          'In Transit',
          'Delivered',
          'Failed',
        ),
      },
      last_location: { type: Sequelize.STRING(255) },
      estimated_date: { type: Sequelize.DATEONLY },
      delivered_at: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('FailedShipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Shipments', key: 'id' },
      },
      reason: { type: Sequelize.STRING(255) },
      resolution: { type: Sequelize.ENUM('Rescheduled', 'Returned', 'Refunded') },
      processed_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },
}
