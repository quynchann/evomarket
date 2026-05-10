"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPayment extends Model {
    static associate(models) {
      UserPayment.belongsTo(models.User, { foreignKey: "user_id" });
      UserPayment.belongsTo(models.Coupon, { foreignKey: "coupon_id" });
    }
  }
  UserPayment.init(
    {
      user_id: DataTypes.INTEGER,
      method: DataTypes.ENUM("COD", "Credit Card", "PayPal"),
      provider: DataTypes.STRING(50),
      account_number: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      expiry_date: DataTypes.DATEONLY,
      coupon_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserPayment",
      tableName: "UserPayments",
      underscored: true,
      timestamps: false,
    },
  );
  return UserPayment;
};
