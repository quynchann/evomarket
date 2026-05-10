"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FailedShipments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        references: { model: "Shipments", key: "id" },
      },
      reason: { type: Sequelize.STRING(255) },
      resolution: {
        type: Sequelize.ENUM("Rescheduled", "Returned", "Refunded"),
      },
      processed_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("FailedShipments");
  },
};
