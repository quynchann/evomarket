"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cart", {
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
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: "Products", key: "id" },
      },
      variant_id: {
        type: Sequelize.INTEGER,
        references: { model: "ProductVariants", key: "id" },
      },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      added_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Cart");
  },
};
