const { Model } = require('sequelize');

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
          is: /(03|05|07|08|09|01[2689])([0-9]{8})\b/,
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
