/** Ảnh sản phẩm demo — chỉ Mũ, Kính, Hoa tai (đồng bộ với backend seed). */
const u = (photoId, w = 600) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=${w}`

export const categoryImages = {
  hat: u('photo-1521369909029-2afed882baee', 400),
  glasses: u('photo-1572635196237-14b3f281503f', 400),
  earring: u('photo-1535632066927-ab7c9ab60908', 400),
}

export const sampleProducts = {
  hatCap: {
    name: 'Mũ lưỡi trai unisex cotton',
    price: '150.000₫',
    image: u('photo-1588850561407-ed78c282e89b'),
  },
  hatBucket: {
    name: 'Mũ bucket vải denim',
    price: '520.000₫',
    image: u('photo-1521369909029-2afed882baee'),
  },
  hatBeanie: {
    name: 'Mũ beanie len mùa đông',
    price: '95.000₫',
    image: u('photo-1607344646338-a4af94801f1d'),
  },
  glassesBlueLight: {
    name: 'Kính gọng mảnh chống ánh sáng xanh',
    price: '250.000₫',
    image: u('photo-1574258495973-f010dfbb5371'),
  },
  glassesSun: {
    name: 'Kính râm phân cực Polarized',
    price: '350.000₫',
    image: u('photo-1572635196237-14b3f281503f'),
  },
  glassesVintage: {
    name: 'Kính râm gọng nhựa vintage',
    price: '180.000₫',
    image: u('photo-1511499767150-a48a237f0083'),
  },
  earringStud: {
    name: 'Hoa tai khuyên tròn bạc 925',
    price: '280.000₫',
    image: u('photo-1535632066927-ab7c9ab60908'),
  },
  earringDrop: {
    name: 'Hoa tai dài đính đá CZ',
    price: '380.000₫',
    image: u('photo-1611591437281-460bfbe1220a'),
  },
  earringSmall: {
    name: 'Hoa tai nữ nhỏ xinh',
    price: '180.000₫',
    image: u('photo-1535632066927-ab7c9ab60908'),
  },
}
