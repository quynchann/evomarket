'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserAddresses', 'label', {
      type: Sequelize.STRING(100),
      allowNull: true
    })
    await queryInterface.addColumn('UserAddresses', 'recipient_fullname', {
      type: Sequelize.STRING(100),
      allowNull: true
    })
    await queryInterface.addColumn('UserAddresses', 'recipient_phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserAddresses', 'recipient_phone')
    await queryInterface.removeColumn('UserAddresses', 'recipient_fullname')
    await queryInterface.removeColumn('UserAddresses', 'label')
  }
}
