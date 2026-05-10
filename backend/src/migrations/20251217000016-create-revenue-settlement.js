"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RevenueSettlement", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: "Orders", key: "id" },
      },
      total_revenue: { type: Sequelize.INTEGER },
      platform_fee: { type: Sequelize.INTEGER },
      final_amount: { type: Sequelize.INTEGER },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("RevenueSettlement");
  },
};
