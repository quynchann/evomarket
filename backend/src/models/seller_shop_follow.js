'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class SellerShopFollow extends Model {
    static associate(models) {
      SellerShopFollow.belongsTo(models.User, {
        foreignKey: 'seller_id',
        as: 'SellerUser',
      })
      SellerShopFollow.belongsTo(models.User, {
        foreignKey: 'follower_id',
        as: 'FollowerUser',
      })
    }
  }
  SellerShopFollow.init(
    {
      seller_id: DataTypes.INTEGER,
      follower_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'SellerShopFollow',
      tableName: 'SellerShopFollows',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    },
  )
  return SellerShopFollow
}
