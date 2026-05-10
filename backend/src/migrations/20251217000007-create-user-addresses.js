"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserAddresses", {
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
      address: { type: Sequelize.STRING(200) },
      city: { type: Sequelize.STRING(50) },
      state: { type: Sequelize.STRING(50) },
      country: { type: Sequelize.STRING(50) },
      zipcode: { type: Sequelize.STRING(20) },
      is_default: { type: Sequelize.BOOLEAN },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserAddresses");
  },
};
