const { Model } = require('sequelize');

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
      password: DataTypes.STRING,
      position: DataTypes.STRING,
      phone: {
        is: /(03|05|07|08|09|01[2689])([0-9]{8})\b/,
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
