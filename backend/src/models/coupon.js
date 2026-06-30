"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.CouponRedemption, { foreignKey: "coupon_id" });
      Coupon.hasMany(models.Order, { foreignKey: "coupon_id" });
    }
  }
  Coupon.init(
    {
      code: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      discount_type: DataTypes.ENUM("Percentage", "Fixed"),
      discount_value: DataTypes.DECIMAL(10, 2),
      min_order_value: DataTypes.DECIMAL(10, 2),
      max_uses: DataTypes.INTEGER,
      used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      new_user_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "NULL = mã sàn; khác NULL = mã của shop (seller user id)",
      },
    },
    {
      sequelize,
      modelName: "Coupon",
      tableName: "Coupons",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Coupon;
};
