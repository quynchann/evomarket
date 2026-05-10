"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserPayments", {
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
      method: { type: Sequelize.ENUM("COD", "Credit Card", "PayPal") },
      provider: { type: Sequelize.STRING(50) },
      account_number: { type: Sequelize.STRING(100), unique: true },
      expiry_date: { type: Sequelize.DATEONLY },
      coupon_id: {
        type: Sequelize.INTEGER,
        references: { model: "Coupons", key: "id" },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserPayments");
  },
};
