"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "seller_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("Products", {
      fields: ["seller_id"],
      type: "foreign key",
      name: "fk_products_seller_id",
      references: {
        table: "Users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("Products", ["seller_id"], {
      name: "idx_products_seller_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Products", "idx_products_seller_id");
    await queryInterface.removeConstraint("Products", "fk_products_seller_id");
    await queryInterface.removeColumn("Products", "seller_id");
  },
};

