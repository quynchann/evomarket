"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    static associate(models) {
      Withdrawal.belongsTo(models.User, { foreignKey: "seller_id" });
    }
  }
  Withdrawal.init(
    {
      seller_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      account_number: DataTypes.STRING(100),
      bank_name: DataTypes.STRING(100),
      status: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    },
    {
      sequelize,
      modelName: "Withdrawal",
      tableName: "Withdrawals",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Withdrawal;
};
