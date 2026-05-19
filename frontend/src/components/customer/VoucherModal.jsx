import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { couponApi, couponQueryKeys } from "../../services/couponApi";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN");
}

export default function VoucherModal({ isOpen, onClose, onApplyVoucher, cartSubtotal = 0 }) {
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: couponQueryKeys.platform,
    queryFn: async () => {
      const res = await couponApi.getPlatformCoupons();
      return res?.data?.vouchers ?? [];
    },
    enabled: isOpen,
    staleTime: 30_000,
  });

  const platformVouchers = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (!isOpen) {
      setSelectedVoucherId(null);
      return;
    }
    setSelectedVoucherId(null);
  }, [isOpen, platformVouchers.length]);

  const handleApply = () => {
    const voucher = platformVouchers.find((v) => v.id === selectedVoucherId);
    if (voucher) {
      if (cartSubtotal < voucher.minOrder) {
        return;
      }
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
              <p className="mt-1 text-sm text-gray-500">
                Chọn voucher áp dụng cho toàn bộ đơn hàng — có ngày hết hạn; mỗi tài khoản chỉ dùng một lần / mã
              </p>
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
          {isLoading ? (
            <div className="py-16 text-center text-gray-600">Đang tải voucher...</div>
          ) : isError ? (
            <div className="py-16 text-center text-red-600">{error?.message || "Không tải được danh sách voucher"}</div>
          ) : platformVouchers.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                <svg className="h-10 w-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Chưa có voucher sàn khả dụng</p>
              <p className="mt-2 text-xs text-gray-400">
                Bạn có thể đã dùng hết mã, hoặc mã đã hết hạn / không còn lượt.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformVouchers.map((voucher) => {
                const subOk = cartSubtotal >= voucher.minOrder;
                return (
                  <div
                    key={voucher.id}
                    onClick={() => subOk && setSelectedVoucherId(voucher.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 transition ${
                      !subOk
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                        : selectedVoucherId === voucher.id
                          ? "cursor-pointer border-[#ee4d2d] bg-orange-50/40 shadow-md"
                          : "cursor-pointer border-orange-100/60 bg-white hover:border-orange-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-stretch">
                      {/* Left: Icon & Discount */}
                      <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-[#ee4d2d] p-4 text-white">
                        <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-center text-xs font-bold">
                          {voucher.type === "percentage" ? `${voucher.discount}%` : formatPrice(voucher.discount)}
                        </p>
                        <p className="mt-0.5 text-[10px] opacity-90">OFF</p>
                      </div>

                      {/* Right: Info */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
                            {voucher.newUserOnly && (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                Người mới
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{voucher.description}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-orange-50 pt-2 text-xs text-gray-500">
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span>Đơn tối thiểu: {formatPrice(voucher.minOrder)}</span>
                            {voucher.expiry && <span>HSD: {formatDate(voucher.expiry)}</span>}
                            {voucher.startDate && <span>Từ: {formatDate(voucher.startDate)}</span>}
                          </div>
                          <span className="text-orange-600">
                            {voucher.quantity != null ? `Còn ${voucher.quantity} lượt` : "Không giới hạn lượt"}
                          </span>
                        </div>

                        {!subOk && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            Tạm tính hiện tại chưa đạt đơn tối thiểu để chọn mã này.
                          </p>
                        )}

                        {/* Code */}
                        <div className="mt-2 inline-flex items-center gap-2 self-start rounded-md border border-dashed border-orange-300 bg-orange-50/50 px-2 py-1">
                          <span className="font-mono text-xs font-bold text-orange-700">{voucher.code}</span>
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
                );
              })}
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
              disabled={!selectedVoucherId || isLoading}
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
