"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }
  Inventory.init(
    {
      product_id: DataTypes.INTEGER,
      total_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      available: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      import_price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Inventory",
      tableName: "Inventory",
      underscored: true,
      timestamps: false,
    },
  );
  return Inventory;
};
