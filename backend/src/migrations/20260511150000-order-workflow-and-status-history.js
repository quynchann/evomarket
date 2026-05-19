"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "carrier_name", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "tracking_number", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "shipped_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.createTable("order_status_histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      from_status: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      to_status: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      actor_type: {
        type: Sequelize.ENUM("buyer", "seller", "system"),
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      note: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("order_status_histories", ["order_id"], {
      name: "idx_order_status_histories_order_id",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Orders MODIFY COLUMN status VARCHAR(40) NOT NULL DEFAULT 'PENDING_CONFIRMATION'
    `);

    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'PENDING_CONFIRMATION' WHERE status = 'Pending'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'PREPARING' WHERE status = 'Processing'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'SHIPPED' WHERE status = 'Shipped'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'COMPLETED' WHERE status = 'Delivered'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'CANCELLED' WHERE status = 'Cancelled'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'RETURN_REQUESTED' WHERE status = 'Returned'
    `);

    await queryInterface.sequelize.query(`
      UPDATE Orders SET shipped_at = COALESCE(updated_at, created_at) WHERE status = 'SHIPPED' AND shipped_at IS NULL
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO order_status_histories (order_id, from_status, to_status, actor_type, actor_id, note, created_at)
      SELECT id, NULL, status, 'system', NULL, 'Khởi tạo lịch sử sau migration luồng đơn hàng', created_at
      FROM Orders
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_status_histories");
    await queryInterface.removeColumn("Orders", "shipped_at");
    await queryInterface.removeColumn("Orders", "tracking_number");
    await queryInterface.removeColumn("Orders", "carrier_name");

    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Pending' WHERE status = 'PENDING_CONFIRMATION'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Processing' WHERE status IN ('CONFIRMED', 'PREPARING')
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Shipped' WHERE status = 'SHIPPED'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Delivered' WHERE status = 'COMPLETED'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Cancelled' WHERE status = 'CANCELLED'
    `);
    await queryInterface.sequelize.query(`
      UPDATE Orders SET status = 'Returned' WHERE status = 'RETURN_REQUESTED'
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE Orders MODIFY COLUMN status ENUM(
        'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
      ) NOT NULL
    `);
  },
};
