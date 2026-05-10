'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categoriesData = [
      { id: 1, name: 'Mũ' },
      { id: 2, name: 'Kính' },
      { id: 3, name: 'Hoa tai' },
      { id: 4, name: 'Vòng cổ' }
    ]

    await queryInterface.bulkInsert('Categories', categoriesData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {})
  }
}
