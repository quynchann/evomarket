/** Cổng thanh toán — dùng chung checkout & trang kết quả (UI, sau này gắn API) */
export const VNPAY_GATEWAY_ID = "vnpay";

export const ONLINE_GATEWAYS = [
  {
    id: VNPAY_GATEWAY_ID,
    label: "VNPay",
    description: "Thẻ ATM nội địa / thẻ quốc tế, QR và ví điện tử qua cổng VNPay",
  },
];

export function getGatewayLabel(id) {
  return ONLINE_GATEWAYS.find((g) => g.id === id)?.label ?? id ?? "";
}
