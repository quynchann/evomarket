import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { instance } from '@viz-js/viz'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dbmlPath = path.join(root, 'src', 'database', 'db.erd.dbml')
const outDir = path.resolve(root, '..', 'SOICT_DoAn_LeThiQuynh', 'Hinhve')
const outPng = path.join(outDir, 'ERD.png')

const HEADER_BG = '#A8D4F5'
const BORDER_COLOR = '#5B9BD5'
const BODY_BG = '#FFFFFF'
const DIAMOND_FILL = '#EF5350'
const DIAMOND_BORDER = '#C62828'
const EDGE_COLOR = '#D32F2F'

/** Entity names — PascalCase, sync with Sequelize models / Chương 4 */
const ENTITY_NAMES = {
  users: 'User',
  user_addresses: 'UserAddress',
  user_notifications: 'UserNotification',
  categories: 'Category',
  products: 'Product',
  product_variants: 'ProductVariant',
  product_tryon_instances: 'ProductTryonInstance',
  product_impression_stats: 'ProductImpressionStat',
  cart: 'Cart',
  coupons: 'Coupon',
  coupon_redemptions: 'CouponRedemption',
  orders: 'Order',
  order_items: 'OrderItem',
  order_status_histories: 'OrderStatusHistory',
  payments: 'Payment',
  refunds: 'Refund',
  reviews: 'Review',
  conversations: 'Conversation',
  messages: 'Message',
  seller_shop_follows: 'SellerShopFollow',
}

const FK_FIELDS = new Set([
  'user_id',
  'seller_id',
  'follower_id',
  'category_id',
  'product_id',
  'variant_id',
  'coupon_id',
  'order_id',
  'payment_id',
  'order_item_id',
  'conversation_id',
  'user1_id',
  'user2_id',
  'sender_id',
])

const RELATIONSHIPS = [
  { a: 'users', aCard: '1', b: 'user_addresses', bCard: 'n', label: 'Owns' },
  { a: 'users', aCard: '1', b: 'user_notifications', bCard: 'n', label: 'Receives' },
  { a: 'users', aCard: '1', b: 'orders', bCard: 'n', label: 'Places' },
  { a: 'users', aCard: '1', b: 'cart', bCard: 'n', label: 'Has' },
  { a: 'users', aCard: '1', b: 'reviews', bCard: 'n', label: 'Writes' },
  { a: 'users', aCard: '1', b: 'products', bCard: 'n', label: 'Sells' },
  { a: 'users', aCard: '1', b: 'coupons', bCard: 'n', label: 'Issues' },
  { a: 'users', aCard: '1', b: 'conversations', bCard: 'n', label: 'Joins' },
  { a: 'users', aCard: '1', b: 'messages', bCard: 'n', label: 'Sends' },
  { a: 'users', aCard: '1', b: 'seller_shop_follows', bCard: 'n', label: 'Follows' },
  { a: 'categories', aCard: '1', b: 'products', bCard: 'n', label: 'Categorizes' },
  { a: 'products', aCard: '1', b: 'product_variants', bCard: 'n', label: 'HasVariant' },
  { a: 'products', aCard: '1', b: 'product_tryon_instances', bCard: 'n', label: 'TryOn' },
  { a: 'products', aCard: '1', b: 'product_impression_stats', bCard: '1', label: 'Tracks' },
  { a: 'products', aCard: '1', b: 'reviews', bCard: 'n', label: 'Reviewed' },
  { a: 'products', aCard: '1', b: 'cart', bCard: 'n', label: 'InCart' },
  { a: 'products', aCard: '1', b: 'order_items', bCard: 'n', label: 'LineItem' },
  { a: 'product_variants', aCard: '1', b: 'cart', bCard: 'n', label: 'VariantCart' },
  { a: 'product_variants', aCard: '1', b: 'order_items', bCard: 'n', label: 'VariantOrder' },
  { a: 'orders', aCard: '1', b: 'order_items', bCard: 'n', label: 'Contains' },
  { a: 'orders', aCard: '1', b: 'order_status_histories', bCard: 'n', label: 'StatusLog' },
  { a: 'orders', aCard: '1', b: 'payments', bCard: '1', label: 'Pays' },
  { a: 'orders', aCard: '1', b: 'refunds', bCard: 'n', label: 'Refunds' },
  { a: 'orders', aCard: 'n', b: 'coupons', bCard: '1', label: 'Applies' },
  { a: 'orders', aCard: '1', b: 'reviews', bCard: 'n', label: 'OrderReview' },
  { a: 'payments', aCard: '1', b: 'refunds', bCard: 'n', label: 'RefundPay' },
  { a: 'order_items', aCard: '1', b: 'reviews', bCard: '1', label: 'ItemReview' },
  { a: 'coupons', aCard: '1', b: 'coupon_redemptions', bCard: 'n', label: 'Redeemed' },
  { a: 'users', aCard: '1', b: 'coupon_redemptions', bCard: 'n', label: 'Redeems' },
  { a: 'orders', aCard: '1', b: 'coupon_redemptions', bCard: 'n', label: 'Attached' },
  { a: 'conversations', aCard: '1', b: 'messages', bCard: 'n', label: 'Contains' },
]

