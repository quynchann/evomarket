"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Refunds", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payment_id: {
        type: Sequelize.INTEGER,
        references: { model: "Payments", key: "id" },
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: "Orders", key: "id" },
      },
      amount: { type: Sequelize.INTEGER },
      reason: { type: Sequelize.STRING(255) },
      status: { type: Sequelize.ENUM("Pending", "Approved", "Rejected") },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Refunds");
  },
};
