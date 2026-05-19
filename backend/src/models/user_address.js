"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    static associate(models) {
      UserAddress.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  UserAddress.init(
    {
      user_id: DataTypes.INTEGER,
      label: DataTypes.STRING(100),
      recipient_fullname: DataTypes.STRING(100),
      recipient_phone: DataTypes.STRING(20),
      address: DataTypes.STRING(200),
      city: DataTypes.STRING(50),
      state: DataTypes.STRING(50),
      country: DataTypes.STRING(50),
      zipcode: DataTypes.STRING(20),
      is_default: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "UserAddress",
      tableName: "UserAddresses",
      underscored: true,
      timestamps: false,
    },
  );
  return UserAddress;
};
