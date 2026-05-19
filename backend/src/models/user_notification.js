"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserNotification extends Model {
    static associate(models) {
      UserNotification.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  UserNotification.init(
    {
      user_id: DataTypes.INTEGER,
      type: DataTypes.STRING(64),
      title: DataTypes.STRING(255),
      message: DataTypes.TEXT,
      metadata: DataTypes.JSON,
      read_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserNotification",
      tableName: "user_notifications",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return UserNotification;
};
