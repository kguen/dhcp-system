const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Avatar extends Model {
    static associate(models) {
      Avatar.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'userId',
        onDelete: 'CASCADE',
      });
    }
  }
  Avatar.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      data: DataTypes.BLOB('long'),
    },
    {
      sequelize,
      indexes: [{ unique: true, fields: ['userId'] }],
      modelName: 'Avatar',
    }
  );
  return Avatar;
};
