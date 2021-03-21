const { Model } = require('sequelize');
const { macRegex } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'userId',
      });
    }
  }
  Device.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
        },
      },
      macAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          notEmpty: true,
          is: macRegex,
        },
      },
      type: DataTypes.STRING,
      ipAddress: DataTypes.STRING,
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Device',
    }
  );
  return Device;
};
