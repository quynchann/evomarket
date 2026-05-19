import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "chart.js/auto";
import { toast } from "sonner";
import { chatApi, chatQueryKeys } from "../../services/chatApi.js";
import { orderApi } from "../../services/orderApi.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

function formatBriefVnd(vnd) {
  const v = Number(vnd) || 0;
  if (v >= 1_000_000_000) {
    return `${(v / 1_000_000_000).toFixed(1).replace(".", ",")} tỷ ₫`;
  }
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1).replace(".", ",")} triệu ₫`;
  }
  return `${new Intl.NumberFormat("vi-VN").format(v)} ₫`;
}

function formatCount(n) {
  return new Intl.NumberFormat("vi-VN").format(Number(n) || 0);
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const shopDisplay =
    (user?.shop_name && String(user.shop_name).trim()) ||
    user?.fullname ||
    "Shop";
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const orderChartRef = useRef(null);
  const orderChartInstance = useRef(null);

  const {
    data: todayStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["seller-today-stats"],
    queryFn: async () => {
      const res = await orderApi.sellerTodayStats();
      return res.data;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: unreadChatCount,
    isLoading: unreadChatLoading,
  } = useQuery({
    queryKey: chatQueryKeys.unreadCount,
    queryFn: async () => {
      const res = await chatApi.getUnreadCount();
      return Number(res.data?.unreadCount ?? 0) || 0;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  // Biểu đồ doanh thu (Line Chart)
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [
          {
            label: "Doanh thu (triệu ₫)",
            data: [2.1, 2.4, 3.2, 2.8, 3.5, 3.8, 4.0],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    });

    return () => chartInstance.current?.destroy();
  }, []);

  // Biểu đồ đơn hàng (Bar Chart)
  useEffect(() => {
    const ctx = orderChartRef.current.getContext("2d");
    if (orderChartInstance.current) orderChartInstance.current.destroy();

    orderChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [
          {
            label: "Số đơn hàng",
            data: [45, 52, 68, 61, 75, 82, 90],
            backgroundColor: "#fb923c",
            borderColor: "#f97316",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          y: { 
            beginAtZero: true,
            ticks: {
              stepSize: 20
            }
          } 
        },
        plugins: { legend: { display: false } },
      },
    });

    return () => orderChartInstance.current?.destroy();
  }, []);

  const quickActions = useMemo(() => {
    const ordersBadge =
      statsLoading && todayStats == null
        ? "…"
        : `${formatCount(todayStats?.ordersToday ?? 0)} đơn mới`;
    const chatBadge =
      unreadChatLoading && unreadChatCount === undefined
        ? "…"
        : `${formatCount(unreadChatCount ?? 0)} tin nhắn`;
    return [
      { icon: "📦", text: "Quản lý đơn hàng", badge: ordersBadge, path: "/seller/orders" },
      { icon: "📝", text: "Quản lý sản phẩm", path: "/seller/products" },
      { icon: "💬", text: "Chat với khách", badge: chatBadge, path: "/seller/chat" },
      { icon: "🎁", text: "Khuyến mãi", path: "/seller/coupons" },
      { icon: "📊", text: "Báo cáo", path: "/seller/reports" },
    ];
  }, [statsLoading, todayStats, unreadChatLoading, unreadChatCount]);

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else {
      toast.info(`Tính năng "${action.text}" đang phát triển`);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 p-4 text-white shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3 sm:space-x-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60"
            alt="shop"
            className="h-12 w-12 shrink-0 rounded-full border-2 border-white sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <h2 className="text-lg font-bold sm:text-2xl">
              Chào mừng trở lại, {shopDisplay}!
            </h2>
            <p className="text-sm text-orange-100 sm:text-base">
              Hôm nay bạn có{" "}
              <b>
                {statsLoading && todayStats == null
                  ? "…"
                  : `${formatCount(todayStats?.ordersToday ?? 0)} đơn hàng mới`}
              </b>{" "}
              và{" "}
              <b>
                {unreadChatLoading && unreadChatCount === undefined
                  ? "…"
                  : `${formatCount(unreadChatCount ?? 0)} tin nhắn chưa đọc`}
              </b>
            </p>
          </div>
        </div>
        <div className="flex justify-around gap-4 border-t border-white/20 pt-4 sm:flex-initial sm:justify-start sm:border-t-0 sm:space-x-6 sm:border-none sm:pt-0">
          <div className="text-center">
            <div
              className={`text-xl font-bold tabular-nums sm:text-2xl ${statsLoading ? "opacity-70" : ""}`}
            >
              {statsLoading && todayStats == null
                ? "…"
                : todayStats?.ratingSummary?.average != null
                  ? `${Number(todayStats.ratingSummary.average).toFixed(1)}⭐`
                  : "—"}
            </div>
            <div className="text-xs text-orange-100 sm:text-sm">Đánh giá shop</div>
            <div className="mt-0.5 text-[10px] text-orange-100/90 sm:text-xs">
              {statsLoading && todayStats == null
                ? " "
                : (todayStats?.ratingSummary?.count ?? 0) > 0
                  ? `${formatCount(todayStats.ratingSummary.count)} lượt`
                  : "Chưa có lượt đánh giá"}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-xl font-bold tabular-nums sm:text-2xl ${statsLoading ? "opacity-70" : ""}`}
            >
              {statsLoading && todayStats == null
                ? "…"
                : formatCount(todayStats?.followerCount ?? 0)}
            </div>
            <div className="text-xs text-orange-100 sm:text-sm">Người theo dõi</div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            Tổng quan hoạt động
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Làm mới số liệu ~15 giây/lần (gần thời gian thực).
          </p>
        </div>
        {statsError ? (
          <p className="mt-1 text-xs text-red-600">
            Không tải được thống kê; hệ thống sẽ thử lại tự động.
          </p>
        ) : null}
      </div>

      {/* --- Thống kê nhanh --- */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Doanh thu */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Doanh thu hôm nay</p>
              <h2
                className={`mt-1 text-2xl font-bold tabular-nums ${statsLoading ? "opacity-70" : ""}`}
              >
                {statsLoading && !todayStats
                  ? "…"
                  : formatBriefVnd(todayStats?.revenueVnd ?? 0)}
              </h2>
              <p className="mt-1 text-[11px] opacity-80 sm:text-xs">
                Đơn đã xác nhận trở đi (GMV dòng hàng)
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Đơn hàng hôm nay</p>
              <h2
                className={`mt-1 text-2xl font-bold tabular-nums ${statsLoading ? "opacity-70" : ""}`}
              >
                {statsLoading && !todayStats
                  ? "…"
                  : formatCount(todayStats?.ordersToday ?? 0)}
              </h2>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        {/* Khách truy cập — lượt xem sản phẩm shop (unique/ngày) */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Khách truy cập</p>
              <h2
                className={`mt-1 text-2xl font-bold tabular-nums ${statsLoading ? "opacity-70" : ""}`}
              >
                {statsLoading && !todayStats
                  ? "…"
                  : formatCount(todayStats?.visitorsToday ?? 0)}
              </h2>
              <p className="mt-1 text-[11px] opacity-80 sm:text-xs">
                Khách mở trang sản phẩm của shop (mỗi tài khoản hoặc trình duyệt đếm một lần/ngày)
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
      </div>

      {/* Chart Section - 2 biểu đồ song song */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Biểu đồ Doanh thu */}
        <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
              Doanh thu 7 ngày
            </h3>
            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none sm:w-auto">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>3 tháng qua</option>
            </select>
          </div>
          <div className="h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Biểu đồ Đơn hàng */}
        <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
              Đơn hàng 7 ngày
            </h3>
            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none sm:w-auto">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>3 tháng qua</option>
            </select>
          </div>
          <div className="h-64">
            <canvas ref={orderChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 sm:mb-6 sm:text-xl">
          Công cụ quản lý nhanh
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action)}
              className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50 p-3 text-center shadow-sm transition hover:bg-gray-100 hover:shadow-md sm:p-5"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 sm:mb-3 sm:h-16 sm:w-16">
                <span className="text-2xl sm:text-3xl">{action.icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {action.text}
              </span>
              {action.badge && (
                <div className="mt-1 text-xs text-red-500">{action.badge}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="mb-10 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 sm:mb-6 sm:text-xl">
          Đơn hàng cần xử lý
        </h3>
        <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="min-w-[560px] w-full border">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Mã đơn",
                "Khách hàng",
                "Ngày đặt",
                "Tổng tiền",
                "Trạng thái",
              ].map((head, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 sm:px-4 sm:text-sm"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "DH001",
                name: "Nguyễn Văn A",
                date: "20/10/2025",
                total: "450.000₫",
                status: "Chờ xử lý",
              },
              {
                id: "DH002",
                name: "Trần Thị B",
                date: "19/10/2025",
                total: "820.000₫",
                status: "Đang giao",
              },
              {
                id: "DH003",
                name: "Lê Văn C",
                date: "19/10/2025",
                total: "260.000₫",
                status: "Chờ xử lý",
              },
            ].map((o, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 text-xs sm:px-4 sm:text-sm">{o.id}</td>
                <td className="px-3 py-2 text-xs sm:px-4 sm:text-sm">{o.name}</td>
                <td className="px-3 py-2 text-xs sm:px-4 sm:text-sm">{o.date}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm">{o.total}</td>
                <td className="px-3 py-2 text-xs font-medium whitespace-nowrap text-orange-600 sm:px-4 sm:text-sm">
                  {o.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="mb-12 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 sm:mb-6 sm:text-xl">
          Sản phẩm bán chạy
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
          {[
            {
              img: "https://tnj.vn/56584-large_default/khuyen-tai-bac-nu-hoa-5-canh-dinh-da-btn0220.jpg",
              name: "Khuyên tai bạc sang trọng",
              sold: 128,
              price: "300.000₫",
            },
            {
              img: "https://tnj.vn/21875-large_default/day-chuyen-co-4-la-xoay-dinh-da-trang-dcn0508.jpg",
              name: "Dây chuyền cỏ 4 lá may mắn",
              sold: 95,
              price: "520.000₫",
            },
            {
              img: "https://matkinhlb.com.vn/wp-content/uploads/2022/09/kinh-mat-nu-8_09f5336328494b7cba57f975ef6df2b4_master-1.jpg",
              name: "Kính mát thời trang",
              sold: 80,
              price: "249.000₫",
            },
            {
              img: "https://down-vn.img.susercontent.com/file/d5857cc3f56de509870a5e86e88f6d42.webp",
              name: "Mũ lưỡi trai unisex",
              sold: 72,
              price: "99.000₫",
            },
          ].map((p, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border shadow-sm transition hover:shadow-lg"
            >
              <img
                src={p.img}
                alt={p.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h4 className="truncate font-medium text-gray-800">
                  {p.name}
                </h4>
                <p className="mb-1 text-sm text-gray-500">Đã bán: {p.sold}</p>
                <p className="font-semibold text-orange-600">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
