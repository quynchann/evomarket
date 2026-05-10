"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: "user_id" });
      Cart.belongsTo(models.Product, { foreignKey: "product_id" });
      Cart.belongsTo(models.ProductVariant, { foreignKey: "variant_id" });
    }
  }
  Cart.init(
    {
      userId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      variantId: DataTypes.INTEGER,
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "Cart",
      underscored: true,
      updatedAt: false,
      createdAt: "added_at",
    },
  );
  return Cart;
};
