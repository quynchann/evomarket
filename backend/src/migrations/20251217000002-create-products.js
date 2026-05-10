"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: "Categories", key: "id" },
      },
      title: { type: Sequelize.STRING(250) },
      price: { type: Sequelize.INTEGER },
      profit_margin: { type: Sequelize.INTEGER },
      quantity: { type: Sequelize.STRING },
      thumbnail: { type: Sequelize.STRING(500) },
      images: { type: Sequelize.TEXT },
      description: { type: Sequelize.TEXT },
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
      deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      total_stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      sold: { type: Sequelize.INTEGER, defaultValue: 0 },
      available: { type: Sequelize.INTEGER, defaultValue: 0 },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
