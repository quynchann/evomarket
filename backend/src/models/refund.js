"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Refund extends Model {
    static associate(models) {
      Refund.belongsTo(models.Payment, { foreignKey: "payment_id" });
      Refund.belongsTo(models.User, { foreignKey: "user_id" });
      Refund.belongsTo(models.Order, { foreignKey: "order_id" });
    }
  }
  Refund.init(
    {
      payment_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      reason: DataTypes.STRING(255),
      status: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    },
    {
      sequelize,
      modelName: "Refund",
      tableName: "Refunds",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Refund;
};
