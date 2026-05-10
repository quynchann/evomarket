"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Coupons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: { type: Sequelize.STRING(50), unique: true },
      discount_type: { type: Sequelize.ENUM("Percentage", "Fixed") },
      discount_value: { type: Sequelize.DECIMAL(10, 2) },
      min_order_value: { type: Sequelize.DECIMAL(10, 2) },
      max_uses: { type: Sequelize.INTEGER },
      used_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      start_date: { type: Sequelize.DATE },
      end_date: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Coupons");
  },
};
