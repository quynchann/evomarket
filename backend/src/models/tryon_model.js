"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TryonModel extends Model {
    static associate(models) {
      TryonModel.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }
  TryonModel.init(
    {
      product_id: DataTypes.INTEGER,
      model_url: DataTypes.STRING(500),
      type: DataTypes.ENUM("clothing", "shoes", "glasses", "hats", "jewelry"),
    },
    {
      sequelize,
      modelName: "TryonModel",
      tableName: "TryonModels",
      underscored: true,
      timestamps: false,
    },
  );
  return TryonModel;
};
