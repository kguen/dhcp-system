module.exports = {
  up: async queryInterface =>
    queryInterface.bulkInsert('Organizations', [
      {
        abbreviation: 'bgh',
        fullName: 'Ban Giám hiệu',
        phone: '01234567890',
        address: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        abbreviation: 'khoa-cntt',
        fullName: 'Khoa Công nghệ Thông tin',
        phone: '01234567890',
        address: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        abbreviation: 'ttmt',
        fullName: 'Trung tâm Máy tính',
        phone: '01234567890',
        address: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  down: async queryInterface =>
    queryInterface.bulkDelete('Organizations', null, {}),
};
