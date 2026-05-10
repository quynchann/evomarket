"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      fullname: { type: Sequelize.STRING(100) },
      email: { type: Sequelize.STRING(150) },
      phone: { type: Sequelize.STRING(20) },
      address: { type: Sequelize.STRING(250) },
      total_price: { type: Sequelize.INTEGER },
      payment_method: { type: Sequelize.ENUM("COD", "Online") },
      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Returned"
        ),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: { type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
