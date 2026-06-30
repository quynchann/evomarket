'use strict'

const {
  u,
  HAT_CAP,
  HAT_BUCKET,
  HAT_BEANIE,
  GLASSES_FRAME,
  GLASSES_SUN,
  GLASSES_SUN_CLASSIC,
  GLASSES_VINTAGE,
  EARRING_STUD,
  EARRING_DROP,
  EARRING_HOOP,
} = require('../../constants/productImages')

const CATEGORY = { HAT: 1, GLASSES: 2, EARRING: 3 }

const IMAGE_POOL = {
  [CATEGORY.HAT]: [HAT_CAP, HAT_BUCKET, HAT_BEANIE],
  [CATEGORY.GLASSES]: [
    GLASSES_FRAME,
    GLASSES_SUN,
    GLASSES_SUN_CLASSIC,
    GLASSES_VINTAGE,
  ],
  [CATEGORY.EARRING]: [EARRING_STUD, EARRING_DROP, EARRING_HOOP],
}

const DEFAULT_COLORS = {
  [CATEGORY.HAT]: ['Đen', 'Trắng', 'Navy', 'Be', 'Xám'],
  [CATEGORY.GLASSES]: ['Gọng đen', 'Gọng bạc', 'Gọng vàng', 'Nâu tortoise'],
  [CATEGORY.EARRING]: ['Bạc 925', 'Vàng hồng', 'Mạ vàng 14K', 'Trắng ngà'],
}

/** 16 mũ — tên và mô tả không trùng */
const HAT_PRODUCTS = [
  {
    title: 'Mũ lưỡi trai unisex cotton basic',
    description: 'Form lưỡi trai chuẩn, vải cotton thoáng, phù hợp đi học và đi chơi.',
    price: 150000,
    imageIdx: 0,
    colors: ['Đen', 'Trắng', 'Navy'],
  },
  {
    title: 'Mũ bucket vải denim streetwear',
    description: 'Mũ bucket form unisex, vải denim bền, phối streetwear và đi biển.',
    price: 220000,
    imageIdx: 1,
    colors: ['Xanh denim', 'Be kem', 'Đen wash'],
  },
  {
    title: 'Mũ beanie len mùa đông co giãn',
    description: 'Len mềm giữ ấm tốt, co giãn freesize, nhiều màu trẻ trung.',
    price: 95000,
    imageIdx: 2,
    colors: ['Đen', 'Xám', 'Burgundy'],
  },
  {
    title: 'Mũ snapback thêu logo thể thao',
    description: 'Snapback chỉnh size linh hoạt, logo thêu nổi, phong cách hip-hop.',
    price: 185000,
    imageIdx: 0,
    colors: ['Đen', 'Đỏ', 'Navy'],
  },
  {
    title: 'Mũ nón rộng vành chống nắng UV',
    description: 'Vành rộng che nắng toàn diện, chất liệu nhẹ, đi du lịch và dã ngoại.',
    price: 280000,
    imageIdx: 1,
    colors: ['Be', 'Nâu', 'Đen'],
  },
  {
    title: 'Mũ lưỡi trai canvas phong cách Hàn',
    description: 'Canvas dày form cứng, phối đồ minimal Hàn Quốc, unisex.',
    price: 165000,
    imageIdx: 0,
    colors: ['Trắng', 'Kem', 'Olive'],
  },
  {
    title: 'Mũ bucket họa tiết rằn ri',
    description: 'Họa tiết rằn ri nổi bật, chất liệu cotton pha, phong cách urban.',
    price: 195000,
    imageIdx: 1,
    colors: ['Rằn xanh', 'Rằn nâu', 'Rằn đen'],
  },
  {
    title: 'Mũ len cổ điển unisex',
    description: 'Kiểu len đan cổ điển, giữ ấm nhẹ, phù hợp mùa thu đông.',
    price: 120000,
    imageIdx: 2,
    colors: ['Xám melange', 'Camel', 'Đen'],
  },
  {
    title: 'Mũ trucker lưới thoáng mát',
    description: 'Mặt sau lưới thoáng khí, phù hợp đi phượt và thể thao ngoài trời.',
    price: 145000,
    imageIdx: 0,
    colors: ['Đen-trắng', 'Xanh navy', 'Đỏ đen'],
  },
  {
    title: 'Mũ lưỡi trai dad cap form cao',
    description: 'Dad cap form thấp thoải mái, logo thêu tối giản, dễ phối đồ.',
    price: 175000,
    imageIdx: 0,
    colors: ['Be', 'Xanh rêu', 'Đen'],
  },
  {
    title: 'Mũ bucket nhung mùa thu',
    description: 'Chất liệu nhung mềm cao cấp, form bucket trendy cho mùa thu.',
    price: 245000,
    imageIdx: 1,
    colors: ['Nâu', 'Đen', 'Burgundy'],
  },
  {
    title: 'Mũ visor che nắng chơi golf',
    description: 'Visor mát trán, băng đầu co giãn, chống nắng khi vận động.',
    price: 135000,
    imageIdx: 0,
    colors: ['Trắng', 'Hồng pastel', 'Xanh navy'],
  },
  {
    title: 'Mũ fedora phong cách retro',
    description: 'Fedora vành cong phong cách vintage, phối vest và áo khoác.',
    price: 320000,
    imageIdx: 1,
    colors: ['Nâu', 'Đen', 'Xám'],
  },
  {
    title: 'Mũ lưỡi trai bóng chày cotton',
    description: 'Kiểu baseball cap chuẩn MLB, vải cotton dày, thêu chữ phía sau.',
    price: 155000,
    imageIdx: 0,
    colors: ['Navy-vàng', 'Đen-trắng', 'Đỏ-trắng'],
  },
  {
    title: 'Mũ bucket tai bèo đi biển',
    description: 'Tai bèo rộng chống nắng, vải chống thấm nhẹ, phù hợp resort.',
    price: 210000,
    imageIdx: 1,
    colors: ['Trắng', 'Vàng cát', 'Xanh biển'],
  },
  {
    title: 'Mũ beanie gấu len phối sọc',
    description: 'Beanie phối sọc trẻ trung, len acrylic mềm, unisex freesize.',
    price: 110000,
    imageIdx: 2,
    colors: ['Sọc đen trắng', 'Sọc xám', 'Sọc navy'],
  },
]

