module.exports = {
  up: async queryInterface =>
    queryInterface.bulkInsert('Users', [
      {
        username: 'binhnn',
        fullName: 'Nguyễn Ngọc Bình',
        position: 'Hiệu trưởng',
        email: 'binhnn@vnu.edu.vn',
        phone: '01234567890',
        isAdmin: false,
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'kiendh',
        fullName: 'Đỗ Hoàng Kiên',
        position: 'Quản trị viên',
        email: 'kiendh@vnu.edu.vn',
        phone: '01234567890',
        isAdmin: true,
        organizationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'haidt',
        fullName: 'Đặng Thanh Hải',
        position: 'Giảng viên',
        email: 'haidt@vnu.edu.vn',
        phone: '01234567890',
        isAdmin: false,
        organizationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  down: async queryInterface => queryInterface.bulkDelete('Users', null, {}),
};
