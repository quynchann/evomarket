import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { orderApi } from "../../services/orderApi";
import logoEvo from "../../assets/logo-evo.png";
import { ORDER_FILTER_KEYS, ORDER_STATUS_VI, normalizeOrderStatus } from "../../constants/orderStatus";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}

export default function BuyerOrders() {
  const [status, setStatus] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-orders", status],
    queryFn: async () => {
      const res = await orderApi.listMine({
        limit: 50,
        ...(status ? { status } : {}),
      });
      return res.data;
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Đơn hàng của tôi</h1>
                  <p className="text-sm text-gray-600">Theo dõi trạng thái sau khi mua</p>
                </div>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="">Tất cả trạng thái</option>
                {ORDER_FILTER_KEYS.filter((k) => k !== "all").map((k) => (
                  <option key={k} value={k}>
                    {ORDER_STATUS_VI[k] || k}
                  </option>
                ))}
              </select>
            </div>

            {isLoading && (
              <div className="space-y-3 py-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            )}

            {error && (
              <p className="py-8 text-center text-red-600">
                {error.message || "Không tải được đơn hàng"}
              </p>
            )}

            {!isLoading && !error && orders.length === 0 && (
              <div className="py-16 text-center">
                <img src={logoEvo} alt="" className="mx-auto mb-4 h-14 opacity-40" />
                <p className="text-gray-700">Bạn chưa có đơn hàng nào</p>
                <Link
                  to="/customer/homepage"
                  className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Mua sắm ngay
                </Link>
              </div>
            )}

            {!isLoading && orders.length > 0 && (
              <ul className="space-y-3">
                {orders.map((order) => {
                  const id = order.id;
                  const created =
                    order.created_at || order.createdAt
                      ? new Date(order.created_at || order.createdAt).toLocaleString("vi-VN")
                      : "";
                  const stNorm = normalizeOrderStatus(order.status);
                  return (
                    <li key={id}>
                      <Link
                        to={`/customer/orders/${id}`}
                        className="block rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:border-orange-300 hover:bg-orange-50/30"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-mono text-sm font-semibold text-orange-600">#{id}</p>
                            <p className="text-xs text-gray-500">{created}</p>
                            <p className="mt-1 text-sm text-gray-800">
                              {ORDER_STATUS_VI[stNorm] || stNorm}
                            </p>
                            <p className="mt-2 text-xs font-medium text-orange-600 hover:underline">
                              Xem chi tiết →
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(order.total_price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(order.OrderItems || order.orderItems || []).length} mặt hàng
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
