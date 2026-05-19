'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ordersData = [
      {
        id: 1,
        user_id: 2,
        fullname: 'Nguyễn Văn A',
        email: 'buyer1@test.com',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Hoàn Kiếm, Hà Nội',
        total_price: 500000,
        payment_method: 'Online',
        status: 'COMPLETED',
        created_at: new Date('2026-03-15'),
        updated_at: new Date('2026-03-20')
      },
      {
        id: 2,
        user_id: 3,
        fullname: 'Trần Thị B',
        email: 'buyer2@test.com',
        phone: '0902345678',
        address: '789 Lê Lợi, Quận 1, Hồ Chí Minh',
        total_price: 630000,
        payment_method: 'COD',
        status: 'Shipped',
        created_at: new Date('2026-03-20'),
        updated_at: new Date('2026-03-22')
      },
      {
        id: 3,
        user_id: 4,
        fullname: 'Lê Văn C',
        email: 'buyer3@test.com',
        phone: '0903456789',
        address: '321 Nguyễn Trãi, Hải Châu, Đà Nẵng',
        total_price: 450000,
        payment_method: 'Online',
        status: 'PREPARING',
        created_at: new Date('2026-03-25'),
        updated_at: new Date('2026-03-26')
      },
      {
        id: 4,
        user_id: 2,
        fullname: 'Nguyễn Văn A',
        email: 'buyer1@test.com',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Hoàn Kiếm, Hà Nội',
        total_price: 350000,
        payment_method: 'COD',
        status: 'PENDING_CONFIRMATION',
        created_at: new Date('2026-03-28'),
        updated_at: new Date('2026-03-28')
      },
      {
        id: 5,
        user_id: 3,
        fullname: 'Trần Thị B',
        email: 'buyer2@test.com',
        phone: '0902345678',
        address: '789 Lê Lợi, Quận 1, Hồ Chí Minh',
        total_price: 280000,
        payment_method: 'Online',
        status: 'CANCELLED',
        created_at: new Date('2026-03-10'),
        updated_at: new Date('2026-03-11')
      }
    ]

    await queryInterface.bulkInsert('Orders', ordersData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Orders', null, {})
  }
}
