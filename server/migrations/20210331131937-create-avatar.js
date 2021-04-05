module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'Avatars',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          userId: {
            allowNull: false,
            unique: true,
            onDelete: 'CASCADE',
            references: {
              model: 'Users',
              key: 'id',
            },
            type: Sequelize.INTEGER,
          },
          type: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          data: {
            type: Sequelize.BLOB('long'),
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction }
      );
      await queryInterface.addIndex('Avatars', ['userId'], { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async queryInterface => {
    await queryInterface.dropTable('Avatars');
  },
};
