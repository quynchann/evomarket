'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cập nhật shop_name cho các seller chưa có
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET shop_name = CASE
        WHEN email = 'seller1@test.com' THEN 'Shop Phạm Thị D'
        WHEN email = 'seller2@test.com' THEN 'Shop Hoàng Văn E'
        WHEN email = 'seller3@test.com' THEN 'Shop Võ Thị F'
        ELSE CONCAT('Shop ', fullname)
      END
      WHERE role = 'seller' AND (shop_name IS NULL OR shop_name = '')
    `)
  },

  async down(queryInterface, Sequelize) {
    // Reset shop_name về null
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET shop_name = NULL
      WHERE role = 'seller' AND email IN ('seller1@test.com', 'seller2@test.com', 'seller3@test.com')
    `)
  }
}
