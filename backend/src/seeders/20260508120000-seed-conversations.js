'use strict'

/**
 * Users từ 20260323072735-seed-user.js (thứ tự insert):
 * id 1 admin, 2-4 buyer, 5-7 seller
 * Hội thoại demo giữa user đầu mỗi role (và cặp buyer-seller quen thuộc).
 *
 * user1_id < user2_id để nhất quán với unique (user1_id, user2_id).
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t1 = new Date('2026-03-28 10:30:00')
    const t2 = new Date('2026-03-28 10:42:00')
    const t3 = new Date('2026-03-29 15:20:00')
    const t4 = new Date('2026-03-30 09:00:00')

    await queryInterface.bulkInsert(
      'Conversations',
      [
        {
          id: 1,
          user1_id: 2,
          user2_id: 5,
          last_message: 'Có ạ, shop hỗ trợ cả COD và thanh toán online.',
          last_message_at: t2,
          created_at: t1
        },
        {
          id: 2,
          user1_id: 3,
          user2_id: 6,
          last_message: 'Dạ có ạ, trong vòng 7 ngày kể từ khi nhận hàng.',
          last_message_at: new Date('2026-03-29 15:25:00'),
          created_at: t3
        },
        {
          id: 3,
          user1_id: 1,
          user2_id: 5,
          last_message:
            'Em muốn đổi địa chỉ giao hàng trước khi đơn được gửi ạ.',
          last_message_at: new Date('2026-03-31 14:10:00'),
          created_at: new Date('2026-03-31 14:00:00')
        },
        {
          id: 4,
          user1_id: 1,
          user2_id: 6,
          last_message: 'Cảm ơn admin, shop đã nhận được email xác minh.',
          last_message_at: new Date('2026-04-01 16:00:00'),
          created_at: t4
        },
        {
          id: 5,
          user1_id: 3,
          user2_id: 5,
          last_message: 'Dạ có ạ, trong vòng 5 ngày kể từ khi nhận hàng.',
          last_message_at: new Date('2026-04-01 16:00:00'),
          created_at: t4
        },
        {
          id: 6,
          user1_id: 4,
          user2_id: 5,
          last_message: 'Shop ơi',
          last_message_at: new Date('2026-04-01 16:00:00'),
          created_at: t4
        }
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Conversations',
      { id: { [Sequelize.Op.in]: [1, 2, 3, 4] } },
      {}
    )
  }
}
