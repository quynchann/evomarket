"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: "category_id" });
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING(100),
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
      underscored: true,
      timestamps: false, // No created_at/updated_at in schema for Categories? Wait, schema says:
      // Table categories { id, name } - no timestamps mentioned.
      // But usually Sequelize adds them. The user schema didn't specify them for Categories.
      // I'll assume no timestamps for Categories based on user input.
    },
  );
  return Category;
};
