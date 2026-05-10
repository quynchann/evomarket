"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FailedShipment extends Model {
    static associate(models) {
      FailedShipment.belongsTo(models.Shipment, { foreignKey: "shipment_id" });
    }
  }
  FailedShipment.init(
    {
      shipment_id: DataTypes.INTEGER,
      reason: DataTypes.STRING(255),
      resolution: DataTypes.ENUM("Rescheduled", "Returned", "Refunded"),
    },
    {
      sequelize,
      modelName: "FailedShipment",
      tableName: "FailedShipments",
      underscored: true,
      updatedAt: false,
      createdAt: "processed_at",
    },
  );
  return FailedShipment;
};
