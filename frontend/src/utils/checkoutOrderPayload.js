/**
 * Body POST /orders — khớp backend createOrder
 * (items, fullname, email, phone, address, payment_method, shipping_method?, coupon_code?, shop_coupons?, buyer_note?)
 */

export const PAYMENT_UI_TO_API = {
  cod: "COD",
  online: "Online",
};

/**
 * @param {object} params
 * @param {Array<{ productId: number, variantId: number|null, quantity: number }>} params.cartItems
 * @param {string} params.fullname
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.address
 * @param {'cod'|'online'} params.paymentUi
 * @param {'standard'|'express'} [params.shippingMethod] — khớp backend (standard 0đ, express 15k)
 * @param {string} [params.couponCode] — mã sàn
 * @param {Record<string, string>} [params.shopCoupons] — seller id (string) -> mã shop
 * @param {string} [params.buyerNote] — ghi chú người mua
 */
export function buildCreateOrderRequestBody({
  cartItems,
  fullname,
  email,
  phone,
  address,
  paymentUi,
  shippingMethod = "standard",
  couponCode,
  shopCoupons,
  buyerNote,
}) {
  const payment_method =
    PAYMENT_UI_TO_API[paymentUi] ?? PAYMENT_UI_TO_API.cod;

  const ship =
    shippingMethod === "express" ? "express" : "standard";

  const body = {
    items: cartItems.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
    })),
    fullname: fullname?.trim?.() ?? "",
    email: email?.trim?.() ?? "",
    phone: phone?.trim?.() ?? "",
    address: address?.trim?.() ?? "",
    payment_method,
    shipping_method: ship,
  };

  const code = couponCode != null ? String(couponCode).trim() : "";
  if (code) {
    body.coupon_code = code;
  }

  if (shopCoupons && typeof shopCoupons === "object") {
    const entries = Object.entries(shopCoupons).filter(
      ([, v]) => v != null && String(v).trim() !== "",
    );
    if (entries.length > 0) {
      body.shop_coupons = Object.fromEntries(
        entries.map(([k, v]) => [String(k), String(v).trim()]),
      );
    }
  }

  const note = buyerNote != null ? String(buyerNote).trim().slice(0, 500) : "";
  if (note) {
    body.buyer_note = note;
  }

  return body;
}
