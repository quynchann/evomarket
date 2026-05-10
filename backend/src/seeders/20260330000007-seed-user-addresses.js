'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const addressesData = [
      {
        id: 1,
        user_id: 2,
        address: '123 Nguyễn Huệ',
        city: 'Hà Nội',
        state: 'Hoàn Kiếm',
        country: 'Việt Nam',
        zipcode: '100000',
        is_default: true
      },
      {
        id: 2,
        user_id: 2,
        address: '456 Trần Phú',
        city: 'Hà Nội',
        state: 'Ba Đình',
        country: 'Việt Nam',
        zipcode: '100000',
        is_default: false
      },
      {
        id: 3,
        user_id: 3,
        address: '789 Lê Lợi',
        city: 'Hồ Chí Minh',
        state: 'Quận 1',
        country: 'Việt Nam',
        zipcode: '700000',
        is_default: true
      },
      {
        id: 4,
        user_id: 4,
        address: '321 Nguyễn Trãi',
        city: 'Đà Nẵng',
        state: 'Hải Châu',
        country: 'Việt Nam',
        zipcode: '550000',
        is_default: true
      },
      {
        id: 5,
        user_id: 5,
        address: '555 Hùng Vương',
        city: 'Hà Nội',
        state: 'Cầu Giấy',
        country: 'Việt Nam',
        zipcode: '100000',
        is_default: true
      },
      {
        id: 6,
        user_id: 6,
        address: '777 Lý Thường Kiệt',
        city: 'Hồ Chí Minh',
        state: 'Quận 10',
        country: 'Việt Nam',
        zipcode: '700000',
        is_default: true
      },
      {
        id: 7,
        user_id: 7,
        address: '999 Trường Chinh',
        city: 'Hà Nội',
        state: 'Thanh Xuân',
        country: 'Việt Nam',
        zipcode: '100000',
        is_default: true
      }
    ]

    await queryInterface.bulkInsert('UserAddresses', addressesData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserAddresses', null, {})
  }
}
