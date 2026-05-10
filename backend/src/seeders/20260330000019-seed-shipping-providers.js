'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const shippingProvidersData = [
      {
        id: 1,
        name: 'Giao Hàng Nhanh',
        contact: '1900 1001',
        created_at: new Date('2026-01-01')
      },
      {
        id: 2,
        name: 'Giao Hàng Tiết Kiệm',
        contact: '1900 2001',
        created_at: new Date('2026-01-01')
      },
      {
        id: 3,
        name: 'ViettelPost',
        contact: '1900 8095',
        created_at: new Date('2026-01-01')
      },
      {
        id: 4,
        name: 'J&T Express',
        contact: '1900 1088',
        created_at: new Date('2026-01-01')
      }
    ]

    await queryInterface.bulkInsert('ShippingProviders', shippingProvidersData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ShippingProviders', null, {})
  }
}
