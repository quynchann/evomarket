'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const shipmentsData = [
      {
        id: 1,
        order_id: 1,
        provider_id: 1,
        shipping_method: 'Express',
        tracking_number: 'GHN123456789',
        status: 'Delivered',
        last_location: 'Hà Nội',
        estimated_date: '2026-03-18',
        delivered_at: new Date('2026-03-20 14:30:00'),
        created_at: new Date('2026-03-15')
      },
      {
        id: 2,
        order_id: 2,
        provider_id: 2,
        shipping_method: 'Standard',
        tracking_number: 'GHTK987654321',
        status: 'In Transit',
        last_location: 'Bình Dương',
        estimated_date: '2026-03-25',
        delivered_at: null,
        created_at: new Date('2026-03-20')
      },
      {
        id: 3,
        order_id: 3,
        provider_id: 3,
        shipping_method: 'Express',
        tracking_number: 'VTP555666777',
        status: 'Picked Up',
        last_location: 'Đà Nẵng',
        estimated_date: '2026-03-28',
        delivered_at: null,
        created_at: new Date('2026-03-26')
      },
      {
        id: 4,
        order_id: 4,
        provider_id: 1,
        shipping_method: 'Standard',
        tracking_number: 'GHN111222333',
        status: 'Pending',
        last_location: null,
        estimated_date: '2026-04-02',
        delivered_at: null,
        created_at: new Date('2026-03-28')
      }
    ]

    await queryInterface.bulkInsert('Shipments', shipmentsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Shipments', null, {})
  }
}
