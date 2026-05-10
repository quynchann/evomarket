"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Shipments", {
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
      provider_id: {
        type: Sequelize.INTEGER,
        references: { model: "ShippingProviders", key: "id" },
      },
      shipping_method: {
        type: Sequelize.ENUM("Standard", "Express", "Same Day"),
      },
      tracking_number: { type: Sequelize.STRING(50), unique: true },
      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Picked Up",
          "In Transit",
          "Delivered",
          "Failed"
        ),
      },
      last_location: { type: Sequelize.STRING(255) },
      estimated_date: { type: Sequelize.DATEONLY },
      delivered_at: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Shipments");
  },
};