/** 16 kính — tên và mô tả không trùng */
const GLASSES_PRODUCTS = [
  {
    title: 'Kính gọng mảnh chống ánh sáng xanh',
    description: 'Tròng lọc ánh sáng xanh từ màn hình, gọng nhẹ đeo cả ngày.',
    price: 250000,
    imageIdx: 0,
    colors: ['Gọng đen mờ', 'Gọng bạc', 'Gọng vàng'],
  },
  {
    title: 'Kính râm phân cực Polarized',
    description: 'Tròng phân cực giảm chói, bảo vệ mắt dưới nắng gắt.',
    price: 350000,
    imageIdx: 1,
    colors: ['Tròng xám đậm', 'Tròng nâu', 'Tròng xanh rêu'],
  },
  {
    title: 'Kính râm gọng nhựa vintage',
    description: 'Gọng nhựa acetate vintage, UV400, nhẹ và bền.',
    price: 180000,
    imageIdx: 3,
    colors: ['Đen gọng', 'Nâu tortoise', 'Đỏ đô'],
  },
  {
    title: 'Kính cận gọng tròn kim loại',
    description: 'Gọng tròn kim loại thời trang, phù hợp nhiều khuôn mặt.',
    price: 320000,
    imageIdx: 0,
    colors: ['Vàng', 'Bạc', 'Đen'],
  },
  {
    title: 'Kính râm aviator pilot',
    description: 'Phong cách phi công cổ điển, chống UV, tròng phân cực.',
    price: 420000,
    imageIdx: 1,
    colors: ['Vàng kim loại', 'Bạc kim loại', 'Đen mờ'],
  },
  {
    title: 'Kính gọng vuông retro Hàn Quốc',
    description: 'Gọng vuông retro hot trend, phối đồ Hàn và công sở.',
    price: 290000,
    imageIdx: 0,
    colors: ['Đen bóng', 'Trong suốt', 'Hổ phách'],
  },
  {
    title: 'Kính râm oversized thời trang',
    description: 'Gọng oversized che nắng rộng, phong cách celeb street style.',
    price: 380000,
    imageIdx: 2,
    colors: ['Đen', 'Nâu', 'Trắng'],
  },
  {
    title: 'Kính gọng titan siêu nhẹ',
    description: 'Khung titan siêu nhẹ, không gây mỏi mắt khi đeo lâu.',
    price: 450000,
    imageIdx: 0,
    colors: ['Bạc titan', 'Vàng titan', 'Xám gunmetal'],
  },
  {
    title: 'Kính râm gọng tròn classic',
    description: 'Gọng tròn classic unisex, tròng râm đồng đều, dễ phối.',
    price: 210000,
    imageIdx: 2,
    colors: ['Vàng đồng', 'Bạc', 'Đen'],
  },
  {
    title: 'Kính gọng trong suốt công sở',
    description: 'Gọng trong suốt thanh lịch, phù hợp môi trường văn phòng.',
    price: 275000,
    imageIdx: 0,
    colors: ['Trong', 'Hồng nhạt', 'Xám khói'],
  },
  {
    title: 'Kính râm clubmaster gọng kim loại',
    description: 'Kiểu clubmaster nửa gọng kim loại, phong cách intellectual.',
    price: 340000,
    imageIdx: 3,
    colors: ['Đen-vàng', 'Nâu-vàng', 'Xanh-vàng'],
  },
  {
    title: 'Kính gọng cat-eye nữ tính',
    description: 'Gọng cat-eye nữ tính, nâng tầm makeup và phong cách dạo phố.',
    price: 265000,
    imageIdx: 0,
    colors: ['Đen', 'Đỏ đô', 'Hồng pastel'],
  },
  {
    title: 'Kính râm thể thao wrap-around',
    description: 'Gọng ôm sát, chống bụi và gió khi chạy bộ, đạp xe.',
    price: 310000,
    imageIdx: 1,
    colors: ['Đen matte', 'Xanh dương', 'Đỏ thể thao'],
  },
  {
    title: 'Kính gọng đa giác geometric',
    description: 'Thiết kế đa giác hiện đại, gọng mảnh trendy cho giới trẻ.',
    price: 295000,
    imageIdx: 0,
    colors: ['Đen', 'Bạc', 'Vàng rose'],
  },
  {
    title: 'Kính râm gọng gỗ thiên nhiên',
    description: 'Gọng gỗ tự nhiên cao cấp, mỗi chiếc có vân gỗ độc đáo.',
    price: 480000,
    imageIdx: 3,
    colors: ['Gỗ sáng', 'Gỗ walnut', 'Gỗ đen'],
  },
  {
    title: 'Kính gọng bán khung rimless',
    description: 'Kiểu rimless thanh mảnh, tròng PC chống va đập nhẹ.',
    price: 360000,
    imageIdx: 0,
    colors: ['Bạc', 'Vàng', 'Xanh titan'],
  },
]

