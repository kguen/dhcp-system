const { Model } = require('sequelize');
const { phoneRegex } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Organization, {
        as: 'organization',
        foreignKey: 'organizationId',
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
      fullName: DataTypes.STRING,
      organizationId: DataTypes.INTEGER,
      position: DataTypes.STRING,
      phone: {
        is: phoneRegex,
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      isAdmin: DataTypes.BOOLEAN,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
