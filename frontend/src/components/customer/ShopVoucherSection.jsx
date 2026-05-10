import { useState } from "react";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function ShopVoucherSection({ 
  shopId, 
  shopName, 
  appliedVoucher, 
  onApplyVoucher, 
  onRemoveVoucher 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(
    appliedVoucher?.id || null
  );

  // Mock data - thay bằng API call thực tế theo shopId
  const shopVouchers = [
    {
      id: `${shopId}_v1`,
      code: "SHOP10K",
      shopId: shopId,
      shopName: shopName,
      title: "Giảm 10K cho đơn từ 100K",
      discount: 10000,
      minOrder: 100000,
      maxDiscount: 10000,
      expiry: "2026-05-15",
      quantity: 30,
      type: "fixed",
      description: "Áp dụng cho shop này",
    },
    {
      id: `${shopId}_v2`,
      code: "SHOP15",
      shopId: shopId,
      shopName: shopName,
      title: "Giảm 15% tối đa 50K",
      discount: 15,
      minOrder: 200000,
      maxDiscount: 50000,
      expiry: "2026-04-25",
      quantity: 20,
      type: "percentage",
      description: "Giảm 15% cho đơn từ 200K",
    },
    {
      id: `${shopId}_v3`,
      code: "NEWCUSTOMER",
      shopId: shopId,
      shopName: shopName,
      title: "Khách hàng mới giảm 20K",
      discount: 20000,
      minOrder: 150000,
      maxDiscount: 20000,
      expiry: "2026-06-30",
      quantity: 50,
      type: "fixed",
      description: "Dành cho khách hàng mới",
    },
  ];

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
      {/* Header - Always visible */}
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

      {/* Applied Voucher Summary (when collapsed) */}
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

      {/* Expanded Voucher List */}
      {isExpanded && (
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
                {/* Left: Icon & Discount */}
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

                {/* Right: Info */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{voucher.title}</h4>
                    <p className="mt-0.5 text-xs text-gray-500">{voucher.description}</p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Đơn tối thiểu: {formatPrice(voucher.minOrder)}</span>
                    <div className="inline-flex items-center gap-1.5 rounded border border-dashed border-blue-300 bg-blue-50 px-1.5 py-0.5">
                      <span className="font-mono font-bold text-blue-700">{voucher.code}</span>
                    </div>
                  </div>
                </div>

                {/* Radio indicator */}
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
