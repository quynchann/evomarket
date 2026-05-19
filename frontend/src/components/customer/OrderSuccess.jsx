import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartQueryKeys } from "../../services/cartApi";
import { checkoutApi } from "../../services/checkoutApi";
import { couponQueryKeys } from "../../services/couponApi";
import { getGatewayLabel, VNPAY_GATEWAY_ID } from "../../constants/onlineGateways";
import logoEvo from "../../assets/logo-evo.png";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [payBusy, setPayBusy] = useState(false);

  const fromVnpay = params.get("from") === "vnpay";
  const paidParam = params.get("paid");
  const paidSuccess = paidParam === "1";
  const paidFailed = paidParam === "0";
  const vnpMsg = typeof params.get("msg") === "string" ? params.get("msg").trim() : "";

  const paymentUi =
    location.state?.paymentUi === "online" || fromVnpay ? "online" : "cod";
  let onlineGateway =
    typeof location.state?.onlineGateway === "string"
      ? location.state.onlineGateway
      : null;
  if (!onlineGateway && paymentUi === "online") onlineGateway = VNPAY_GATEWAY_ID;

  const orderTotal =
    typeof location.state?.orderTotal === "number" && !Number.isNaN(location.state.orderTotal)
      ? location.state.orderTotal
      : null;
  const gatewayLabel = onlineGateway ? getGatewayLabel(onlineGateway) : "";

  const isOnlineCheckout = paymentUi === "online";

  const headline = useMemo(() => {
    if (fromVnpay && paidSuccess) return "Thanh toán thành công";
    if (fromVnpay && paidFailed) return "Thanh toán chưa hoàn tất";
    if (isOnlineCheckout) return "Đơn hàng đã được tạo";
    return "Đặt hàng thành công!";
  }, [fromVnpay, paidSuccess, paidFailed, isOnlineCheckout]);

  const subcopy = useMemo(() => {
    if (fromVnpay && paidSuccess) return "VNPay đã xác nhận giao dịch — cảm ơn bạn!";
    if (fromVnpay && paidFailed) {
      return vnpMsg
        ? `${vnpMsg}. Bạn có thể chọn “Thanh toán VNPay” để thử lại.`
        : "Giao dịch không thành công hoặc bị hủy. Bạn có thể thanh toán lại.";
    }
    if (isOnlineCheckout) {
      return `Hoàn tất thanh toán qua ${gatewayLabel || "VNPay"} để đơn được xử lý nhanh chóng hơn.`;
    }
    return "Cảm ơn bạn đã mua sắm tại EvoMarket";
  }, [fromVnpay, paidSuccess, paidFailed, isOnlineCheckout, gatewayLabel, vnpMsg]);

  const needsPayAction = isOnlineCheckout && !(fromVnpay && paidSuccess);

  async function gotoVnpay() {
    const id = Number(orderId);
    if (!Number.isFinite(id)) return;
    setPayBusy(true);
    try {
      const payRes = await checkoutApi.createVNPayUrl(orderId);
      const url = payRes?.data?.paymentUrl;
      if (typeof url === "string" && url.startsWith("http")) {
        window.location.assign(url);
        return;
      }
      toast.error("Không nhận được liên kết thanh toán — thử lại sau.");
    } catch (err) {
      toast.error(err?.message || "Không tạo được liên kết VNPay (kiểm tra cấu hình TMN/code).");
    } finally {
      setPayBusy(false);
    }
  }

  useEffect(() => {
    queryClient.invalidateQueries(cartQueryKeys.cart);
    queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
    queryClient.invalidateQueries({ queryKey: couponQueryKeys.platform });
    queryClient.invalidateQueries({ queryKey: ["coupons", "shop"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100/90 via-orange-50/70 to-amber-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-200/50 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {fromVnpay && paidSuccess ? (
                <>
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </>
              ) : isOnlineCheckout ? (
                <>
                  <div
                    className={`absolute inset-0 rounded-full ${
                      fromVnpay && paidFailed ? "animate-pulse bg-red-400/25" : "animate-pulse bg-amber-400/30"
                    }`}
                  />
                  <div
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg ${
                      fromVnpay && paidFailed
                        ? "bg-gradient-to-br from-amber-500 to-orange-600"
                        : "bg-gradient-to-br from-amber-400 to-orange-500"
                    }`}
                  >
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">{headline}</h1>
          <p className="mb-6 text-gray-600">{subcopy}</p>

          {needsPayAction && (
            <div className="mb-6 rounded-xl border border-dashed border-orange-300 bg-gradient-to-br from-orange-50/90 to-amber-50/50 p-5 text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-900/70">
                    Thanh toán trực tuyến
                  </p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{gatewayLabel || "VNPay"}</p>
                  {orderTotal != null && (
                    <p className="mt-0.5 text-sm text-gray-600">
                      Tạm tính trên trang thanh toán:{" "}
                      <span className="font-semibold text-orange-600">{formatPrice(orderTotal)}</span>. Số tiền thu trên
                      VNPay lấy đúng&nbsp;
                      <span className="font-medium">tổng đơn</span>
                      &nbsp;đã lưu trên server (có thể khác nếu phí ship chưa được tính vào đơn).
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={gotoVnpay}
                  disabled={payBusy}
                  title="Chuyển đến VNPay"
                  className="whitespace-nowrap rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-75"
                >
                  {payBusy ? "Đang mở VNPay…" : "Thanh toán VNPay"}
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
                Sau khi bấm, bạn sẽ được chuyển tới sandbox hoặc cổng VNPay của shop. Theo dõi đơn tại&nbsp;
                <Link className="text-orange-600 hover:underline" to="/customer/orders">
                  Đơn hàng của tôi
                </Link>
                .
              </p>
            </div>
          )}

          <div className="mb-8 rounded-xl bg-orange-50/50 p-6">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Mã đơn hàng
            </div>
            <p className="font-mono text-2xl font-bold text-orange-600">#{orderId}</p>
            <p className="mt-2 text-sm text-gray-500">{new Date().toLocaleString("vi-VN")}</p>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Theo dõi đơn hàng</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(isOnlineCheckout
                ? [
                    { label: "Tạo đơn", state: "done" },
                    {
                      label: "Thanh toán",
                      state: paidSuccess ? "done" : fromVnpay && paidFailed ? "fail" : "current",
                    },
                    { label: "Shop xác nhận", state: "todo" },
                    { label: "Giao hàng", state: "todo" },
                  ]
                : [
                    { label: "Chờ xác nhận", state: "current" },
                    { label: "Đang chuẩn bị", state: "todo" },
                    { label: "Đang giao", state: "todo" },
                    { label: "Hoàn thành", state: "todo" },
                  ]
              ).map((step, i, arr) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          step.state === "done"
                            ? "border-orange-500 bg-orange-500 text-white"
                            : step.state === "fail"
                              ? "border-red-400 bg-red-50 text-red-600 ring-4 ring-red-100"
                              : step.state === "current"
                                ? "border-orange-500 bg-white text-orange-600 ring-4 ring-orange-100"
                                : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {step.state === "done" ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : step.state === "fail" ? (
                          <span className="text-base font-bold">!</span>
                        ) : step.state === "current" ? (
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                        ) : (
                          <span className="text-xs font-semibold">{i + 1}</span>
                        )}
                      </div>
                      <span className="mt-1 max-w-[72px] text-center text-[10px] text-gray-500">{step.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`mx-1 h-px w-8 sm:w-12 ${step.state === "done" ? "bg-orange-400" : "bg-gray-300"}`} />
                    )}
                  </div>
              ))}
            </div>
          </div>

          <div
            className={`mb-8 rounded-lg border p-4 text-left ${
              isOnlineCheckout ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${isOnlineCheckout ? "text-amber-900" : "text-blue-900"}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý quan trọng
            </div>
            {isOnlineCheckout ? (
              <ul className="space-y-1 text-xs text-amber-900/90">
                <li>
                  • Kết quả chính thức cập nhật trạng thái thanh toán dựa vào IPN của VNPay — trang hiển thị sau khi bạn quay về chỉ là thông báo nhanh.
                </li>
                <li>• Giữ VITE_API_URL / API_PUBLIC_BASE_URL / BASE_URL_FRONTEND trong .env trùng với URL đã đăng ký trên VNPay.</li>
              </ul>
            ) : (
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Đơn hàng sẽ được xác nhận trong vòng 24h</li>
                <li>• Bạn sẽ nhận được thông báo qua email và SMS</li>
                <li>• Có thể hủy đơn hàng trước khi người bán xác nhận</li>
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/customer/orders"
              className="flex-1 rounded-lg border-2 border-orange-500 bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50 text-center"
            >
              Xem đơn hàng
            </Link>
            <Link
              to="/customer/homepage"
              className="flex-1 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 text-center"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{" "}
            <Link to="/customer/support" className="font-medium text-orange-600 hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <img src={logoEvo} alt="EvoMarket" className="h-12 opacity-40" />
        </div>
      </div>
    </div>
  );
}
