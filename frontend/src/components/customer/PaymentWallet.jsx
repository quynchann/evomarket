import { Link } from "react-router-dom";
import { Wallet, CreditCard, ShieldCheck, Package, ExternalLink, ArrowRight } from "lucide-react";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

export default function PaymentWallet() {
  const balance = 0;

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ví thanh toán</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Quản lý phương thức thanh toán và theo dõi giao dịch trên EvoMarket
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                <Wallet className="h-6 w-6 text-orange-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 p-6 text-white shadow-lg shadow-orange-300/40">
            <p className="text-sm font-medium text-orange-100">Số dư ví</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{formatPrice(balance)}</p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-orange-100/90">
              Nạp/rút ví sẽ được bật khi hệ thống hỗ trợ. Hiện bạn thanh toán đơn hàng trực tiếp qua VNPay khi chọn thanh
              toán trực tuyến ở bước đặt hàng.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Cổng thanh toán trực tuyến</h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              EvoMarket chỉ sử dụng <strong className="text-gray-800">VNPay</strong> cho thanh toán online: thẻ nội địa,
              thẻ quốc tế và quét QR.
            </p>
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-900/70">Mặc định</p>
                  <p className="mt-1 text-base font-bold text-gray-900">VNPay</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">An toàn</h2>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
              <li>Thông tin thẻ được xử lý bởi VNPay, EvoMarket không lưu số thẻ đầy đủ.</li>
              <li>Chỉ thanh toán sau khi bạn xác nhận trên trang VNPay.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h2>
            </div>
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-12 text-center">
              <p className="text-sm text-gray-600">Chưa có lịch sử ví trên trang này.</p>
              <p className="mt-1 text-xs text-gray-500">Xem chi tiết thanh toán theo từng đơn hàng.</p>
              <Link
                to="/customer/orders"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200/50 transition hover:bg-orange-700">
                Đơn hàng của tôi
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center pb-4">
            <Link
              to="/customer/cart"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline">
              Tiếp tục mua sắm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
