const { Model } = require('sequelize');
const { v4 } = require('is-cidr');

module.exports = (sequelize, DataTypes) => {
  class Subnet extends Model {
    static associate(models) {
      Subnet.belongsTo(models.Organization, {
        as: 'organization',
        foreignKey: 'organizationId',
        onDelete: 'CASCADE',
      });
    }
  }
  Subnet.init(
    {
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
        },
      },
      vlan: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      subnet: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
          isCIDR(value) {
            if (!v4(value)) {
              throw new Error(
                'Subnet address is not a valid CIDR IPv4 address!'
              );
            }
          },
        },
      },
      base: DataTypes.STRING,
      mask: DataTypes.STRING,
      firstIP: DataTypes.STRING,
      lastIP: DataTypes.STRING,
      broadcast: DataTypes.STRING,
      gateway: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Subnet',
    }
  );
  return Subnet;
};
