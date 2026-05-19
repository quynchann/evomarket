"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reviews", "order_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Reviews", "order_item_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addIndex("Reviews", ["order_id"], {
      name: "reviews_order_id_idx",
    });
    await queryInterface.addConstraint("Reviews", {
      fields: ["order_item_id"],
      type: "unique",
      name: "reviews_order_item_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("Reviews", "reviews_order_item_id_unique");
    await queryInterface.removeIndex("Reviews", "reviews_order_id_idx");
    await queryInterface.removeColumn("Reviews", "order_item_id");
    await queryInterface.removeColumn("Reviews", "order_id");
  },
};
