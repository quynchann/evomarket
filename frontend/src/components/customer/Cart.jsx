import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartApi, cartQueryKeys } from "../../services/cartApi";
import { ShoppingCart } from "lucide-react";
import logoEvo from "../../assets/logo-evo.png";
import VoucherModal from "./VoucherModal";
import ShopVoucherSection from "./ShopVoucherSection";

/** Màu CTA + khung layout rộng, tông cam */
const CTA_ORANGE = "bg-[#ee4d2d] hover:bg-[#d73211]";
/** Cùng max-width toàn trang (màn hình lớn không bị “hẹp giữa”) */
const SHELL = "w-full max-w-[min(100%,92rem)] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function groupBySeller(items) {
  const map = new Map();
  for (const item of items) {
    const sid = item.seller?.id ?? 0;
    const name = item.seller?.fullname || "Người bán";
    if (!map.has(sid)) {
      map.set(sid, { sellerId: sid, sellerName: name, items: [] });
    }
    map.get(sid).items.push(item);
  }
  return Array.from(map.values());
}

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [platformVoucher, setPlatformVoucher] = useState(null); // Voucher sàn
  const [shopVouchers, setShopVouchers] = useState({}); // { shopId: voucherObject }

  const { data, isLoading, error } = useQuery({
    queryKey: cartQueryKeys.cart,
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
  });

  const items = data?.items ?? [];
  const summary = data?.summary ?? {
    lineCount: 0,
    totalQuantity: 0,
    subtotal: 0,
  };

  const grouped = useMemo(() => groupBySeller(items), [items]);

  useEffect(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );
  const selectedQty = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((s, i) => s + i.lineTotal, 0);
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  // Tính tổng tiền theo từng shop (cho shop vouchers)
  const shopSubtotals = useMemo(() => {
    const totals = {};
    selectedItems.forEach((item) => {
      const shopId = item.seller?.id || "unknown";
      if (!totals[shopId]) totals[shopId] = 0;
      totals[shopId] += item.lineTotal;
    });
    return totals;
  }, [selectedItems]);

  // Tính giảm giá từ shop vouchers
  const shopVoucherDiscount = useMemo(() => {
    let totalDiscount = 0;
    Object.entries(shopVouchers).forEach(([shopId, voucher]) => {
      const shopTotal = shopSubtotals[shopId] || 0;
      if (shopTotal < voucher.minOrder) return;

      if (voucher.type === "percentage") {
        const discount = (shopTotal * voucher.discount) / 100;
        totalDiscount += Math.min(discount, voucher.maxDiscount);
      } else {
        totalDiscount += voucher.discount;
      }
    });
    return totalDiscount;
  }, [shopVouchers, shopSubtotals]);

  // Tính giảm giá từ platform voucher (áp dụng cho tổng đơn hàng)
  const platformVoucherDiscount = useMemo(() => {
    if (!platformVoucher || selectedSubtotal < platformVoucher.minOrder) return 0;
    
    if (platformVoucher.type === "percentage") {
      const discount = (selectedSubtotal * platformVoucher.discount) / 100;
      return Math.min(discount, platformVoucher.maxDiscount);
    }
    return platformVoucher.discount;
  }, [platformVoucher, selectedSubtotal]);

  const totalVoucherDiscount = shopVoucherDiscount + platformVoucherDiscount;
  const finalTotal = selectedSubtotal - totalVoucherDiscount;

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeller = (sellerItems) => {
    const ids = sellerItems.map((i) => i.id);
    setSelectedIds((prev) => {
      const allOn = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateItem(id, quantity),
    onSuccess: (res) => {
      queryClient.setQueryData(cartQueryKeys.cart, res.data);
    },
    onError: (err) => {
      toast.error(err.message || "Không thể cập nhật");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => cartApi.removeItem(id),
    onSuccess: (res) => {
      queryClient.setQueryData(cartQueryKeys.cart, res.data);
      toast.success("Đã xóa sản phẩm");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xóa");
    },
  });

  const removeBulkMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await cartApi.removeItem(id);
      }
      const res = await cartApi.getCart();
      return res.data;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData(cartQueryKeys.cart, payload);
      toast.success("Đã xóa các sản phẩm đã chọn");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xóa");
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/customer/homepage?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/customer/homepage");
    }
  };

  const handleDeleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      toast.info("Chọn ít nhất một sản phẩm");
      return;
    }
    if (window.confirm(`Xóa ${ids.length} sản phẩm đã chọn?`)) {
      removeBulkMutation.mutate(ids);
    }
  };

  const handleCheckout = () => {
    if (selectedIds.size === 0) {
      toast.info("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }
    navigate("/customer/checkout");
  };

  // Handler cho Platform Voucher
  const handleApplyPlatformVoucher = (voucher) => {
    if (selectedSubtotal < voucher.minOrder) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)}`);
      return;
    }
    setPlatformVoucher(voucher);
    toast.success(`Đã áp dụng voucher sàn: ${voucher.code}`);
  };

  const handleRemovePlatformVoucher = () => {
    setPlatformVoucher(null);
    toast.success("Đã bỏ voucher sàn");
  };

  // Handler cho Shop Voucher
  const handleApplyShopVoucher = (shopId, voucher) => {
    const shopTotal = shopSubtotals[shopId] || 0;
    if (shopTotal < voucher.minOrder) {
      toast.error(`Đơn hàng shop tối thiểu ${formatPrice(voucher.minOrder)}`);
      return;
    }
    setShopVouchers((prev) => ({
      ...prev,
      [shopId]: voucher,
    }));
    toast.success(`Đã áp dụng voucher shop: ${voucher.code}`);
  };

  const handleRemoveShopVoucher = (shopId) => {
    setShopVouchers((prev) => {
      const newVouchers = { ...prev };
      delete newVouchers[shopId];
      return newVouchers;
    });
    toast.success("Đã bỏ voucher shop");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100/80 via-orange-50/50 to-amber-50/30 p-6">
        <p className="text-center text-red-600">
          {error.message || "Không tải được giỏ hàng"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 pb-40 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800">Giỏ hàng</h2>
                <p className="text-sm text-gray-600">
                  Quản lý các sản phẩm trong giỏ hàng của bạn
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : items.length === 0 ? (
          <div className="rounded-xl bg-white py-20 text-center shadow-md">
            <img src={logoEvo} alt="" className="mx-auto mb-4 h-16 opacity-40" />
            <p className="mb-2 text-lg font-medium text-gray-800">Giỏ hàng trống</p>
            <p className="mb-6 text-sm text-gray-500">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            <Link
              to="/customer/homepage"
              className={`inline-block rounded-lg px-8 py-3 text-sm font-medium text-white ${CTA_ORANGE}`}
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header row - desktop */}
            <div className="hidden rounded-xl bg-white px-6 py-4 shadow-sm md:grid md:grid-cols-[40px_2fr_1fr_1.2fr_1fr_100px] md:items-center md:gap-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                aria-label="Chọn tất cả"
              />
              <span className="text-sm font-medium text-gray-700">Sản phẩm</span>
              <span className="text-center text-sm font-medium text-gray-700">Đơn giá</span>
              <span className="text-center text-sm font-medium text-gray-700">Số lượng</span>
              <span className="text-center text-sm font-medium text-gray-700">Thành tiền</span>
              <span className="text-center text-sm font-medium text-gray-700">Thao tác</span>
            </div>

            {grouped.map((group) => {
              const sellerAllSelected =
                group.items.length > 0 &&
                group.items.every((i) => selectedIds.has(i.id));

              return (
                <div key={group.sellerId} className="overflow-hidden rounded-xl bg-white shadow-md">
                  {/* Shop header */}
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={sellerAllSelected}
                      onChange={() => toggleSeller(group.items)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      aria-label={`Chọn shop ${group.sellerName}`}
                    />
                    <span className="rounded-md bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                      SHOP
                    </span>
                    <span className="font-medium text-gray-900">{group.sellerName}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-4 px-6 py-4 transition hover:bg-gray-50/50 md:grid-cols-[40px_2fr_1fr_1.2fr_1fr_100px] md:items-center md:gap-4"
                      >
                        {/* Checkbox + Product info */}
                        <div className="flex items-start gap-4 md:contents">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggle(item.id)}
                            className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-500 md:mt-0"
                            aria-label={`Chọn ${item.title}`}
                          />
                          <div className="flex min-w-0 flex-1 gap-3">
                            <Link
                              to={`/customer/products/${item.productId}`}
                              className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={item.thumbnail || "https://via.placeholder.com/120"}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/customer/products/${item.productId}`}
                                className="line-clamp-2 text-sm text-gray-900 hover:text-orange-600"
                              >
                                {item.title}
                              </Link>
                              {item.variantLabel && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {item.variantLabel}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between md:block md:text-center">
                          <span className="text-xs text-gray-500 md:hidden">Đơn giá:</span>
                          <span className="text-sm text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between md:justify-center">
                          <span className="text-xs text-gray-500 md:hidden">Số lượng:</span>
                          <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
                            <button
                              type="button"
                              disabled={updateMutation.isPending || item.quantity <= 1}
                              onClick={() =>
                                updateMutation.mutate({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>
                            <span className="min-w-[2.5rem] text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={
                                updateMutation.isPending ||
                                item.quantity >= item.maxQuantity
                              }
                              onClick={() =>
                                updateMutation.mutate({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between md:block md:text-center">
                          <span className="text-xs text-gray-500 md:hidden">Thành tiền:</span>
                          <span className="text-base font-semibold text-orange-600">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 md:justify-center">
                          <button
                            type="button"
                            onClick={() => removeMutation.mutate(item.id)}
                            disabled={removeMutation.isPending}
                            className="text-sm text-gray-600 hover:text-red-600 disabled:opacity-40"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop Voucher Section */}
                  <ShopVoucherSection
                    shopId={group.sellerId}
                    shopName={group.sellerName}
                    appliedVoucher={shopVouchers[group.sellerId]}
                    onApplyVoucher={handleApplyShopVoucher}
                    onRemoveVoucher={handleRemoveShopVoucher}
                  />
                </div>
              );
            })}

            {/* Platform Voucher Section */}
            <div className="rounded-xl bg-white px-6 py-4 shadow-md">
              {platformVoucher ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{platformVoucher.title}</span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          SÀN
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{platformVoucher.description}</p>
                      <div className="mt-2 inline-flex items-center rounded-md border border-dashed border-orange-300 bg-orange-50 px-2 py-1">
                        <span className="font-mono text-xs font-bold text-orange-700">
                          {platformVoucher.code}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-green-600">
                        Giảm: {formatPrice(platformVoucherDiscount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="rounded-lg border border-orange-500 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                    >
                      Đổi
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePlatformVoucher}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/50 px-4 py-3 transition hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Voucher EvoMarket</span>
                  </div>
                  <span className="text-sm font-medium text-orange-600">Chọn voucher →</span>
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Footer - Thanh thanh toán cố định */}
      {items.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            {/* Left side - Select all & Delete */}
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả ({items.length})
                </span>
              </label>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={removeBulkMutation.isPending || selectedIds.size === 0}
                className="text-sm font-medium text-gray-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Xóa ({selectedIds.size})
              </button>
            </div>

            {/* Right side - Summary & Checkout */}
            <div className="flex items-center gap-6">
              {/* Summary */}
              <div className="text-right">
                {totalVoucherDiscount > 0 && (
                  <div className="mb-1 space-y-0.5">
                    <p className="text-xs text-gray-500">
                      Tạm tính: {formatPrice(selectedSubtotal)}
                    </p>
                    {shopVoucherDiscount > 0 && (
                      <p className="text-xs text-blue-600">
                        Giảm shop: -{formatPrice(shopVoucherDiscount)}
                      </p>
                    )}
                    {platformVoucherDiscount > 0 && (
                      <p className="text-xs text-orange-600">
                        Giảm sàn: -{formatPrice(platformVoucherDiscount)}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Tổng thanh toán ({selectedQty} sản phẩm):
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedIds.size === 0}
                className={`min-h-[48px] min-w-[180px] rounded-lg px-8 text-sm font-semibold uppercase text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${CTA_ORANGE}`}
              >
                Mua hàng
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApplyVoucher={handleApplyPlatformVoucher}
      />
    </div>
  );
}
