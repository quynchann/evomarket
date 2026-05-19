import { runAutoCompleteShippedOrders } from '../services/order.service.js'

const HOUR_MS = 60 * 60 * 1000

/**
 * Job định kỳ: đơn SHIPPED quá N ngày → COMPLETED (buyer không bấm nhận / trả hàng).
 */
export function startOrderAutoCompleteScheduler() {
  const tick = () => {
    runAutoCompleteShippedOrders().catch((err) =>
      console.error('[order-auto-complete]', err),
    )
  }
  setTimeout(tick, 15_000)
  setInterval(tick, HOUR_MS)
}
