import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { couponApi, couponQueryKeys } from "../../services/couponApi";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN");
}

/** Lọc phụ theo ngày — API đã lọc hạn; giữ để an toàn hiển thị */
function isVoucherCurrentlyValid(voucher) {
  const now = Date.now();
  if (voucher.startDate) {
    const start = new Date(voucher.startDate);
    start.setHours(0, 0, 0, 0);
    if (now < start.getTime()) return false;
  }
  if (voucher.expiry) {
    const end = new Date(voucher.expiry);
    end.setHours(23, 59, 59, 999);
    if (now > end.getTime()) return false;
  }
  return true;
}

export default function ShopVoucherSection({
  shopId,
  shopName,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(
    appliedVoucher?.id || null,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: couponQueryKeys.shop(shopId),
    queryFn: async () => {
      const res = await couponApi.getShopCoupons(shopId);
      return res?.data?.vouchers ?? [];
    },
    enabled: shopId != null && Number(shopId) > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    setSelectedVoucherId(appliedVoucher?.id ?? null);
  }, [appliedVoucher?.id]);

  const shopVouchers = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.filter(isVoucherCurrentlyValid);
  }, [data]);

  const handleSelectVoucher = (voucher) => {
    if (selectedVoucherId === voucher.id) {
      setSelectedVoucherId(null);
      onRemoveVoucher(shopId);
    } else {
      setSelectedVoucherId(voucher.id);
      onApplyVoucher(shopId, voucher);
    }
  };

  return (
    <div className="border-t border-orange-100/70 bg-gradient-to-r from-orange-50/40 to-transparent">
      <div className="flex items-center justify-between px-5 py-3 lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="font-medium text-gray-800">Voucher của Shop</span>
          {appliedVoucher && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              Đã áp dụng
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
          disabled={isLoading}
        >
          {isExpanded ? "Thu gọn" : `Chọn voucher (${shopVouchers.length})`}
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isError && (
        <div className="px-5 pb-3 text-xs text-red-600 lg:px-8">
          Không tải được voucher shop. Thử lại sau.
        </div>
      )}

      {!isExpanded && appliedVoucher && (
        <div className="px-5 pb-3 lg:px-8">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{appliedVoucher.title}</p>
              <p className="mt-0.5 text-xs text-gray-600">Mã: {appliedVoucher.code}</p>
              {(appliedVoucher.startDate || appliedVoucher.expiry) && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {appliedVoucher.startDate && (
                    <span>Hiệu lực từ {formatDate(appliedVoucher.startDate)}</span>
                  )}
                  {appliedVoucher.startDate && appliedVoucher.expiry && <span> · </span>}
                  {appliedVoucher.expiry && <span>HSD: {formatDate(appliedVoucher.expiry)}</span>}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onRemoveVoucher(shopId);
                setSelectedVoucherId(null);
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Bỏ
            </button>
          </div>
        </div>
      )}

      {isExpanded && isLoading && (
        <div className="px-5 pb-4 text-center text-xs text-gray-500 lg:px-8">Đang tải voucher...</div>
      )}
      {isExpanded && !isLoading && shopVouchers.length === 0 && (
        <div className="px-5 pb-4 text-center text-xs text-gray-500 lg:px-8">
          Không có voucher shop khả dụng (hết lượt, hết hạn, hoặc bạn đã dùng mã).
        </div>
      )}
      {isExpanded && !isLoading && shopVouchers.length > 0 && (
        <div className="space-y-2 px-5 pb-4 lg:px-8">
          {shopVouchers.map((voucher) => (
            <div
              key={voucher.id}
              onClick={() => handleSelectVoucher(voucher)}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                selectedVoucherId === voucher.id
                  ? "border-blue-500 bg-blue-50/40 shadow-md"
                  : "border-orange-100/60 bg-white hover:border-blue-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-stretch">
                <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                  <svg className="mb-1 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-center text-xs font-bold">
                    {voucher.type === "percentage"
                      ? `${voucher.discount}%`
                      : formatPrice(voucher.discount)}
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{voucher.title}</h4>
                      {voucher.newUserOnly && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                          Người mới
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{voucher.description}</p>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>Đơn tối thiểu: {formatPrice(voucher.minOrder)}</span>
                      {voucher.quantity != null && (
                        <span className="text-blue-600">Còn {voucher.quantity} lượt</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {voucher.startDate && <span>Từ: {formatDate(voucher.startDate)}</span>}
                      {voucher.expiry && (
                        <span className="font-medium text-gray-700">HSD: {formatDate(voucher.expiry)}</span>
                      )}
                    </div>
                    <div className="flex justify-end pt-0.5">
                      <div className="inline-flex items-center gap-1.5 rounded border border-dashed border-blue-300 bg-blue-50 px-1.5 py-0.5">
                        <span className="font-mono font-bold text-blue-700">{voucher.code}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center pr-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 transition ${
                      selectedVoucherId === voucher.id
                        ? "border-blue-500 bg-blue-500"
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
  );
}
