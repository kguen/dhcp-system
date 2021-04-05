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
        userId: usersToId.binhnn,
        type: 'image/jpeg',
        name: 'binhnn.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/binhnn.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.nguyenthanhthuy,
        type: 'image/jpeg',
        name: 'nguyenthanhthuy.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/nguyenthanhthuy.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.thuyhq,
        type: 'image/jpeg',
        name: 'thuyhq.jpg',
        data: fs.readFileSync(
          path.join(__dirname, '../static/default/thuyhq.jpg')
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async queryInterface => queryInterface.bulkDelete('Avatars', null, {}),
};
