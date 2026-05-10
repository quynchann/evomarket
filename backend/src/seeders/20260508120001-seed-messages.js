'use strict'

/**
 * Users từ 20260323072735-seed-user.js:
 * id 1 admin, 2–4 buyer, 5–7 seller
 *
 * Conversations từ 20260508120000-seed-conversations.js (id 1–6).
 * sender_id luôn là user1_id hoặc user2_id của hội thoại tương ứng.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t1 = new Date('2026-03-28 10:30:00')
    const t2 = new Date('2026-03-28 10:42:00')
    const t3 = new Date('2026-03-29 15:20:00')
    const t4 = new Date('2026-03-30 09:00:00')

    await queryInterface.bulkInsert(
      'Messages',
      [
        {
          conversation_id: 1,
          sender_id: 2,
          content: 'Xin chào shop, sản phẩm này còn hàng không ạ?',
          is_read: true,
          created_at: t1
        },
        {
          conversation_id: 1,
          sender_id: 5,
          content:
            'Chào bạn, sản phẩm vẫn còn hàng đầy đủ. Bạn có thể đặt hàng nhé!',
          is_read: true,
          created_at: new Date('2026-03-28 10:35:00')
        },
        {
          conversation_id: 1,
          sender_id: 2,
          content: 'Cảm ơn shop, cho mình hỏi có ship COD không?',
          is_read: true,
          created_at: new Date('2026-03-28 10:40:00')
        },
        {
          conversation_id: 1,
          sender_id: 5,
          content: 'Có ạ, shop hỗ trợ cả COD và thanh toán online.',
          is_read: true,
          created_at: t2
        },
        {
          conversation_id: 2,
          sender_id: 3,
          content: 'Shop có hỗ trợ đổi size không ạ?',
          is_read: false,
          created_at: t3
        },
        {
          conversation_id: 2,
          sender_id: 6,
          content: 'Dạ có ạ, trong vòng 7 ngày kể từ khi nhận hàng.',
          is_read: false,
          created_at: new Date('2026-03-29 15:25:00')
        },
        {
          conversation_id: 3,
          sender_id: 5,
          content: 'Xin chào admin, shop cần hỗ trợ cập nhật đơn hàng ạ.',
          is_read: true,
          created_at: new Date('2026-03-31 14:00:00')
        },
        {
          conversation_id: 3,
          sender_id: 1,
          content: 'Chào bạn, bạn cần hỗ trợ phần nào cụ thể?',
          is_read: true,
          created_at: new Date('2026-03-31 14:05:00')
        },
        {
          conversation_id: 3,
          sender_id: 5,
          content:
            'Em muốn đổi địa chỉ giao hàng trước khi đơn được gửi ạ.',
          is_read: true,
          created_at: new Date('2026-03-31 14:10:00')
        },
        {
          conversation_id: 4,
          sender_id: 6,
          content:
            'Xin chào admin, shop cần hỗ trợ xác minh tài khoản seller.',
          is_read: true,
          created_at: t4
        },
        {
          conversation_id: 4,
          sender_id: 1,
          content:
            'Chào bạn, team đã gửi hướng dẫn qua email. Kiểm tra mục spam nếu chưa thấy nhé.',
          is_read: true,
          created_at: new Date('2026-03-30 10:00:00')
        },
        {
          conversation_id: 4,
          sender_id: 6,
          content: 'Cảm ơn admin, shop đã nhận được email xác minh.',
          is_read: false,
          created_at: new Date('2026-04-01 16:00:00')
        },
        {
          conversation_id: 5,
          sender_id: 3,
          content: 'Shop cho mình hỏi có đổi trả được không ạ?',
          is_read: true,
          created_at: new Date('2026-03-30 11:00:00')
        },
        {
          conversation_id: 5,
          sender_id: 5,
          content: 'Dạ có ạ, trong vòng 5 ngày kể từ khi nhận hàng.',
          is_read: true,
          created_at: new Date('2026-04-01 16:00:00')
        },
        {
          conversation_id: 6,
          sender_id: 4,
          content: 'Shop ơi',
          is_read: false,
          created_at: new Date('2026-04-01 16:00:00')
        }
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Messages',
      { conversation_id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] } },
      {}
    )
  }
}
