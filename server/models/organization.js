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
      abbreviation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      phone: {
        validate: {
          isPhoneOrEmpty(value) {
            if (!!value && !phoneRegex.test(value)) {
              throw new Error('Phone number is invalid');
            }
          },
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
