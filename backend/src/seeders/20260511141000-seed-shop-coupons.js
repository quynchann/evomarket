'use strict'

/**
 * Mã shop (seller_id từ user seller1/2/3) — code global unique, prefix theo shop
 * @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE role = 'seller' ORDER BY id ASC LIMIT 3`,
    )
    if (!Array.isArray(rows) || rows.length === 0) return

    const s = rows.map((r) => r.id)
    const [s1, s2, s3] = [s[0], s[1], s[2]]

    const coupons = []

    const now = new Date()
    if (s1 != null) {
      coupons.push(
        {
          code: 'SHOP1SAVE10K',
          discount_type: 'Fixed',
          discount_value: 10000.0,
          min_order_value: 100000.0,
          max_uses: 30,
          used_count: 0,
          start_date: new Date('2026-01-01'),
          end_date: new Date('2026-12-31'),
          new_user_only: false,
          seller_id: s1,
          created_at: now,
        },
        {
          code: 'SHOP1PCT15',
          discount_type: 'Percentage',
          discount_value: 15.0,
          min_order_value: 200000.0,
          max_uses: 50,
          used_count: 0,
          start_date: new Date('2026-02-01'),
          end_date: new Date('2026-12-31'),
          new_user_only: false,
          seller_id: s1,
          created_at: now,
        },
      )
    }
    if (s2 != null) {
      coupons.push({
        code: 'SHOP2SAVE10K',
        discount_type: 'Fixed',
        discount_value: 10000.0,
        min_order_value: 100000.0,
        max_uses: 30,
        used_count: 0,
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        new_user_only: false,
        seller_id: s2,
        created_at: now,
      })
    }
    if (s3 != null) {
      coupons.push({
        code: 'SHOP3SAVE15PCT',
        discount_type: 'Percentage',
        discount_value: 15.0,
        min_order_value: 200000.0,
        max_uses: 20,
        used_count: 0,
        start_date: new Date('2026-02-01'),
        end_date: new Date('2026-12-31'),
        new_user_only: false,
        seller_id: s3,
        created_at: now,
      })
    }

    if (coupons.length === 0) return

    await queryInterface.bulkInsert('Coupons', coupons, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Coupons',
      {
        code: {
          [Sequelize.Op.in]: [
            'SHOP1SAVE10K',
            'SHOP1PCT15',
            'SHOP2SAVE10K',
            'SHOP3SAVE15PCT',
          ],
        },
      },
      {},
    )
  },
}
