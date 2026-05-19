"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: "user_id" });
      Review.belongsTo(models.Product, { foreignKey: "product_id" });
      Review.belongsTo(models.Order, { foreignKey: "order_id" });
      Review.belongsTo(models.OrderItem, { foreignKey: "order_item_id" });
    }
  }
  Review.init(
    {
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      order_item_id: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      is_reported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      report_reason: DataTypes.STRING(255),
      report_status: DataTypes.ENUM("Pending", "Reviewed", "Rejected"),
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Review;
};
