"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("OrderItems", "seller_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Snapshot: ID của seller tại thời điểm đặt hàng"
    });

    await queryInterface.addConstraint("OrderItems", {
      fields: ["seller_id"],
      type: "foreign key",
      name: "fk_order_items_seller_id",
      references: {
        table: "Users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("OrderItems", "selling_price", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Snapshot: Giá bán ra tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "import_price", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Snapshot: Giá vốn/nhập tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "platform_fee", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Snapshot: Phí sàn (số tiền cố định) tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "platform_fee_percent", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Snapshot: Phí sàn (%) tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "product_title", {
      type: Sequelize.STRING(250),
      allowNull: true,
      comment: "Snapshot: Tên sản phẩm tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "product_thumbnail", {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: "Snapshot: Ảnh sản phẩm tại thời điểm đặt hàng"
    });

    await queryInterface.addColumn("OrderItems", "variant_name", {
      type: Sequelize.STRING(250),
      allowNull: true,
      comment: "Snapshot: Tên biến thể tại thời điểm đặt hàng"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("OrderItems", "fk_order_items_seller_id");
    await queryInterface.removeColumn("OrderItems", "seller_id");
    await queryInterface.removeColumn("OrderItems", "selling_price");
    await queryInterface.removeColumn("OrderItems", "import_price");
    await queryInterface.removeColumn("OrderItems", "platform_fee");
    await queryInterface.removeColumn("OrderItems", "platform_fee_percent");
    await queryInterface.removeColumn("OrderItems", "product_title");
    await queryInterface.removeColumn("OrderItems", "product_thumbnail");
    await queryInterface.removeColumn("OrderItems", "variant_name");
  }
};
