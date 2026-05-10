import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cartQueryKeys } from "../../services/cartApi";
import logoEvo from "../../assets/logo-evo.png";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear cart cache sau khi đặt hàng thành công
    queryClient.invalidateQueries(cartQueryKeys.cart);
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100/90 via-orange-50/70 to-amber-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-200/50 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Đặt hàng thành công!</h1>
          <p className="mb-6 text-gray-600">
            Cảm ơn bạn đã mua sắm tại EvoMarket
          </p>

          {/* Order Info */}
          <div className="mb-8 rounded-xl bg-orange-50/50 p-6">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Mã đơn hàng
            </div>
            <p className="font-mono text-2xl font-bold text-orange-600">#{orderId}</p>
            <p className="mt-2 text-sm text-gray-500">
              {new Date().toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Order Status Steps */}
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Theo dõi đơn hàng</h3>
            <div className="flex items-center justify-center gap-2">
              {[
                { label: "Chờ xác nhận", active: true },
                { label: "Đang chuẩn bị", active: false },
                { label: "Đang giao", active: false },
                { label: "Hoàn thành", active: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.active
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}>
                      {step.active ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span className="mt-1 text-[10px] text-gray-500 max-w-[60px] text-center">
                      {step.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`h-px w-12 ${
                      step.active ? "bg-orange-500" : "bg-gray-300"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý quan trọng
            </div>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• Đơn hàng sẽ được xác nhận trong vòng 24h</li>
              <li>• Bạn sẽ nhận được thông báo qua email và SMS</li>
              <li>• Có thể hủy đơn hàng trước khi người bán xác nhận</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/customer/orders"
              className="flex-1 rounded-lg border-2 border-orange-500 bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Xem đơn hàng
            </Link>
            <Link
              to="/customer/homepage"
              className="flex-1 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{" "}
            <Link to="/customer/support" className="font-medium text-orange-600 hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>

        {/* Logo */}
        <div className="mt-8 flex justify-center">
          <img src={logoEvo} alt="EvoMarket" className="h-12 opacity-40" />
        </div>
      </div>
    </div>
  );
}
