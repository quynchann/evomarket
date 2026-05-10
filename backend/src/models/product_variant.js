"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: "product_id" });
      ProductVariant.hasMany(models.Cart, { foreignKey: "variant_id" });
      ProductVariant.hasMany(models.OrderItem, { foreignKey: "variant_id" });
    }
  }
  ProductVariant.init(
    {
      product_id: DataTypes.INTEGER,
      size: DataTypes.STRING(50),
      color: DataTypes.STRING(50),
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "ProductVariants",
      underscored: true,
      timestamps: false,
    },
  );
  return ProductVariant;
};
