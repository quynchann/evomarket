'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy seller_id từ bảng Products
    const [productRows] = await queryInterface.sequelize.query(`
      SELECT id, seller_id, title, thumbnail, price, import_price 
      FROM Products 
      WHERE id IN (1, 2, 3, 4, 5, 6, 8)
    `)
    
    const productMap = {}
    productRows.forEach(p => {
      productMap[p.id] = p
    })

    // Phí sàn mặc định: 5%
    const platformFeePercent = 5.00
    
    /**
     * SNAPSHOT DATA - Đóng băng thông tin tại thời điểm đặt hàng
     * 
     * Mỗi OrderItem lưu:
     * - selling_price: Giá bán tại thời điểm đó
     * - import_price: Giá vốn tại thời điểm đó
     * - platform_fee: Phí sàn (số tiền) = selling_price * quantity * 5%
     * - platform_fee_percent: Phí sàn (%)
     * - product_title: Tên sản phẩm
     * - product_thumbnail: Ảnh sản phẩm
     * - seller_id: ID của seller
     */
    const orderItemsData = [
      // Order 1
      { 
        id: 1, 
        order_id: 1, 
        product_id: 1, 
        variant_id: 2, 
        seller_id: productMap[1].seller_id,
        price: 150000, 
        quantity: 2, 
        total_price: 300000,
        selling_price: 150000,
        import_price: 120000,
        platform_fee: Math.round(300000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[1].title,
        product_thumbnail: productMap[1].thumbnail,
        variant_name: 'Màu trắng'
      },
      { 
        id: 2, 
        order_id: 1, 
        product_id: 8, 
        variant_id: 29, 
        seller_id: productMap[8].seller_id,
        price: 180000, 
        quantity: 1, 
        total_price: 180000,
        selling_price: 180000,
        import_price: 140000,
        platform_fee: Math.round(180000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[8].title,
        product_thumbnail: productMap[8].thumbnail,
        variant_name: 'Màu đen'
      },
      
      // Order 2
      { 
        id: 3, 
        order_id: 2, 
        product_id: 2, 
        variant_id: 6, 
        seller_id: productMap[2].seller_id,
        price: 250000, 
        quantity: 1, 
        total_price: 250000,
        selling_price: 250000,
        import_price: 200000,
        platform_fee: Math.round(250000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[2].title,
        product_thumbnail: productMap[2].thumbnail,
        variant_name: 'Gọng vàng'
      },
      { 
        id: 4, 
        order_id: 2, 
        product_id: 6, 
        variant_id: 23, 
        seller_id: productMap[6].seller_id,
        price: 380000, 
        quantity: 1, 
        total_price: 380000,
        selling_price: 380000,
        import_price: 300000,
        platform_fee: Math.round(380000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[6].title,
        product_thumbnail: productMap[6].thumbnail,
        variant_name: 'Màu bạc'
      },
      
      // Order 3
      { 
        id: 5, 
        order_id: 3, 
        product_id: 5, 
        variant_id: 19, 
        seller_id: productMap[5].seller_id,
        price: 450000, 
        quantity: 1, 
        total_price: 450000,
        selling_price: 450000,
        import_price: 360000,
        platform_fee: Math.round(450000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[5].title,
        product_thumbnail: productMap[5].thumbnail,
        variant_name: '45cm'
      },
      
      // Order 4
      { 
        id: 6, 
        order_id: 4, 
        product_id: 3, 
        variant_id: 10, 
        seller_id: productMap[3].seller_id,
        price: 350000, 
        quantity: 1, 
        total_price: 350000,
        selling_price: 350000,
        import_price: 280000,
        platform_fee: Math.round(350000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[3].title,
        product_thumbnail: productMap[3].thumbnail,
        variant_name: 'Tròng xanh'
      },
      
      // Order 5
      { 
        id: 7, 
        order_id: 5, 
        product_id: 4, 
        variant_id: 15, 
        seller_id: productMap[4].seller_id,
        price: 280000, 
        quantity: 1, 
        total_price: 280000,
        selling_price: 280000,
        import_price: 220000,
        platform_fee: Math.round(280000 * platformFeePercent / 100),
        platform_fee_percent: platformFeePercent,
        product_title: productMap[4].title,
        product_thumbnail: productMap[4].thumbnail,
        variant_name: 'Màu vàng'
      }
    ]

    await queryInterface.bulkInsert('OrderItems', orderItemsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderItems', null, {})
  }
}
