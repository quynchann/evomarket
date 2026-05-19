'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'shop_name', {
      type: Sequelize.STRING(120),
      allowNull: true,
      comment: 'Tên hiển thị shop (seller); null = dùng fullname',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'shop_name')
  },
}
