"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    static associate(models) {
      Discount.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }
  Discount.init(
    {
      product_id: DataTypes.INTEGER,
      discount_type: DataTypes.ENUM("Percentage", "Fixed"),
      discount_value: DataTypes.DECIMAL(10, 2),
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Discount",
      tableName: "Discounts",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Discount;
};
