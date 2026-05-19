/** Luồng đơn hàng — giá trị lưu DB (Enum / VARCHAR) */

export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  SHIPPED: 'SHIPPED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  /** Shop đã chấp nhận trả hàng, đang xử lý hoàn tiền (COD chuyển khoản / Online đã hoặc sẽ hoàn qua cổng) */
  RETURN_ACCEPTED: 'RETURN_ACCEPTED',
  /** Đã hoàn tiền cho người mua — đơn kết thúc theo hướng trả hàng */
  REFUNDED: 'REFUNDED',
}

export const ORDER_STATUS_VI = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PREPARING]: 'Đang chuẩn bị hàng',
  [ORDER_STATUS.SHIPPED]: 'Đã giao cho đơn vị vận chuyển',
  [ORDER_STATUS.COMPLETED]: 'Hoàn tất',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.RETURN_REQUESTED]: 'Yêu cầu trả hàng',
  [ORDER_STATUS.RETURN_ACCEPTED]: 'Chấp nhận trả hàng — chờ hoàn tiền',
  [ORDER_STATUS.REFUNDED]: 'Đã hoàn tiền',
}

/** Seller: chỉ được chuyển từng bước (không nhảy cóc) */
export const SELLER_NEXT_STATUSES = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.SHIPPED]: [],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.RETURN_REQUESTED]: [],
  [ORDER_STATUS.RETURN_ACCEPTED]: [],
  [ORDER_STATUS.REFUNDED]: [],
}

/** Buyer hủy đơn */
export const BUYER_CANCELABLE_STATUSES = new Set([
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.CONFIRMED,
])

/** Seller hủy đơn (trước khi bàn giao ĐVVC) */
export const SELLER_CANCELABLE_STATUSES = new Set([
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
])

export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS)

/** Doanh thu / GMV: đơn đã cam kết (không tính chỉ mới đặt hoặc đã hủy) */
export const REVENUE_COUNTED_ORDER_STATUSES = [
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.RETURN_REQUESTED,
  ORDER_STATUS.RETURN_ACCEPTED,
]
