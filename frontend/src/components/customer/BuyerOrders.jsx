import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight } from "lucide-react";
import { orderApi } from "../../services/orderApi";
import logoEvo from "../../assets/logo-evo.png";
import { ORDER_STATUS, ORDER_STATUS_VI, normalizeOrderStatus } from "../../constants/orderStatus";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: ORDER_STATUS.PENDING_CONFIRMATION, label: "Chờ xác nhận" },
  { 
    key: "shipping", 
    label: "Vận chuyển",
    statuses: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPED]
  },
  { key: ORDER_STATUS.COMPLETED, label: "Hoàn thành" },
  { key: ORDER_STATUS.CANCELLED, label: "Đã hủy" },
  { 
    key: "return", 
    label: "Trả hàng/Hoàn tiền",
    statuses: [ORDER_STATUS.RETURN_REQUESTED, ORDER_STATUS.RETURN_ACCEPTED, ORDER_STATUS.REFUNDED]
  },
];

export default function BuyerOrders() {
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-orders", activeTab],
    queryFn: async () => {
      const currentTab = STATUS_TABS.find(t => t.key === activeTab);
      let queryParams = { limit: 100 };
      
      if (activeTab !== "all") {
        if (currentTab?.statuses) {
          queryParams.statuses = currentTab.statuses;
        } else {
          queryParams.status = activeTab;
        }
      }
      
      const res = await orderApi.listMine(queryParams);
      return res.data;
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
            </div>

            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              )}

              {error && (
                <div className="py-12 text-center">
                  <p className="text-red-600">{error.message || "Không tải được đơn hàng"}</p>
                </div>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <div className="py-16 text-center">
                  <img src={logoEvo} alt="" className="mx-auto mb-4 h-14 opacity-40" />
                  <p className="mb-2 text-gray-700">Chưa có đơn hàng</p>
                  <Link
                    to="/customer/homepage"
                    className="inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
                  >
                    Mua sắm ngay
                  </Link>
                </div>
              )}

              {!isLoading && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const id = order.id;
                    const created = order.created_at || order.createdAt
                      ? new Date(order.created_at || order.createdAt).toLocaleString("vi-VN")
                      : "";
                    const stNorm = normalizeOrderStatus(order.status);
                    const items = order.OrderItems || order.orderItems || [];
                    const firstItem = items[0];
                    const seller = firstItem?.Seller;
                    const shopName = seller?.shop_name?.trim() || 
                                    seller?.shopName?.trim() || 
                                    seller?.fullname?.trim() || 
                                    "Shop";

                    return (
                      <div key={id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{shopName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">{created}</span>
                              <span className={`rounded px-2 py-1 text-xs font-medium ${
                                stNorm === ORDER_STATUS.COMPLETED
                                  ? "bg-green-100 text-green-700"
                                  : stNorm === ORDER_STATUS.CANCELLED
                                  ? "bg-red-100 text-red-700"
                                  : stNorm === ORDER_STATUS.SHIPPED
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}>
                                {ORDER_STATUS_VI[stNorm] || stNorm}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/customer/orders/${id}`}
                          className="block transition hover:bg-gray-50"
                        >
                          <div className="p-4">
                            <div className="space-y-3">
                              {items.slice(0, 3).map((item, idx) => {
                                const product = item.Product || {};
                                const variant = item.ProductVariant || {};
                                let imageUrl = product.thumbnail || item.product_thumbnail || "/placeholder.png";
                                if (imageUrl && imageUrl.startsWith('/uploads/')) {
                                  imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${imageUrl}`;
                                }
                                
                                return (
                                  <div key={idx} className="flex gap-3">
                                    <img
                                      src={imageUrl}
                                      alt={product.title || item.product_title || "Sản phẩm"}
                                      className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 object-cover"
                                      onError={(e) => {
                                        e.target.src = logoEvo;
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-900 line-clamp-2">
                                        {product.title || item.product_title || "Sản phẩm"}
                                      </p>
                                      {(variant?.color || item.variant_name) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Phân loại: {item.variant_name || `${variant.color}${variant.size ? ` / ${variant.size}` : ''}`}
                                        </p>
                                      )}
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <p className="text-sm text-gray-900">x{item.quantity}</p>
                                      <p className="text-sm font-medium text-orange-600">
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {items.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  và {items.length - 3} sản phẩm khác
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                              <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                                <span>Xem chi tiết</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">
                                  Thành tiền: 
                                </p>
                                <p className="text-lg font-semibold text-orange-600">
                                  {formatPrice(order.total_price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
