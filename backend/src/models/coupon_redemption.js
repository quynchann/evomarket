"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouponRedemption extends Model {
    static associate(models) {
      CouponRedemption.belongsTo(models.User, { foreignKey: "user_id" });
      CouponRedemption.belongsTo(models.Coupon, { foreignKey: "coupon_id" });
      CouponRedemption.belongsTo(models.Order, { foreignKey: "order_id" });
    }
  }
  CouponRedemption.init(
    {
      user_id: DataTypes.INTEGER,
      coupon_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CouponRedemption",
      tableName: "CouponRedemptions",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return CouponRedemption;
};
