"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {
    static associate(models) {
      OrderStatusHistory.belongsTo(models.Order, { foreignKey: "order_id" });
    }
  }
  OrderStatusHistory.init(
    {
      order_id: DataTypes.INTEGER,
      from_status: DataTypes.STRING(40),
      to_status: DataTypes.STRING(40),
      actor_type: DataTypes.ENUM("buyer", "seller", "system"),
      actor_id: DataTypes.INTEGER,
      note: DataTypes.STRING(500),
      metadata: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "OrderStatusHistory",
      tableName: "order_status_histories",
      underscored: true,
      updatedAt: false,
    },
  );
  return OrderStatusHistory;
};
