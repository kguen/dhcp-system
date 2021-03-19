module.exports = {
  up: async queryInterface => {
    // map users' username to their Ids
    const usersToId = (
      await queryInterface.sequelize.query('SELECT id, username from Users;')
    )[0].reduce((acc, item) => {
      acc[item.username] = item.id;
      return acc;
    }, {});

    return queryInterface.bulkInsert('Devices', [
      {
        userId: usersToId.kiendh,
        macAddress: '00:05:A0:A5:AA:B0',
        ipAddress: '10.10.8.2',
        type: 'Máy tính để bàn',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.linhht,
        macAddress: '00:05:A0:A5:AA:B1',
        ipAddress: '10.10.8.3',
        type: 'Máy tính để bàn',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.nguyentrang,
        macAddress: '00:05:A0:A5:AA:B2',
        ipAddress: '10.10.8.4',
        type: 'Máy tính để bàn',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.quangminh,
        macAddress: '68:f7:28:a0:43:7a',
        ipAddress: '10.10.16.2',
        type: 'Máy tính xách tay',
        enabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: usersToId.thuantn,
        macAddress: '68:f7:28:a0:43:7b',
        ipAddress: '10.10.16.3',
        type: 'Máy tính xách tay',
        enabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async queryInterface => queryInterface.bulkDelete('Devices', null, {}),
};