/** 16 hoa tai — tên và mô tả không trùng */
const EARRING_PRODUCTS = [
  {
    title: 'Hoa tai khuyên tròn bạc 925',
    description: 'Khuyên tròn tối giản, bạc 925 không gây dị ứng, đeo hằng ngày.',
    price: 280000,
    imageIdx: 0,
    colors: ['Bạc 925', 'Vàng hồng', 'Mạ vàng 14K'],
  },
  {
    title: 'Hoa tai dài đính đá CZ',
    description: 'Giọt dài thanh lịch, đá CZ lấp lánh, phù hợp dự tiệc.',
    price: 380000,
    imageIdx: 1,
    colors: ['Trắng ngà', 'Đen titan', 'Vàng champagne'],
  },
  {
    title: 'Hoa tai nữ nhỏ xinh bạc',
    description: 'Size nhỏ xinh nhẹ tai, bạc 925 bóng, phối đồ thanh lịch.',
    price: 180000,
    imageIdx: 0,
    colors: ['Bạc sáng', 'Vàng hồng', 'Hồng gold'],
  },
  {
    title: 'Hoa tai vòng tròn minimalist',
    description: 'Thiết kế vòng tròn tối giản, phong cách Scandinavian.',
    price: 220000,
    imageIdx: 2,
    colors: ['Bạc', 'Vàng 14K', 'Đen ruthenium'],
  },
  {
    title: 'Hoa tai ngọc trai cổ điển',
    description: 'Ngọc trai tự nhiên tone ấm, sang trọng cho công sở.',
    price: 420000,
    imageIdx: 0,
    colors: ['Trắng ngọc', 'Hồng ngọc', 'Xám ngọc'],
  },
  {
    title: 'Hoa tai bông hoa đính đá',
    description: 'Hình bông hoa 5 cánh đính đá CZ, nữ tính và nổi bật.',
    price: 350000,
    imageIdx: 1,
    colors: ['Bạc-đá trắng', 'Vàng-đá hồng', 'Bạc-đá xanh'],
  },
  {
    title: 'Hoa tai khuyên vàng 14K',
    description: 'Vàng 14K chính hãng, khuyên tròn basic sang trọng.',
    price: 520000,
    imageIdx: 0,
    colors: ['Vàng 14K', 'Vàng trắng', 'Vàng hồng'],
  },
  {
    title: 'Hoa tai tòn ten dài thanh lịch',
    description: 'Tòn ten 3 tầng lắc nhẹ, tôn dáng cổ và vai.',
    price: 450000,
    imageIdx: 1,
    colors: ['Bạc', 'Vàng', 'Đen'],
  },
  {
    title: 'Hoa tai khuyên đá pastel',
    description: 'Đá màu pastel mint, lavender, peach — phong cách Gen Z.',
    price: 240000,
    imageIdx: 0,
    colors: ['Mint', 'Lavender', 'Peach'],
  },
  {
    title: 'Hoa tai clip không xỏ khuyên',
    description: 'Kẹp tai không cần lỗ bấm, êm ái cho người mới đeo.',
    price: 165000,
    imageIdx: 2,
    colors: ['Bạc', 'Vàng', 'Đen'],
  },
  {
    title: 'Hoa tai hoop vàng trung bình',
    description: 'Vòng hoop size medium, vàng không gỉ, phối đồ street.',
    price: 310000,
    imageIdx: 2,
    colors: ['Vàng', 'Bạc', 'Vàng hồng'],
  },
  {
    title: 'Hoa tai giọt nước pha lê',
    description: 'Giọt nước pha lê Swarovski, lấp lánh dưới ánh đèn.',
    price: 490000,
    imageIdx: 1,
    colors: ['Trong suốt', 'Hồng', 'Xanh aqua'],
  },
  {
    title: 'Hoa tai ngôi sao nhí xinh',
    description: 'Hình ngôi sao nhỏ xinh, phù hợp học sinh và đi chơi.',
    price: 195000,
    imageIdx: 0,
    colors: ['Bạc', 'Vàng', 'Xanh navy'],
  },
  {
    title: 'Hoa tai khuyên đôi hình trái tim',
    description: 'Cặp khuyên trái tim dễ thương, quà tặng Valentine.',
    price: 230000,
    imageIdx: 0,
    colors: ['Bạc', 'Vàng hồng', 'Đỏ enamel'],
  },
  {
    title: 'Hoa tai bông tai hình bướm',
    description: 'Bướm cánh mỏng đính đá, chuyển động nhẹ khi đi.',
    price: 275000,
    imageIdx: 1,
    colors: ['Bạc-xanh', 'Vàng-hồng', 'Bạc-tím'],
  },
  {
    title: 'Hoa tai vàng xoắn torsion',
    description: 'Thiết kế xoắn torsion độc đáo, vàng 18K phủ sáng.',
    price: 560000,
    imageIdx: 2,
    colors: ['Vàng 18K', 'Vàng trắng', 'Vàng hồng'],
  },
]

