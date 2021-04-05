module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Subnets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      organizationId: {
        allowNull: false,
        unique: true,
        onDelete: 'CASCADE',
        references: {
          model: 'Organizations',
          key: 'id',
        },
        type: Sequelize.INTEGER,
      },
      vlan: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      subnet: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      base: {
        type: Sequelize.STRING,
      },
      mask: {
        type: Sequelize.STRING,
      },
      firstIP: {
        type: Sequelize.STRING,
      },
      lastIP: {
        type: Sequelize.STRING,
      },
      gateway: {
        type: Sequelize.STRING,
      },
      broadcast: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('Subnets');
  },
};
