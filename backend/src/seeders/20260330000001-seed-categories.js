'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categoriesData = [
      { id: 1, name: 'Mũ' },
      { id: 2, name: 'Kính' },
      { id: 3, name: 'Hoa tai' }
    ]

    await queryInterface.bulkInsert('Categories', categoriesData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {})
  }
}
