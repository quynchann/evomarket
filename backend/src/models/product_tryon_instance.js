'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class ProductTryonInstance extends Model {
    static associate(models) {
      ProductTryonInstance.belongsTo(models.Product, {
        foreignKey: 'product_id',
      })
    }
  }

  ProductTryonInstance.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      model_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      anchor_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      transform_config: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ProductTryonInstance',
      tableName: 'ProductTryonInstances',
      underscored: true,
      timestamps: false,
    },
  )

  return ProductTryonInstance
}
