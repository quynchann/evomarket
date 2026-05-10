/**
 * Body POST /orders — khớp với backend/src/services/order.service.js#createOrder
 * (product_id, variant_id, quantity, fullname, email, phone, address, payment_method)
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
 */
export function buildCreateOrderRequestBody({
  cartItems,
  fullname,
  email,
  phone,
  address,
  paymentUi,
}) {
  const payment_method =
    PAYMENT_UI_TO_API[paymentUi] ?? PAYMENT_UI_TO_API.cod;

  return {
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
  };
}
