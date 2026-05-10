"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });
      OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: "variant_id" });
      OrderItem.belongsTo(models.User, {
        as: "Seller",
        foreignKey: "seller_id",
      });
    }
  }
  OrderItem.init(
    {
      order_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      variant_id: DataTypes.INTEGER,
      seller_id: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      total_price: DataTypes.INTEGER,
      selling_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Snapshot: Giá bán ra tại thời điểm đặt hàng",
      },
      import_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Snapshot: Giá vốn/nhập tại thời điểm đặt hàng",
      },
      platform_fee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Snapshot: Phí sàn (số tiền) tại thời điểm đặt hàng",
      },
      platform_fee_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: "Snapshot: Phí sàn (%) tại thời điểm đặt hàng",
      },
      product_title: {
        type: DataTypes.STRING(250),
        comment: "Snapshot: Tên sản phẩm tại thời điểm đặt hàng",
      },
      product_thumbnail: {
        type: DataTypes.STRING(500),
        comment: "Snapshot: Ảnh sản phẩm tại thời điểm đặt hàng",
      },
      variant_name: {
        type: DataTypes.STRING(250),
        comment: "Snapshot: Tên biến thể tại thời điểm đặt hàng",
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "OrderItems",
      underscored: true,
      timestamps: false,
    },
  );
  return OrderItem;
};