const BY_CATEGORY = {
  [CATEGORY.HAT]: HAT_PRODUCTS,
  [CATEGORY.GLASSES]: GLASSES_PRODUCTS,
  [CATEGORY.EARRING]: EARRING_PRODUCTS,
}

const TOTAL_PRODUCTS = 48

function imagesForCategory(categoryId, imageIdx) {
  const pool = IMAGE_POOL[categoryId]
  const a = pool[imageIdx % pool.length]
  const b = pool[(imageIdx + 1) % pool.length]
  return {
    thumbnail: u(a),
    images: JSON.stringify([u(a, 800), u(b, 800)]),
  }
}

function definitionForIndex(i) {
  const categoryId = (i % 3) + 1
  const slot = Math.floor(i / 3)
  return {
    categoryId,
    ...BY_CATEGORY[categoryId][slot],
  }
}

function sellerFor(index, seller1, seller2, seller3) {
  if (index % 5 === 4) return seller3
  if (index % 3 === 2) return seller2
  return seller1
}

function buildProductCatalog(seller1, seller2, seller3) {
  const products = []

  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const id = i + 1
    const def = definitionForIndex(i)
    const sold = 5 + (i % 12) * 3
    const totalStock = 40 + (i % 8) * 10
    const available = totalStock - sold
    const imgs = imagesForCategory(def.categoryId, def.imageIdx)

    products.push({
      id,
      category_id: def.categoryId,
      seller_id: sellerFor(i, seller1, seller2, seller3),
      title: def.title,
      price: def.price,
      import_price: Math.round(def.price * 0.78),
      thumbnail: imgs.thumbnail,
      images: imgs.images,
      description: def.description,
      total_stock: totalStock,
      sold,
      available,
      deleted: false,
    })
  }

  return products
}

function buildVariantCatalog(products) {
  const variants = []
  let variantId = 1

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const def = definitionForIndex(i)
    const fallback = DEFAULT_COLORS[product.category_id]
    const colors = def.colors?.length ? def.colors : fallback
    const colorCount = product.id <= 15 ? colors.length : Math.min(2, colors.length)
    const picked = colors.slice(0, colorCount)

    for (const color of picked) {
      const stock = 12 + ((product.id + variantId) % 9) * 3
      const size =
        product.category_id === CATEGORY.HAT
          ? 'Freesize'
          : product.category_id === CATEGORY.GLASSES
            ? 'OneSize'
            : 'Cặp'

      variants.push({
        id: variantId,
        product_id: product.id,
        size,
        color,
        stock,
      })
      variantId += 1
    }
  }

  return variants
}

module.exports = {
  TOTAL_PRODUCTS,
  buildProductCatalog,
  buildVariantCatalog,
  HAT_PRODUCTS,
  GLASSES_PRODUCTS,
  EARRING_PRODUCTS,
}
