"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {
    static associate(models) {
      Shipment.belongsTo(models.Order, { foreignKey: "order_id" });
      Shipment.belongsTo(models.ShippingProvider, {
        foreignKey: "provider_id",
      });
      Shipment.hasMany(models.FailedShipment, { foreignKey: "shipment_id" });
    }
  }
  Shipment.init(
    {
      order_id: DataTypes.INTEGER,
      provider_id: DataTypes.INTEGER,
      shipping_method: DataTypes.ENUM("Standard", "Express", "Same Day"),
      tracking_number: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      status: DataTypes.ENUM(
        "Pending",
        "Picked Up",
        "In Transit",
        "Delivered",
        "Failed",
      ),
      last_location: DataTypes.STRING(255),
      estimated_date: DataTypes.DATEONLY,
      delivered_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Shipment",
      tableName: "Shipments",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Shipment;
};