function parseDbmlErd(content) {
  const entities = {}
  const tableRe = /Table\s+(\w+)\s*\{([^}]*)\}/g
  let m
  while ((m = tableRe.exec(content)) !== null) {
    const table = m[1]
    const body = m[2]
    const fields = []
    for (const line of body.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//')) continue
      const fm = trimmed.match(/^(\w+)\s+\w+(?:\([^)]*\))?(?:\s*\[([^\]]*)\])?/)
      if (!fm) continue
      const name = fm[1]
      const flags = fm[2] ?? ''
      const isPk = flags.includes('pk')
      if (!isPk && FK_FIELDS.has(name)) continue
      fields.push({ name, isPk })
    }
    entities[table] = fields
  }
  return entities
}

function fieldLabel(_table, field) {
  return field.name
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function entityHtmlLabel(table, fields) {
  const title = escapeHtml(ENTITY_NAMES[table] ?? table)
  const rows = fields
    .map((f) => `<TR><TD ALIGN="LEFT">+ ${escapeHtml(fieldLabel(table, f))}</TD></TR>`)
    .join('')
  return `<
<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" BGCOLOR="${BODY_BG}" COLOR="${BORDER_COLOR}">
  <TR><TD BGCOLOR="${HEADER_BG}" ALIGN="CENTER"><B>${title}</B></TD></TR>
  ${rows}
</TABLE>
>`
}

function buildDot(entities, relationships) {
  const usedTables = new Set(relationships.flatMap((r) => [r.a, r.b]))

  const entityNodes = [...usedTables]
    .sort()
    .map((t) => {
      const fields = entities[t] ?? [{ name: 'id', isPk: true }]
      const label = entityHtmlLabel(t, fields)
      return `  "${t}" [label=${label}, shape=plaintext, fontname="Segoe UI"];`
    })
    .join('\n')

  let relId = 0
  const relNodes = []
  const edges = []

  for (const r of relationships) {
    const rid = `rel_${relId++}`
    relNodes.push(
      `  "${rid}" [label="${r.label}", shape=diamond, style="filled,bold", fillcolor="${DIAMOND_FILL}", color="${DIAMOND_BORDER}", fontname="Segoe UI", fontsize=12, fontcolor="#212121", width=0.55, height=0.55];`,
    )
    edges.push(
      `  "${r.a}" -> "${rid}" [color="${EDGE_COLOR}", penwidth=1.4, arrowhead=none, taillabel="${r.aCard}", labeldistance=2.2, labelangle=-18, fontsize=11, fontname="Segoe UI", fontcolor="#212121"];`,
    )
    edges.push(
      `  "${rid}" -> "${r.b}" [color="${EDGE_COLOR}", penwidth=1.4, arrowhead=none, headlabel="${r.bCard}", labeldistance=2.2, labelangle=18, fontsize=11, fontname="Segoe UI", fontcolor="#212121"];`,
    )
  }

  return `digraph ERD {
  graph [
    rankdir=TB,
    bgcolor="white",
    pad=0.6,
    splines=ortho,
    nodesep=0.9,
    ranksep=1.4,
    fontname="Segoe UI"
  ];

${entityNodes}

${relNodes.join('\n')}

${edges.join('\n')}
}
`
}

async function main() {
  const dbml = fs.readFileSync(dbmlPath, 'utf8')
  const entities = parseDbmlErd(dbml)
  const dot = buildDot(entities, RELATIONSHIPS)
  const viz = await instance()
  const svg = viz.renderString(dot, { format: 'svg', engine: 'dot' })

  fs.mkdirSync(outDir, { recursive: true })
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 4800 },
    background: 'white',
  })
  fs.writeFileSync(outPng, resvg.render().asPng())

  const n = new Set(RELATIONSHIPS.flatMap((r) => [r.a, r.b])).size
  console.log(`Saved ERD: ${outPng} (${RELATIONSHIPS.length} relationships, ${n} entities)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
