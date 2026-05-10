"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      // Refresh Token thuộc về 1 User
      RefreshToken.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  RefreshToken.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      device_info: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "RefreshToken",
      tableName: "RefreshTokens",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return RefreshToken;
};
