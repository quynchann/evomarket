import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Chart } from "chart.js/auto";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const orderChartRef = useRef(null);
  const orderChartInstance = useRef(null);

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

  const quickActions = [
    { icon: "📦", text: "Quản lý đơn hàng", badge: "15 đơn mới", path: "/seller/orders" },
    { icon: "📝", text: "Thêm sản phẩm", path: "/seller/products" },
    { icon: "🎯", text: "Marketing", path: null },
    { icon: "💬", text: "Chat với khách", badge: "8 tin nhắn", path: "/seller/chat" },
    { icon: "🎁", text: "Khuyến mãi", path: null },
    { icon: "📊", text: "Báo cáo", path: null },
  ];

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else {
      toast.info(`Tính năng "${action.text}" đang phát triển`);
    }
  };

  return (
    <div className="px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 p-6 text-white shadow-md">
        <div className="flex items-center space-x-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60"
            alt="shop"
            className="h-14 w-14 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-2xl font-bold">
              Chào mừng trở lại, Bunny Store!
            </h2>
            <p className="text-orange-100">
              Hôm nay bạn có <b>15 đơn hàng mới</b> và{" "}
              <b>8 tin nhắn chưa đọc</b>
            </p>
          </div>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold">4.8⭐</div>
            <div className="text-sm text-orange-100">Đánh giá shop</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-sm text-orange-100">Người theo dõi</div>
          </div>
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-gray-800">
        Tổng quan hoạt động
      </h1>

      {/* --- Thống kê nhanh --- */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Doanh thu */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Doanh thu hôm nay</p>
              <h2 className="mt-1 text-2xl font-bold">4.2 triệu ₫</h2>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Đơn hàng hôm nay</p>
              <h2 className="mt-1 text-2xl font-bold">126</h2>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        {/* Khách truy cập */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white shadow-md transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Khách truy cập</p>
              <h2 className="mt-1 text-2xl font-bold">3,842</h2>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
      </div>

      {/* Chart Section - 2 biểu đồ song song */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Biểu đồ Doanh thu */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Doanh thu 7 ngày
            </h3>
            <select className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none">
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
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Đơn hàng 7 ngày
            </h3>
            <select className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none">
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
      <div className="mb-10 rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-6 text-xl font-semibold text-gray-800">
          Công cụ quản lý nhanh
        </h3>
        <div className="grid grid-cols-6 gap-5">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action)}
              className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50 p-5 text-center shadow-sm transition hover:bg-gray-100 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <span className="text-3xl">{action.icon}</span>
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
      <div className="mb-10 rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-6 text-xl font-semibold text-gray-800">
          Đơn hàng cần xử lý
        </h3>
        <table className="min-w-full border">
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
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
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
                <td className="px-4 py-2 text-sm">{o.id}</td>
                <td className="px-4 py-2 text-sm">{o.name}</td>
                <td className="px-4 py-2 text-sm">{o.date}</td>
                <td className="px-4 py-2 text-sm">{o.total}</td>
                <td className="px-4 py-2 text-sm font-medium text-orange-600">
                  {o.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Products */}
      <div className="mb-12 rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-6 text-xl font-semibold text-gray-800">
          Sản phẩm bán chạy
        </h3>
        <div className="grid grid-cols-4 gap-6">
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
