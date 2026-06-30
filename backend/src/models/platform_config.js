"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PlatformConfig extends Model {
    static associate(models) {
      // No associations
    }
  }
  PlatformConfig.init(
    {
      config_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      config_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PlatformConfig",
      tableName: "PlatformConfig",
      underscored: true,
    },
  );
  return PlatformConfig;
};
