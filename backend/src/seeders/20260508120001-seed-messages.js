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
          content:
            'Xin chào shop, em muốn hỏi sản phẩm này có size M không ạ?',
          is_read: false,
          created_at: t3
        },
        {
          conversation_id: 2,
          sender_id: 6,
          content:
            'Chào bạn! Shop có size M đầy đủ nhé. Bạn có thể xem bảng size chi tiết ở phần mô tả sản phẩm để chọn size phù hợp.',
          is_read: false,
          created_at: new Date('2026-03-29 15:25:00')
        },
        {
          conversation_id: 2,
          sender_id: 3,
          content: 'Shop có hỗ trợ đổi size nếu không vừa không ạ?',
          is_read: false,
          created_at: new Date('2026-03-29 15:30:00')
        },
        {
          conversation_id: 2,
          sender_id: 6,
          content:
            'Dạ có ạ, shop hỗ trợ đổi size miễn phí trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm cần còn nguyên tem mác nhé!',
          is_read: false,
          created_at: new Date('2026-03-29 15:35:00')
        },
        {
          conversation_id: 3,
          sender_id: 5,
          content:
            'Xin chào admin, shop cần hỗ trợ cập nhật địa chỉ giao hàng cho đơn #12345 ạ.',
          is_read: true,
          created_at: new Date('2026-03-31 14:00:00')
        },
        {
          conversation_id: 3,
          sender_id: 1,
          content:
            'Chào bạn, bạn vui lòng cung cấp địa chỉ mới để admin hỗ trợ cập nhật nhé.',
          is_read: true,
          created_at: new Date('2026-03-31 14:05:00')
        },
        {
          conversation_id: 3,
          sender_id: 5,
          content:
            'Dạ, địa chỉ mới là: 123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM. Em cảm ơn admin ạ.',
          is_read: true,
          created_at: new Date('2026-03-31 14:10:00')
        },
        {
          conversation_id: 3,
          sender_id: 1,
          content:
            'Admin đã cập nhật địa chỉ giao hàng thành công. Đơn hàng sẽ được giao đến địa chỉ mới nhé.',
          is_read: true,
          created_at: new Date('2026-03-31 14:15:00')
        },
        {
          conversation_id: 4,
          sender_id: 6,
          content:
            'Xin chào admin, shop đã đăng ký tài khoản seller nhưng chưa nhận được email xác minh. Admin có thể hỗ trợ kiểm tra giúp shop không ạ?',
          is_read: true,
          created_at: t4
        },
        {
          conversation_id: 4,
          sender_id: 1,
          content:
            'Chào bạn, admin đã kiểm tra và gửi lại email xác minh đến địa chỉ email đăng ký. Bạn vui lòng kiểm tra cả hộp thư spam nhé.',
          is_read: true,
          created_at: new Date('2026-03-30 10:00:00')
        },
        {
          conversation_id: 4,
          sender_id: 6,
          content:
            'Cảm ơn admin, shop đã nhận được email và xác minh thành công rồi ạ!',
          is_read: false,
          created_at: new Date('2026-04-01 16:00:00')
        },
        {
          conversation_id: 5,
          sender_id: 3,
          content:
            'Shop ơi, mình mua hôm trước nhưng sản phẩm bị lỗi. Mình muốn đổi trả được không ạ?',
          is_read: true,
          created_at: new Date('2026-03-30 11:00:00')
        },
        {
          conversation_id: 5,
          sender_id: 5,
          content:
            'Dạ shop xin lỗi bạn về trường hợp này. Shop hỗ trợ đổi trả trong vòng 7 ngày. Bạn vui lòng chụp ảnh sản phẩm lỗi và gửi shop để được hỗ trợ nhanh nhất nhé!',
          is_read: true,
          created_at: new Date('2026-03-30 11:10:00')
        },
        {
          conversation_id: 5,
          sender_id: 3,
          content: 'Vậy shop có hỗ trợ ship đổi luôn không ạ?',
          is_read: true,
          created_at: new Date('2026-03-30 11:15:00')
        },
        {
          conversation_id: 5,
          sender_id: 5,
          content:
            'Dạ với trường hợp sản phẩm lỗi, shop sẽ hỗ trợ miễn phí phí ship đổi trả cho bạn ạ.',
          is_read: true,
          created_at: new Date('2026-03-30 11:20:00')
        },
        {
          conversation_id: 6,
          sender_id: 4,
          content:
            'Shop cho mình hỏi sản phẩm này có các màu khác ngoài màu đen không ạ?',
          is_read: false,
          created_at: new Date('2026-04-01 16:00:00')
        },
        {
          conversation_id: 6,
          sender_id: 6,
          content:
            'Xin chào bạn! Sản phẩm này hiện có 3 màu: đen, trắng và xanh navy. Bạn có thể chọn màu ở phần tùy chọn sản phẩm nhé!',
          is_read: false,
          created_at: new Date('2026-04-01 16:05:00')
        },
        {
          conversation_id: 6,
          sender_id: 4,
          content: 'Cảm ơn shop, vậy mình đặt màu xanh navy ạ.',
          is_read: false,
          created_at: new Date('2026-04-01 16:10:00')
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
