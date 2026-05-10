"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add index for conversation_id to improve query performance
    await queryInterface.addIndex("Messages", ["conversation_id"], {
      name: "idx_messages_conversation_id",
    });

    // Add index for sender_id
    await queryInterface.addIndex("Messages", ["sender_id"], {
      name: "idx_messages_sender_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Messages", "idx_messages_sender_id");
    await queryInterface.removeIndex(
      "Messages",
      "idx_messages_conversation_id"
    );
    await queryInterface.dropTable("Messages");
  },
};
