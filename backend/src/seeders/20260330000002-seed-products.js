'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [sellerRows] = await queryInterface.sequelize.query(
      `
      SELECT id, email
      FROM Users
      WHERE email IN ('seller1@test.com', 'seller2@test.com', 'seller3@test.com')
      ORDER BY id ASC;
      `
    )

    const sellerIds = sellerRows.map((r) => r.id)
    const seller1 = sellerIds[0] || null
    const seller2 = sellerIds[1] || null
    const seller3 = sellerIds[2] || null

    const productsData = [
      {
        id: 1,
        category_id: 1,
        seller_id: seller1,
        title: 'Mũ lưỡi trai unisex cotton',
        price: 150000,
        import_price: 120000,
        profit_margin: 30000,
        quantity: 'Freesize, nhiều màu',
        thumbnail:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Mũ lưỡi trai form chuẩn, vải cotton thoáng, phù hợp đi chơi và thể thao nhẹ.',
        total_stock: 100,
        sold: 15,
        available: 85,
        deleted: false
      },
      {
        id: 2,
        category_id: 2,
        seller_id: seller1,
        title: 'Kính gọng mảnh chống ánh sáng xanh',
        price: 250000,
        import_price: 200000,
        profit_margin: 50000,
        quantity: 'OneSize',
        thumbnail:
          'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Gọng nhẹ, tròng lọc ánh sáng xanh từ màn hình, dễ phối thời trang.',
        total_stock: 80,
        sold: 20,
        available: 60,
        deleted: false
      },
      {
        id: 3,
        category_id: 2,
        seller_id: seller1,
        title: 'Kính râm phân cực Polarized',
        price: 350000,
        import_price: 280000,
        profit_margin: 70000,
        quantity: 'OneSize, nhiều màu tròng',
        thumbnail:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Tròng phân cực giảm chói, bảo vệ mắt dưới nắng; gọng bền.',
        total_stock: 120,
        sold: 35,
        available: 85,
        deleted: false
      },
      {
        id: 4,
        category_id: 3,
        seller_id: seller1,
        title: 'Hoa tai khuyên tròn bạc 925',
        price: 280000,
        import_price: 220000,
        profit_margin: 60000,
        quantity: 'Cặp, nhiều màu xi',
        thumbnail:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Khuyên tròn tối giản, chất liệu bạc 925, nhẹ tai, dễ đeo hằng ngày.',
        total_stock: 60,
        sold: 12,
        available: 48,
        deleted: false
      },
      {
        id: 5,
        category_id: 4,
        seller_id: seller1,
        title: 'Vòng cổ dây chuyền mảnh layering',
        price: 450000,
        import_price: 360000,
        profit_margin: 90000,
        quantity: '40–50cm',
        thumbnail:
          'https://images.unsplash.com/photo-1599643478518-a784e5da4fb8?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1599643478518-a784e5da4fb8?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1599643477877-29f425d7b8a4?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Dây chuyền mảnh có thể đeo một mình hoặc phối nhiều lớp.',
        total_stock: 90,
        sold: 25,
        available: 65,
        deleted: false
      },
      {
        id: 6,
        category_id: 3,
        seller_id: seller1,
        title: 'Hoa tai dài đính đá CZ',
        price: 380000,
        import_price: 300000,
        profit_margin: 80000,
        quantity: 'Cặp, nhiều màu',
        thumbnail:
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Thiết kế giọt dài thanh lịch, đá CZ lấp lánh, bảo hành xi.',
        total_stock: 70,
        sold: 18,
        available: 52,
        deleted: false
      },
      {
        id: 7,
        category_id: 1,
        seller_id: seller1,
        title: 'Mũ bucket vải denim',
        price: 520000,
        import_price: 400000,
        profit_margin: 120000,
        quantity: 'Freesize',
        thumbnail:
          'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Mũ bucket form unisex, vải denim bền, phối streetwear và đi biển.',
        total_stock: 50,
        sold: 10,
        available: 40,
        deleted: false
      },
      {
        id: 8,
        category_id: 2,
        seller_id: seller1,
        title: 'Kính râm gọng nhựa vintage',
        price: 180000,
        import_price: 140000,
        profit_margin: 40000,
        quantity: 'OneSize',
        thumbnail:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Kiểu vintage gọng nhựa nhẹ, UV400, nhiều màu classic.',
        total_stock: 150,
        sold: 40,
        available: 110,
        deleted: false
      },
      {
        id: 9,
        category_id: 1,
        seller_id: seller1,
        title: 'Mũ beanie len mùa đông',
        price: 95000,
        import_price: 75000,
        profit_margin: 20000,
        quantity: 'Freesize',
        thumbnail:
          'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Mũ beanie len ấm áp, co giãn tốt, nhiều màu sắc trẻ trung.',
        total_stock: 75,
        sold: 8,
        available: 67,
        deleted: false
      },
      {
        id: 10,
        category_id: 4,
        seller_id: seller1,
        title: 'Vòng tay charm may mắn',
        price: 220000,
        import_price: 170000,
        profit_margin: 50000,
        quantity: 'Adjustable',
        thumbnail:
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Vòng tay charm phong cách tối giản, dễ điều chỉnh size, mang lại may mắn.',
        total_stock: 55,
        sold: 14,
        available: 41,
        deleted: false
      },
      {
        id: 11,
        category_id: 2,
        seller_id: seller1,
        title: 'Kính cận gọng tròn Kim Loại',
        price: 320000,
        import_price: 250000,
        profit_margin: 70000,
        quantity: 'OneSize',
        thumbnail:
          'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Gọng tròn kim loại thời trang, nhẹ và bền, phù hợp nhiều khuôn mặt.',
        total_stock: 65,
        sold: 22,
        available: 43,
        deleted: false
      },
      {
        id: 12,
        category_id: 3,
        seller_id: seller2,
        title: 'Hoa tai nụ nhỏ xinh',
        price: 180000,
        import_price: 140000,
        profit_margin: 40000,
        quantity: 'Cặp',
        thumbnail:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Hoa tai nụ nhỏ xinh, chất liệu bạc 925, phù hợp mọi lúc mọi nơi.',
        total_stock: 95,
        sold: 18,
        available: 77,
        deleted: false
      },
      {
        id: 13,
        category_id: 1,
        seller_id: seller2,
        title: 'Mũ lưỡi trai thêu logo',
        price: 165000,
        import_price: 130000,
        profit_margin: 35000,
        quantity: 'Freesize',
        thumbnail:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Mũ lưỡi trai thêu logo trẻ trung, vải cotton cao cấp.',
        total_stock: 88,
        sold: 16,
        available: 72,
        deleted: false
      },
      {
        id: 14,
        category_id: 4,
        seller_id: seller3,
        title: 'Nhẫn bạc đính đá CZ',
        price: 350000,
        import_price: 270000,
        profit_margin: 80000,
        quantity: 'Size 6-9',
        thumbnail:
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Nhẫn bạc 925 đính đá CZ lấp lánh, thiết kế sang trọng.',
        total_stock: 45,
        sold: 9,
        available: 36,
        deleted: false
      },
      {
        id: 15,
        category_id: 2,
        seller_id: seller3,
        title: 'Kính râm aviator pilot',
        price: 420000,
        import_price: 330000,
        profit_margin: 90000,
        quantity: 'OneSize',
        thumbnail:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'
        ]),
        description: 'Kính aviator phong cách phi công, chống UV, tròng phân cực.',
        total_stock: 72,
        sold: 28,
        available: 44,
        deleted: false
      }
    ]

    await queryInterface.bulkInsert('Products', productsData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {})
  }
}
