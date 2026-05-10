"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: "Orders", key: "id" },
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      amount: { type: Sequelize.INTEGER },
      method: { type: Sequelize.ENUM("COD", "Online") },
      status: { type: Sequelize.ENUM("Success", "Failed", "Pending") },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      coupons_id: {
        type: Sequelize.INTEGER,
        references: { model: "Coupons", key: "id" },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
