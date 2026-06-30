'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [products] = await queryInterface.sequelize.query(`
      SELECT id, created_at
      FROM Products
      WHERE deleted = 0
      ORDER BY created_at ASC, id ASC
    `)

    if (!products.length) return

    const rows = products
      .map((p, idx) => {
        // Product cũ có nhiều dữ liệu hơn để thuật toán ổn định,
        // product mới thêm sau này sẽ có 0 impression => dễ test exploration.
        const impressions = 80 + idx * 12
        const ctr = 0.06 + (Number(p.id) % 6) * 0.01 // 6%..11%
        const clicks = Math.min(impressions, Math.max(1, Math.round(impressions * ctr)))
        return {
          product_id: Number(p.id),
          impressions,
          clicks,
          updated_at: new Date(),
        }
      })

    if (!rows.length) return

    await queryInterface.bulkInsert('ProductImpressionStats', rows, {
      updateOnDuplicate: ['impressions', 'clicks', 'updated_at'],
    })
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ProductImpressionStats', null, {})
  },
}
