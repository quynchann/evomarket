/** Khớp backend `backend/src/constants/orderStatus.js` */

export const ORDER_STATUS = {
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
  RETURN_ACCEPTED: "RETURN_ACCEPTED",
  REFUNDED: "REFUNDED",
}

export const ORDER_STATUS_VI = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị hàng",
  [ORDER_STATUS.SHIPPED]: "Đã giao cho đơn vị vận chuyển",
  [ORDER_STATUS.COMPLETED]: "Hoàn tất",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
  [ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng",
  [ORDER_STATUS.RETURN_ACCEPTED]: "Chấp nhận trả — chờ hoàn tiền",
  [ORDER_STATUS.REFUNDED]: "Đã hoàn tiền",
}

/** Bước tiếp theo seller được phép (không nhảy cóc) */
export const SELLER_NEXT_STATUSES = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.RETURN_REQUESTED]: [],
  [ORDER_STATUS.RETURN_ACCEPTED]: [],
  [ORDER_STATUS.REFUNDED]: [],
}

export const SELLER_ACTION_LABEL = {
  [ORDER_STATUS.CONFIRMED]: "Xác nhận đơn",
  [ORDER_STATUS.PREPARING]: "Bắt đầu chuẩn bị hàng",
  [ORDER_STATUS.SHIPPED]: "Đã giao cho đơn vị vận chuyển",
  [ORDER_STATUS.CANCELLED]: "Hủy đơn hàng",
}

/** Tabs / lọc danh sách */
/** Chuẩn hoá giá trị từ API (kể cả bản ghi/môi trường cũ) */
export function normalizeOrderStatus(raw) {
  const key = String(raw ?? "").trim();
  if (!key) return ORDER_STATUS.PENDING_CONFIRMATION;
  const legacy = {
    Pending: ORDER_STATUS.PENDING_CONFIRMATION,
    Processing: ORDER_STATUS.PREPARING,
    Shipped: ORDER_STATUS.SHIPPED,
    Delivered: ORDER_STATUS.COMPLETED,
    Cancelled: ORDER_STATUS.CANCELLED,
    Returned: ORDER_STATUS.RETURN_REQUESTED,
  };
  return legacy[key] ?? key;
}

export const ORDER_FILTER_KEYS = [
  "all",
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.RETURN_REQUESTED,
  ORDER_STATUS.RETURN_ACCEPTED,
  ORDER_STATUS.REFUNDED,
  ORDER_STATUS.CANCELLED,
]

export const statusColors = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: {
    bg: "#fff7ed",
    text: "#92400e",
    border: "#fb923c",
  },
  [ORDER_STATUS.CONFIRMED]: {
    bg: "#eff6ff",
    text: "#1e40af",
    border: "#3b82f6",
  },
  [ORDER_STATUS.PREPARING]: {
    bg: "#fff7ed",
    text: "#92400e",
    border: "#f97316",
  },
  [ORDER_STATUS.SHIPPED]: {
    bg: "#fffbeb",
    text: "#7c2d12",
    border: "#f59e0b",
  },
  [ORDER_STATUS.COMPLETED]: {
    bg: "#ecfdf5",
    text: "#065f46",
    border: "#10b981",
  },
  [ORDER_STATUS.CANCELLED]: {
    bg: "#fef2f2",
    text: "#991b1b",
    border: "#ef4444",
  },
  [ORDER_STATUS.RETURN_REQUESTED]: {
    bg: "#f5f3ff",
    text: "#5b21b6",
    border: "#7c3aed",
  },
  [ORDER_STATUS.RETURN_ACCEPTED]: {
    bg: "#fff7ed",
    text: "#9a3412",
    border: "#ea580c",
  },
  [ORDER_STATUS.REFUNDED]: {
    bg: "#ecfeff",
    text: "#0e7490",
    border: "#06b6d4",
  },
}
