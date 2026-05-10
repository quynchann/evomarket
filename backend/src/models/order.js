"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
      Order.hasOne(models.Payment, { foreignKey: "order_id" });
      Order.hasMany(models.Refund, { foreignKey: "order_id" });
      Order.hasOne(models.RevenueSettlement, { foreignKey: "order_id" });
      Order.hasOne(models.Shipment, { foreignKey: "order_id" });
    }
  }
  Order.init(
    {
      user_id: DataTypes.INTEGER,
      fullname: DataTypes.STRING(100),
      email: DataTypes.STRING(150),
      phone: DataTypes.STRING(20),
      address: DataTypes.STRING(250),
      total_price: DataTypes.INTEGER,
      payment_method: DataTypes.ENUM("COD", "Online"),
      status: DataTypes.ENUM(
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ),
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
      underscored: true,
    },
  );
  return Order;
};
