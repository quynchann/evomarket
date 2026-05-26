"use strict";
const { Model } = require("sequelize");
const { makePaginate } = require("sequelize-cursor-pagination");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Quan hệ với Conversation
      Message.belongsTo(models.Conversation, {
        foreignKey: "conversation_id",
        as: "Conversation",
      });

      // Quan hệ với User (Sender)
      Message.belongsTo(models.User, {
        as: "Sender",
        foreignKey: "sender_id",
      });
    }
  }
  Message.init(
    {
      conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      message_type: {
        type: DataTypes.ENUM('text', 'image', 'audio', 'file'),
        allowNull: false,
        defaultValue: 'text',
      },
      media_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "Messages",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    }
  );

  Message.paginate = makePaginate(Message);

  return Message;
};
