'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const failedShipmentsData = [
      {
        id: 1,
        shipment_id: 2,
        reason: 'Khách hàng không có mặt tại địa chỉ giao hàng',
        resolution: 'Rescheduled',
        processed_at: new Date('2026-03-24 09:00:00')
      }
    ]

    await queryInterface.bulkInsert('FailedShipments', failedShipmentsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FailedShipments', null, {})
  }
}
