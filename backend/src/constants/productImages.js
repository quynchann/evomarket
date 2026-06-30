'use strict'

/** Ảnh sản phẩm demo — chỉ Mũ, Kính, Hoa tai (Unsplash). */
const u = (photoId, w = 600) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=${w}`

const HAT_CAP = 'photo-1588850561407-ed78c282e89b'
const HAT_BUCKET = 'photo-1521369909029-2afed882baee'
const HAT_BEANIE = 'photo-1607344646338-a4af94801f1d'

const GLASSES_FRAME = 'photo-1574258495973-f010dfbb5371'
const GLASSES_SUN = 'photo-1572635196237-14b3f281503f'
const GLASSES_SUN_CLASSIC = 'photo-1511499767150-a48a237f0083'
const GLASSES_VINTAGE = 'photo-1577803645773-f96470509666'

const EARRING_STUD = 'photo-1535632066927-ab7c9ab60908'
const EARRING_DROP = 'photo-1611591437281-460bfbe1220a'
const EARRING_HOOP = 'photo-1617038260897-41a1f14a8ca0'

const categoryImages = {
  hat: u(HAT_BUCKET, 400),
  glasses: u(GLASSES_SUN, 400),
  earring: u(EARRING_STUD, 400),
}

/** thumbnail + images theo product id trong seed */
const productImageSets = {
  1: {
    thumbnail: u(HAT_CAP),
    images: [u(HAT_CAP, 800), u(HAT_BUCKET, 800)],
  },
  2: {
    thumbnail: u(GLASSES_FRAME),
    images: [u(GLASSES_FRAME, 800), u(GLASSES_VINTAGE, 800)],
  },
  3: {
    thumbnail: u(GLASSES_SUN),
    images: [u(GLASSES_SUN, 800), u(GLASSES_SUN_CLASSIC, 800)],
  },
  4: {
    thumbnail: u(EARRING_STUD),
    images: [u(EARRING_STUD, 800), u(EARRING_HOOP, 800)],
  },
  6: {
    thumbnail: u(EARRING_DROP),
    images: [u(EARRING_DROP, 800), u(EARRING_STUD, 800)],
  },
  7: {
    thumbnail: u(HAT_BUCKET),
    images: [u(HAT_BUCKET, 800), u(HAT_CAP, 800)],
  },
  8: {
    thumbnail: u(GLASSES_SUN_CLASSIC),
    images: [u(GLASSES_SUN_CLASSIC, 800), u(GLASSES_VINTAGE, 800)],
  },
  9: {
    thumbnail: u(HAT_BEANIE),
    images: [u(HAT_BEANIE, 800)],
  },
  11: {
    thumbnail: u(GLASSES_FRAME),
    images: [u(GLASSES_FRAME, 800)],
  },
  12: {
    thumbnail: u(EARRING_STUD),
    images: [u(EARRING_STUD, 800)],
  },
  13: {
    thumbnail: u(HAT_CAP),
    images: [u(HAT_CAP, 800)],
  },
  15: {
    thumbnail: u(GLASSES_SUN),
    images: [u(GLASSES_SUN, 800)],
  },
}

module.exports = {
  categoryImages,
  productImageSets,
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
}
