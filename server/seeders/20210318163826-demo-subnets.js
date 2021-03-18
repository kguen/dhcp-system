const { getSubnetData } = require('../utils');

module.exports = {
  up: async queryInterface => {
    // map orgs' abbreviation to their Ids
    const orgsToId = (
      await queryInterface.sequelize.query(
        'SELECT id, abbreviation from Organizations;'
      )
    )[0].reduce((acc, item) => {
      acc[item.abbreviation] = item.id;
      return acc;
    }, {});

    return queryInterface.bulkInsert('Subnets', [
      {
        organizationId: orgsToId.bgh,
        vlan: 'VLAN-bgh',
        ...getSubnetData('10.10.224.0/26'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        organizationId: orgsToId['khoa-cntt'],
        vlan: 'VLAN-khoa-cntt',
        ...getSubnetData('10.10.16.0/22'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        organizationId: orgsToId['khoa-dtvt'],
        vlan: 'VLAN-khoa-dtvt',
        ...getSubnetData('10.10.224.192/26'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        organizationId: orgsToId['trungtam-maytinh'],
        vlan: 'VLAN-trungtam-maytinh',
        ...getSubnetData('10.10.8.0/21'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async queryInterface => queryInterface.bulkDelete('Subnets', null, {}),
};
