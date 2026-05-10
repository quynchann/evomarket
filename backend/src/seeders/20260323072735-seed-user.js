'use strict'
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash('12345678', 10)
    const usersData = []

    const avatar = (name) =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

    usersData.push(
      {
        fullname: 'Admin User',
        email: 'admin@evomarket.com',
        phone_number: '0900000000',
        password: password,
        role: 'admin',
        account_status: 'ACTIVE',
        avatar: avatar('Admin User')
      },
      {
        fullname: 'Nguyễn Văn A',
        email: 'buyer1@test.com',
        phone_number: '0901234567',
        password: password,
        role: 'buyer',
        account_status: 'ACTIVE',
        avatar: avatar('Nguyễn Văn A')
      },
      {
        fullname: 'Trần Thị B',
        email: 'buyer2@test.com',
        phone_number: '0902345678',
        password: password,
        role: 'buyer',
        account_status: 'ACTIVE',
        avatar: avatar('Trần Thị B')
      },
      {
        fullname: 'Lê Văn C',
        email: 'buyer3@test.com',
        phone_number: '0903456789',
        password: password,
        role: 'buyer',
        account_status: 'ACTIVE',
        avatar: avatar('Lê Văn C')
      },
      {
        fullname: 'Phạm Thị D',
        email: 'seller1@test.com',
        phone_number: '0911111111',
        password: password,
        role: 'seller',
        account_status: 'ACTIVE',
        avatar: avatar('Phạm Thị D')
      },
      {
        fullname: 'Hoàng Văn E',
        email: 'seller2@test.com',
        phone_number: '0922222222',
        password: password,
        role: 'seller',
        account_status: 'ACTIVE',
        avatar: avatar('Hoàng Văn E')
      },
      {
        fullname: 'Võ Thị F',
        email: 'seller3@test.com',
        phone_number: '0933333333',
        password: password,
        role: 'seller',
        account_status: 'ACTIVE',
        avatar: avatar('Võ Thị F')
      }
    )

    await queryInterface.bulkInsert('Users', usersData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
