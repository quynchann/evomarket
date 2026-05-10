import { useState } from "react";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

export default function VoucherModal({ isOpen, onClose, onApplyVoucher }) {
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  // Mock data - Voucher Sàn (Platform)
  const platformVouchers = [
    {
      id: "plat_1",
      code: "EVOMARKET50K",
      title: "Giảm 50K cho đơn từ 500K",
      discount: 50000,
      minOrder: 500000,
      maxDiscount: 50000,
      expiry: "2026-05-31",
      quantity: 100,
      type: "fixed",
      description: "Áp dụng cho tất cả sản phẩm",
    },
    {
      id: "plat_2",
      code: "FREESHIP",
      title: "Miễn phí vận chuyển",
      discount: 30000,
      minOrder: 0,
      maxDiscount: 30000,
      expiry: "2026-04-30",
      quantity: 50,
      type: "shipping",
      description: "Giảm tối đa 30K phí ship",
    },
    {
      id: "plat_3",
      code: "SALE20",
      title: "Giảm 20% tối đa 100K",
      discount: 20,
      minOrder: 300000,
      maxDiscount: 100000,
      expiry: "2026-06-15",
      quantity: 200,
      type: "percentage",
      description: "Áp dụng cho đơn từ 300K",
    },
  ];

  const handleApply = () => {
    const voucher = platformVouchers.find((v) => v.id === selectedVoucherId);
    if (voucher) {
      onApplyVoucher(voucher);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-orange-100/80 bg-gradient-to-r from-orange-50 via-white to-orange-50/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Voucher Sàn EvoMarket</h2>
              <p className="mt-1 text-sm text-gray-500">Chọn voucher áp dụng cho toàn bộ đơn hàng</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {platformVouchers.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                <svg className="h-10 w-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">Chưa có voucher sàn khả dụng</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  onClick={() => setSelectedVoucherId(voucher.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    selectedVoucherId === voucher.id
                      ? "border-[#ee4d2d] bg-orange-50/40 shadow-md"
                      : "border-orange-100/60 bg-white hover:border-orange-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* Left: Icon & Discount */}
                    <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-[#ee4d2d] p-4 text-white">
                      {voucher.type === "shipping" ? (
                        <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      ) : (
                        <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <p className="text-center text-xs font-bold">
                        {voucher.type === "percentage"
                          ? `${voucher.discount}%`
                          : formatPrice(voucher.discount)}
                      </p>
                      <p className="mt-0.5 text-[10px] opacity-90">OFF</p>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
                        {voucher.shopName && (
                          <p className="mt-1 text-xs text-orange-600">
                            <span className="rounded bg-orange-100 px-1.5 py-0.5">
                              {voucher.shopName}
                            </span>
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">{voucher.description}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-orange-50 pt-2 text-xs text-gray-500">
                        <div className="flex gap-4">
                          <span>Đơn tối thiểu: {formatPrice(voucher.minOrder)}</span>
                          <span>HSD: {formatDate(voucher.expiry)}</span>
                        </div>
                        <span className="text-orange-600">Còn {voucher.quantity}</span>
                      </div>

                      {/* Code */}
                      <div className="mt-2 inline-flex items-center gap-2 self-start rounded-md border border-dashed border-orange-300 bg-orange-50/50 px-2 py-1">
                        <span className="font-mono text-xs font-bold text-orange-700">
                          {voucher.code}
                        </span>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div className="flex items-center pr-4">
                      <div
                        className={`h-5 w-5 rounded-full border-2 transition ${
                          selectedVoucherId === voucher.id
                            ? "border-[#ee4d2d] bg-[#ee4d2d]"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedVoucherId === voucher.id && (
                          <svg className="h-full w-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-orange-100/80 bg-gradient-to-r from-orange-50/95 via-white to-orange-50/90 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="rounded-lg border-2 border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedVoucherId}
              className="flex-1 rounded-lg bg-[#ee4d2d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-300/40 transition hover:bg-[#d73211] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedVoucherId ? "Áp dụng" : "Chọn voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
