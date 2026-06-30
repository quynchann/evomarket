'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class ProductImpressionStat extends Model {
    static associate(models) {
      ProductImpressionStat.belongsTo(models.Product, {
        foreignKey: 'product_id',
      })
    }
  }

  ProductImpressionStat.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      impressions: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      clicks: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ProductImpressionStat',
      tableName: 'ProductImpressionStats',
      underscored: true,
      timestamps: true,
      createdAt: false,
      updatedAt: 'updated_at',
    },
  )

  return ProductImpressionStat
}
