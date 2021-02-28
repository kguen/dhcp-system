const { Model } = require('sequelize');
const { phoneRegex } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(models) {
      Organization.hasMany(models.User, {
        as: 'users',
        foreignKey: 'organizationId',
      });
    }
  }
  Organization.init(
    {
      abbreviation: DataTypes.STRING,
      fullName: DataTypes.STRING,
      phone: {
        validate: {
          is: phoneRegex,
        },
        type: DataTypes.STRING,
      },
      address: DataTypes.STRING,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Organization',
    }
  );
  return Organization;
};
