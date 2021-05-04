const path = require('path');
const fs = require('fs');

module.exports = {
  up: async queryInterface => {
    // map users' username to their Ids
    const usersToId = (
      await queryInterface.sequelize.query('SELECT id, username from Users;')
    )[0].reduce((acc, item) => {
      acc[item.username] = item.id;
      return acc;
    }, {});

    return queryInterface.bulkInsert('Avatars', [
      {
        userId: usersToId.kiendh,
        type: 'image/jpeg',
        name: 'kiendh.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/kiendh.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.hanv,
        type: 'image/jpeg',
        name: 'hanv.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/hanv.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.thaina,
        type: 'image/jpeg',
        name: 'thaina.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/thaina.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.trinhcd,
        type: 'image/jpeg',
        name: 'trinhcd.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/trinhcd.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async queryInterface => queryInterface.bulkDelete('Avatars', null, {}),
};
