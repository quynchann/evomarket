'use strict'
const { Model } = require('sequelize')
const { makePaginate } = require('sequelize-cursor-pagination')

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      // Quan hệ với User
      Conversation.belongsTo(models.User, {
        as: 'User1',
        foreignKey: 'user1_id'
      })
      Conversation.belongsTo(models.User, {
        as: 'User2',
        foreignKey: 'user2_id'
      })

      // Quan hệ với Messages
      Conversation.hasMany(models.Message, {
        foreignKey: 'conversation_id',
        as: 'Messages'
      })
    }
  }
  Conversation.init(
    {
      user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      last_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Conversation',
      tableName: 'Conversations',
      underscored: true,
      updatedAt: false,
      createdAt: 'created_at'
    }
  )

  Conversation.paginate = makePaginate(Conversation)

  return Conversation
}
