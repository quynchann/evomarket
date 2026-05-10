"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, { as: "Sender", foreignKey: "sender_id" });
      Chat.belongsTo(models.User, {
        as: "Receiver",
        foreignKey: "receiver_id",
      });
    }
  }
  Chat.init(
    {
      sender_id: DataTypes.INTEGER,
      receiver_id: DataTypes.INTEGER,
      message: DataTypes.TEXT,
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "Chats",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Chat;
};
