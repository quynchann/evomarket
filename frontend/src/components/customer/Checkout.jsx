import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartApi, cartQueryKeys } from "../../services/cartApi";
import { buildCreateOrderRequestBody } from "../../utils/checkoutOrderPayload";
import { useAuthStore } from "../../stores/useAuthStore";
import logoEvo from "../../assets/logo-evo.png";

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

// Mock địa chỉ — sau này thay bằng checkoutApi.getAddresses(); giữ cố định để useEffect chỉ chạy mount
const MOCK_ADDRESSES = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Đường ABC, Phường 1, Quận Bình Thạnh, TP.HCM",
    isDefault: true,
  },
  {
    id: 2,
    name: "Nguyễn Văn A",
    phone: "0987654321",
    address: "25 Nguyễn Khuyến, Phường 12, Quận 10, TP.HCM",
    isDefault: false,
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: cartQueryKeys.cart,
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
  });

  useEffect(() => {
    const defaultAddr = MOCK_ADDRESSES.find((a) => a.isDefault);
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
  }, []);

  const selectedAddress = MOCK_ADDRESSES.find((a) => a.id === selectedAddressId);

  const items = cartData?.items ?? [];
  const grouped = useMemo(() => groupBySeller(items), [items]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  
  const shippingFee = useMemo(() => {
    if (shippingMethod === "express") return 15000;
    return 0; // free shipping for standard
  }, [shippingMethod]);

  const total = subtotal + shippingFee;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (_orderBody) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { orderId: "EVO" + Date.now() };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(cartQueryKeys.cart);
      toast.success("Đặt hàng thành công!");
      navigate(`/customer/order-success/${data.orderId}`);
    },
    onError: (err) => {
      toast.error(err.message || "Không thể đặt hàng");
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const email = typeof user?.email === "string" ? user.email : "";
    if (!email.trim()) {
      toast.error("Tài khoản chưa có email — vui lòng cập nhật hồ sơ hoặc đăng nhập lại");
      return;
    }

    const orderBody = buildCreateOrderRequestBody({
      cartItems: items,
      fullname: selectedAddress.name,
      email,
      phone: selectedAddress.phone,
      address: selectedAddress.address,
      paymentUi: paymentMethod,
    });

    createOrderMutation.mutate(orderBody);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100/90 via-orange-50/70 to-amber-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100/90 via-orange-50/70 to-amber-50/40 flex items-center justify-center">
        <div className="text-center">
          <img src={logoEvo} alt="" className="mx-auto mb-4 h-16 opacity-50" />
          <p className="text-gray-700 mb-4">Giỏ hàng của bạn còn trống</p>
          <Link
            to="/customer/homepage"
            className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100/90 via-orange-50/70 to-amber-50/40 pb-20">
      {/* Header */}
      <header className="border-b border-orange-200/60 bg-gradient-to-r from-orange-50 via-white to-orange-50/80 shadow-sm shadow-orange-100/50">
        <div className={`${SHELL} flex items-center justify-between py-4`}>
          <Link to="/customer/cart" className="flex items-center gap-3 text-[#ee4d2d]">
            <img src={logoEvo} alt="EvoMarket" className="h-9 w-auto" />
            <span className="hidden h-6 w-px bg-gray-300 sm:block" />
            <span className="text-lg font-medium">Thanh toán</span>
          </Link>
          <Link
            to="/customer/cart"
            className="text-sm font-medium text-gray-600 hover:text-orange-600"
          >
            ← Quay lại giỏ hàng
          </Link>
        </div>
      </header>

      <main className={`${SHELL} py-6 lg:py-8`}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Địa chỉ giao hàng */}
            <section className="rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Địa chỉ giao hàng
                </h2>
                <Link
                  to="/customer/profile"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Thay đổi
                </Link>
              </div>

              {selectedAddress ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedAddress.name}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                      <p className="mt-1 text-sm text-gray-700">{selectedAddress.address}</p>
                    </div>
                    {selectedAddress.isDefault && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Chưa có địa chỉ giao hàng</p>
                  <Link
                    to="/customer/profile"
                    className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Thêm địa chỉ
                  </Link>
                </div>
              )}
            </section>

            {/* 2. Sản phẩm */}
            <section className="rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Sản phẩm đã chọn
              </h2>

              <div className="space-y-4">
                {grouped.map((group) => (
                  <div key={group.sellerId} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="rounded bg-[#ee4d2d] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Shop
                      </span>
                      <span className="font-medium text-gray-800">{group.sellerName}</span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={item.thumbnail || "https://via.placeholder.com/80"}
                            alt={item.title}
                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.title}
                            </p>
                            {item.variantLabel && (
                              <p className="text-xs text-gray-500">
                                Phân loại: {item.variantLabel}
                              </p>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-sm text-gray-600">x{item.quantity}</span>
                              <span className="font-medium text-orange-600">
                                {formatPrice(item.lineTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Phương thức vận chuyển */}
            <section className="rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === "standard"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-4 w-4 text-orange-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Tiêu chuẩn</p>
                    <p className="text-sm text-gray-500">Giao hàng trong 4-5 ngày</p>
                  </div>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-4 w-4 text-orange-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nhanh</p>
                    <p className="text-sm text-gray-500">Giao hàng trong 2-3 ngày</p>
                  </div>
                  <span className="font-semibold text-orange-600">{formatPrice(15000)}</span>
                </label>
              </div>
            </section>

            {/* 4. Phương thức thanh toán */}
            <section className="rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-orange-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300 opacity-60">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    disabled
                    className="h-4 w-4 text-orange-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Thanh toán online</p>
                    <p className="text-sm text-gray-500">VNPay, MoMo, ZaloPay (Sắp có)</p>
                  </div>
                </label>
              </div>
            </section>

            {/* 5. Ghi chú */}
            <section className="rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Ghi chú đơn hàng
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho người bán..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-xl bg-white p-6 shadow-lg shadow-orange-200/30">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-b border-gray-200 py-4">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-orange-600">{formatPrice(total)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || createOrderMutation.isPending}
                className="mt-4 w-full rounded-lg bg-orange-600 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-300/40 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createOrderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <button className="text-orange-600 hover:underline">Điều khoản</button> của
                EvoMarket
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
