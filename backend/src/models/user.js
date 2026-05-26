"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserAddress, { foreignKey: "user_id" });
      User.hasMany(models.UserPayment, { foreignKey: "user_id" });
      User.hasMany(models.Order, { foreignKey: "user_id" });
      User.hasMany(models.Cart, { foreignKey: "user_id" });
      User.hasMany(models.Refund, { foreignKey: "user_id" });
      User.hasMany(models.Payment, { foreignKey: "user_id" });
      User.hasMany(models.Review, { foreignKey: "user_id" });
      User.hasMany(models.Withdrawal, { foreignKey: "seller_id" });
      User.hasMany(models.RevenueSettlement, { foreignKey: "seller_id" });
      
      // Chat relationships
      User.hasMany(models.Conversation, { as: "ConversationsAsUser1", foreignKey: "user1_id" });
      User.hasMany(models.Conversation, { as: "ConversationsAsUser2", foreignKey: "user2_id" });
      User.hasMany(models.Message, { as: "SentMessages", foreignKey: "sender_id" });
      User.hasMany(models.UserNotification, { foreignKey: "user_id" });
      User.hasMany(models.SellerShopVisit, { foreignKey: "seller_id", as: "ShopVisits" });
      User.hasMany(models.SellerShopFollow, {
        foreignKey: "seller_id",
        as: "ReceivedShopFollows",
      });
      User.hasMany(models.SellerShopFollow, {
        foreignKey: "follower_id",
        as: "GivenShopFollows",
      });
    }
  }
  User.init(
    {
      fullname: DataTypes.STRING(100),
      email: {
        type: DataTypes.STRING(150),
        unique: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      password: DataTypes.STRING(255),
      role: {
        type: DataTypes.ENUM("buyer", "seller", "admin"),
        defaultValue: "buyer",
      },
      account_status: {
        type: DataTypes.ENUM("ACTIVE", "LOCKED"),
        defaultValue: "ACTIVE",
      },
      avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      shop_name: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      notification_preferences: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      underscored: true,
      updatedAt: false,
    },
  );
  return User;
};
