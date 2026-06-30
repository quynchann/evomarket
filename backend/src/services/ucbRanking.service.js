import { ProductImpressionStat } from '../models/index.js'

const DEFAULT_POOL_SIZE = 80

/**
 * UCB1 score — arm chưa có impression nhận điểm +∞ để forced exploration.
 * Reward dùng click (0/1 theo mỗi impression) => mean reward = CTR.
 */
export function computeUcbScore(impressions, clicks, totalImpressions) {
  const n_i = Number(impressions) || 0
  const r_i = Number(clicks) || 0
  const N = Math.max(Number(totalImpressions) || 0, 1)

  if (n_i <= 0) return Number.POSITIVE_INFINITY

  const meanReward = r_i / n_i
  const explorationBonus = Math.sqrt((2 * Math.log(N)) / n_i)
  return meanReward + explorationBonus
}

/**
 * Hàm tính tổng số impression
 */
export async function getTotalImpressions() {
  const row = await ProductImpressionStat.findOne({
    attributes: [
      [
        ProductImpressionStat.sequelize.fn(
          'COALESCE',
          ProductImpressionStat.sequelize.fn(
            'SUM',
            ProductImpressionStat.sequelize.col('impressions'),
          ),
          0,
        ),
        'total',
      ],
    ],
    raw: true,
  })
  return Number(row?.total) || 0
}

/**
 * Lấy map của product_id và impressions, clicks
 */
export async function getStatsMap(productIds = []) {
  const map = new Map()
  if (!productIds.length) return map

  const rows = await ProductImpressionStat.findAll({
    where: { product_id: productIds },
  })

  for (const row of rows) {
    const plain = row.get({ plain: true })
    map.set(plain.product_id, plain)
  }
  return map
}

/**
 * Xếp hạng sản phẩm theo UCB1; tuỳ chọn ghi nhận impression cho danh sách trả về.
 */
export async function rankProductsByUcb(
  products,
  { recordImpressions = false } = {},
) {
  if (!products?.length) return []

  const productIds = products.map((p) => p.id)
  const statsMap = await getStatsMap(productIds)
  const totalN = await getTotalImpressions()

  const scored = products.map((product) => {
    const stat = statsMap.get(product.id)
    const n_i = stat?.impressions ?? 0
    const r_i = stat?.clicks ?? 0
    return {
      product,
      ucbScore: computeUcbScore(n_i, r_i, totalN),
    }
  })

  scored.sort((a, b) => {
    if (b.ucbScore !== a.ucbScore) return b.ucbScore - a.ucbScore
    return Number(b.product.id) - Number(a.product.id)
  })

  const ranked = scored.map((s) => s.product)

  if (recordImpressions && ranked.length > 0) {
    await recordImpressionsForProducts(ranked.map((p) => p.id))
  }

  return ranked
}

/**
 * Hàm ghi nhận impression cho các sản phẩm
 */
export async function recordImpressionsForProducts(productIds = []) {
  const ids = [...new Set(productIds.map(Number).filter(Number.isFinite))]
  if (!ids.length) return

  for (const productId of ids) {
    const [row] = await ProductImpressionStat.findOrCreate({
      where: { product_id: productId },
      defaults: { impressions: 0, clicks: 0 },
    })
    await row.increment('impressions', { by: 1 })
  }
}

/**
 * Hàm ghi nhận click cho sản phẩm
 */
export async function recordClickForProduct(productId) {
  const pid = Number(productId)
  if (!Number.isFinite(pid)) return

  const [row] = await ProductImpressionStat.findOrCreate({
    where: { product_id: pid },
    defaults: { impressions: 0, clicks: 0 },
  })
  await row.increment('clicks', { by: 1 })
}

export { DEFAULT_POOL_SIZE }
