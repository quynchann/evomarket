"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullname: {
        type: Sequelize.STRING(100),
      },
      email: {
        type: Sequelize.STRING(150),
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
      },
      role: {
        type: Sequelize.ENUM("buyer", "seller", "admin"),
        defaultValue: "buyer",
      },
      account_status: {
        type: Sequelize.ENUM("ACTIVE", "LOCKED"),
        defaultValue: "ACTIVE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
