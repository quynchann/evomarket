'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const reviewsData = [
      {
        id: 1,
        user_id: 2,
        product_id: 1,
        rating: 5,
        comment: 'Mũ form đẹp, vải mát. Shop giao nhanh, đúng màu!',
        is_reported: false,
        report_reason: null,
        report_status: null,
        created_at: new Date('2026-03-21')
      },
      {
        id: 2,
        user_id: 3,
        product_id: 2,
        rating: 4,
        comment: 'Kính chống ánh sáng xanh dùng làm việc máy tính thấy dễ chịu. Gọng hơi chật với mặt bé.',
        is_reported: false,
        report_reason: null,
        report_status: null,
        created_at: new Date('2026-03-23')
      },
      {
        id: 3,
        user_id: 2,
        product_id: 8,
        rating: 5,
        comment: 'Kính râm đẹp, giá hợp lý, nhẹ. Sẽ mua thêm màu khác.',
        is_reported: false,
        report_reason: null,
        report_status: null,
        created_at: new Date('2026-03-21')
      },
      {
        id: 4,
        user_id: 4,
        product_id: 5,
        rating: 3,
        comment: 'Vòng cổ xinh nhưng khóa hơi nhỏ, cần cẩn thận khi tháo.',
        is_reported: true,
        report_reason: 'Ngôn ngữ không phù hợp',
        report_status: 'Pending',
        created_at: new Date('2026-03-27')
      }
    ]

    await queryInterface.bulkInsert('Reviews', reviewsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {})
  }
}
