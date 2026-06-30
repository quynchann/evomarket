"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: "order_id" });
      Payment.belongsTo(models.User, { foreignKey: "user_id" });
      Payment.hasOne(models.Refund, { foreignKey: "payment_id" });
    }
  }
  Payment.init(
    {
      order_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      method: DataTypes.ENUM("COD", "Online"),
      status: DataTypes.ENUM("Success", "Failed", "Pending"),
      vnpay_transaction_no: DataTypes.STRING(32),
      vnpay_transaction_date: DataTypes.STRING(20),
      refunded_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "Payments",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Payment;
};
