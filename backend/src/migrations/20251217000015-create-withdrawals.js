"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Withdrawals", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      amount: { type: Sequelize.INTEGER },
      account_number: { type: Sequelize.STRING(100) },
      bank_name: { type: Sequelize.STRING(100) },
      status: { type: Sequelize.ENUM("Pending", "Approved", "Rejected") },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Withdrawals");
  },
};
