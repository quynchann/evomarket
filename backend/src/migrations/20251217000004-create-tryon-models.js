"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TryonModels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: "Products", key: "id" },
      },
      model_url: { type: Sequelize.STRING(500) },
      type: {
        type: Sequelize.ENUM("clothing", "shoes", "glasses", "hats", "jewelry"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TryonModels");
  },
};
