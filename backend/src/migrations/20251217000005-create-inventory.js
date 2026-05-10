"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Inventory", {
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
      total_stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      sold: { type: Sequelize.INTEGER, defaultValue: 0 },
      available: { type: Sequelize.INTEGER, defaultValue: 0 },
      import_price: { type: Sequelize.INTEGER },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Inventory");
  },
};
