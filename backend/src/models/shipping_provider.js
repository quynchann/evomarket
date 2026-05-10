"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShippingProvider extends Model {
    static associate(models) {
      ShippingProvider.hasMany(models.Shipment, { foreignKey: "provider_id" });
    }
  }
  ShippingProvider.init(
    {
      name: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      contact: DataTypes.STRING(100),
    },
    {
      sequelize,
      modelName: "ShippingProvider",
      tableName: "ShippingProviders",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return ShippingProvider;
};
