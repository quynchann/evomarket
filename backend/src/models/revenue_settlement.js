"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RevenueSettlement extends Model {
    static associate(models) {
      RevenueSettlement.belongsTo(models.User, { foreignKey: "seller_id" });
      RevenueSettlement.belongsTo(models.Order, { foreignKey: "order_id" });
    }
  }
  RevenueSettlement.init(
    {
      seller_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      total_revenue: DataTypes.INTEGER,
      platform_fee: DataTypes.INTEGER,
      final_amount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RevenueSettlement",
      tableName: "RevenueSettlement",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return RevenueSettlement;
};
