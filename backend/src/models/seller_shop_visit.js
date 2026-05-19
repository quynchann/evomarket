'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class SellerShopVisit extends Model {
    static associate(models) {
      SellerShopVisit.belongsTo(models.User, { foreignKey: 'seller_id', as: 'Seller' })
    }
  }
  SellerShopVisit.init(
    {
      seller_id: DataTypes.INTEGER,
      visit_date: DataTypes.DATEONLY,
      visitor_key: DataTypes.STRING(64),
    },
    {
      sequelize,
      modelName: 'SellerShopVisit',
      tableName: 'SellerShopVisits',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    },
  )
  return SellerShopVisit
}
