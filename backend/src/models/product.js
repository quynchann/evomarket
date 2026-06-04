"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: "category_id" });
      Product.belongsTo(models.User, { as: "Seller", foreignKey: "seller_id" });
      Product.hasMany(models.ProductVariant, { foreignKey: "product_id" });
      Product.hasMany(models.TryonModel, { foreignKey: "product_id" });
      Product.hasMany(models.ProductTryonInstance, { foreignKey: "product_id" });
      Product.hasOne(models.Inventory, { foreignKey: "product_id" });
      Product.hasMany(models.Discount, { foreignKey: "product_id" });
      Product.hasMany(models.Review, { foreignKey: "product_id" });
      Product.hasMany(models.OrderItem, { foreignKey: "product_id" });
      Product.hasMany(models.Cart, { foreignKey: "product_id" });
    }
  }
  Product.init(
    {
      category_id: DataTypes.INTEGER,
      seller_id: DataTypes.INTEGER,
      title: DataTypes.STRING(250),
      price: DataTypes.INTEGER,
      import_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      profit_margin: DataTypes.INTEGER,
      quantity: DataTypes.STRING,
      thumbnail: DataTypes.STRING(500),
      images: DataTypes.TEXT,
      description: DataTypes.TEXT,
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
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
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
      underscored: true,
    },
  );
  return Product;
};
