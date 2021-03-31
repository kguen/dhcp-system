const { Model } = require('sequelize');
const { phoneRegex } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Organization, {
        as: 'organization',
        foreignKey: 'organizationId',
      });
      User.hasMany(models.Device, {
        as: 'devices',
        foreignKey: 'userId',
      });
      User.hasOne(models.Avatar, {
        as: 'avatar',
        foreignKey: 'userId',
      });
    }
  }
  User.init(
    {
      username: {
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
      organizationId: DataTypes.INTEGER,
      position: DataTypes.STRING,
      phone: {
        type: DataTypes.STRING,
        validate: {
          is: phoneRegex,
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      isAdmin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
