"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        as: "Buyer",
        foreignKey: "user_id",
      });
      Order.belongsTo(models.Coupon, { foreignKey: "coupon_id" });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
      Order.hasOne(models.Payment, { foreignKey: "order_id" });
      Order.hasMany(models.Refund, { foreignKey: "order_id" });
      Order.hasMany(models.OrderStatusHistory, {
        foreignKey: "order_id",
        as: "OrderStatusHistories",
      });
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
      coupon_id: DataTypes.INTEGER,
      coupon_discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shipping_fee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shipping_method_ui: {
        type: DataTypes.STRING(20),
        defaultValue: "standard",
      },
      payment_method: DataTypes.ENUM("COD", "Online"),
      status: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: "PENDING_CONFIRMATION",
      },
      carrier_name: DataTypes.STRING(120),
      tracking_number: DataTypes.STRING(120),
      shipped_at: DataTypes.DATE,
      buyer_note: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
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
