"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(255),
      },
      message: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      metadata: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      read_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("user_notifications", ["user_id"], {
      name: "idx_user_notifications_user_id",
    });
    await queryInterface.addIndex("user_notifications", ["user_id", "read_at"], {
      name: "idx_user_notifications_user_read",
    });
    await queryInterface.addIndex("user_notifications", ["created_at"], {
      name: "idx_user_notifications_created_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_notifications");
  },
};
