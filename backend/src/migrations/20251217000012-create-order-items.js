"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderItems", {
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
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: "Products", key: "id" },
      },
      variant_id: {
        type: Sequelize.INTEGER,
        references: { model: "ProductVariants", key: "id" },
      },
      price: { type: Sequelize.INTEGER },
      quantity: { type: Sequelize.INTEGER },
      total_price: { type: Sequelize.INTEGER },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderItems");
  },
};
