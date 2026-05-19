'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'birthday', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    })
    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.STRING(20),
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'gender')
    await queryInterface.removeColumn('Users', 'birthday')
  },
}
