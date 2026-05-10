import React, { useState } from "react";

// --- CSS Styles & Animations (Injected) ---
const styles = `
  .gradient-primary {
    background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
    color: white;
  }
  
  .text-gradient-primary {
    background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .tab-active {
    color: #ea580c; /* orange-600 */
    font-weight: 600;
    border-bottom: 2px solid #ea580c;
  }

  /* Custom Scrollbar */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-in {
    animation: slideInUp 0.3s ease-out forwards;
  }
  
  .toggle-checkbox:checked {
    right: 0;
    border-color: #f97316;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #f97316;
  }

  /* Simple CSS Bar Chart Animations */
  @keyframes growUp {
    from { height: 0; opacity: 0; }
    to { opacity: 1; }
  }
  .bar-animate {
    animation: growUp 0.8s ease-out forwards;
  }
`;

// --- LAYOUT CONSTANTS & COMPONENTS ---

const CUSTOM_CLASSES = {
  gradientOrange: "bg-gradient-to-br from-orange-600 to-orange-400",
  cardShadow: "shadow-md shadow-gray-200/50",
  hoverLift:
    "transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",
  notificationDot:
    "w-2 h-2 bg-red-500 rounded-full ring-2 ring-white absolute top-1.5 right-1.5",
};

// Nav items configuration
const navItemsConfig = [
  { id: "dashboard", icon: "📊", label: "Tổng quan" },
  { id: "orders", icon: "🛒", label: "Quản lý đơn hàng" },
  { id: "products", icon: "📦", label: "Quản lý sản phẩm" },
  { id: "users", icon: "👥", label: "Quản lý người dùng" },
  { id: "analytics", icon: "👓", label: "Try-On Analytics" },
  { id: "billing", icon: "💰", label: "Quản lý thanh toán" },
  { id: "notifications", icon: "🔔", label: "Thông báo", badge: 12 },
  { id: "reviews", icon: "⭐", label: "Quản lý đánh giá" },
  { id: "promotions", icon: "🎁", label: "Chương trình khuyến mãi" },
  { id: "reports", icon: "📈", label: "Báo cáo & Phân tích" }, // Active for this demo
  { id: "settings", icon: "⚙️", label: "Cài đặt hệ thống" },
];

const NavItem = ({ icon, label, active, badge, onClick }) => {
  const baseClasses = `flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition duration-200 ease-in-out border-l-4 border-transparent cursor-pointer`;
  const hoverClasses = `hover:bg-orange-50 hover:border-orange-500`;
  const activeClasses = active
    ? `bg-orange-100/50 border-orange-600 font-semibold`
    : "";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${activeClasses}`}
      style={
        active
          ? {
              backgroundColor: "rgba(249, 115, 22, 0.12)",
              borderColor: "#f97316",
            }
          : {}
      }
    >
      <span className="text-xl">{icon}</span>
      <div className="flex flex-1 items-center justify-between">
        <span>{label}</span>
        {badge && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

// --- TRANG: QUẢN LÝ THÔNG BÁO (GIỮ NGUYÊN CODE CŨ) ---

const NotificationStats = () => (
  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
    {[
      {
        label: "Đã gửi tháng này",
        value: "45,231",
        icon: "📨",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Tỷ lệ xem (Open Rate)",
        value: "68.4%",
        icon: "👁️",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Tỷ lệ Click (CTR)",
        value: "12.5%",
        icon: "🖱️",
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        label: "Cảnh báo vi phạm",
        value: "342",
        icon: "⚠️",
        color: "text-red-600",
        bg: "bg-red-50",
      },
    ].map((stat, idx) => (
      <div
        key={idx}
        className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl ${stat.bg} ${stat.color}`}
        >
          {stat.icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{stat.label}</p>
          <p className="text-xl font-bold text-gray-800">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

const CreateNotificationForm = () => {
  return (
    <div className="animate-slide-in rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center text-lg font-bold text-gray-800">
        <span className="mr-2">📝</span> Tạo thông báo mới
      </h3>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tiêu đề thông báo
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Bảo trì hệ thống 0h00 ngày 20/10"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Loại thông báo
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none">
                <option>📢 Thông báo hệ thống</option>
                <option>🎁 Khuyến mãi / Marketing</option>
                <option>📜 Cập nhật chính sách</option>
                <option>⚠️ Cảnh báo vi phạm</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mẫu (Template)
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-500 outline-none">
                <option>Chọn mẫu có sẵn...</option>
                <option>Alert Vi Phạm</option>
                <option>Flash Sale Campaign</option>
                <option>Maintenance Notice</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nội dung chi tiết
            </label>
            <textarea
              rows="6"
              placeholder="Nhập nội dung thông báo..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>
        </div>
        <div className="space-y-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
          {/* Mock form fields */}
          <div className="text-sm text-gray-500 italic">
            Cấu hình chi tiết bên phải (Mock)...
          </div>
          <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-2.5 font-bold text-white shadow-md transition hover:opacity-90">
            🚀 Gửi Thông Báo
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationList = () => {
  // Simplified mockup logic for brevity in this consolidated view
  return (
    <div className="animate-slide-in rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 font-bold text-gray-800">
        Danh sách thông báo gần đây
      </h3>
      <div className="text-sm text-gray-500">
        Hiển thị danh sách thông báo tại đây...
      </div>
    </div>
  );
};

const AutomationRules = () => {
  // Simplified mockup logic
  return (
    <div className="animate-slide-in rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 font-bold text-gray-800">Quy tắc tự động</h3>
      <div className="text-sm text-gray-500">
        Cấu hình automation tại đây...
      </div>
    </div>
  );
};

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const subTabs = [
    { id: "create", label: "Tạo & Gửi" },
    { id: "list", label: "Danh sách & Quản lý" },
    { id: "automation", label: "Automation Rules" },
    { id: "templates", label: "Mẫu thông báo" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Thông báo
          </h2>
          <p className="text-sm text-gray-500">
            Gửi thông báo, quản lý chiến dịch và cấu hình tự động
          </p>
        </div>
      </div>
      <div className="mb-6 flex space-x-6 border-b border-gray-200">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "tab-active"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        <NotificationStats />
        {activeTab === "create" && <CreateNotificationForm />}
        {activeTab === "list" && <NotificationList />}
        {activeTab === "automation" && <AutomationRules />}
      </div>
    </div>
  );
};

// --- COMPONENT MỚI: TRANG BÁO CÁO & PHÂN TÍCH ---

const ReportsPage = () => {
  return (
    <div className="animate-slide-in p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Báo cáo & Phân tích
          </h2>
          <p className="text-sm text-gray-500">
            Tổng quan tình hình kinh doanh, doanh thu và tăng trưởng
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700">
            <span>📥</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 1. Key Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Tổng Doanh Thu",
            val: "1.24 Tỷ",
            sub: "+12.5% vs tháng trước",
            color: "text-green-500",
            icon: "💰",
          },
          {
            label: "Tổng Đơn Hàng",
            val: "3,450",
            sub: "+5.2% vs tháng trước",
            color: "text-blue-500",
            icon: "📦",
          },
          {
            label: "Khách Hàng Mới",
            val: "850",
            sub: "-2.1% vs tháng trước",
            color: "text-red-500",
            icon: "👥",
          },
          {
            label: "Giá Trị Đơn TB",
            val: "350k",
            sub: "+8.4% vs tháng trước",
            color: "text-purple-500",
            icon: "💳",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-gray-50 p-2 text-xl">
                {item.icon}
              </div>
              <span
                className={`rounded-full bg-gray-50 px-2 py-1 text-xs font-medium ${item.color.includes("green") || item.color.includes("purple") || item.color.includes("blue") ? "text-green-600" : "text-red-600"}`}
              >
                {item.sub.split(" ")[0]}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-800">
              {item.val}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {item.sub.substring(item.sub.indexOf(" "))}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Charts & Distribution */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart (Revenue) */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              Biểu đồ doanh thu
            </h3>
            {/* ĐÃ CHỈNH SỬA: Thay thế Legend bằng Dropdown Filter */}
            <select className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-600 outline-none focus:border-orange-500">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>Quý này</option>
            </select>
          </div>

          {/* CSS Bar Chart */}
          <div className="flex h-64 items-end justify-between space-x-3 pb-2 sm:space-x-6">
            {[
              { day: "T2", h: 40, v: "40tr" },
              { day: "T3", h: 65, v: "65tr" },
              { day: "T4", h: 45, v: "45tr" },
              { day: "T5", h: 80, v: "80tr" },
              { day: "T6", h: 55, v: "55tr" },
              { day: "T7", h: 90, v: "90tr" },
              { day: "CN", h: 70, v: "70tr" },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex flex-1 cursor-pointer flex-col items-center"
              >
                <div className="relative flex h-full w-full items-end overflow-hidden rounded-t-lg bg-gray-50">
                  <div
                    style={{ height: `${item.h}%` }}
                    className="bar-animate relative w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-pink-500 transition-all duration-300 group-hover:opacity-80"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.v}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-gray-500">
                  {item.day}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">Top Danh Mục</h3>
          <div className="space-y-6">
            {[
              { label: "Kính", pct: 75, color: "bg-blue-500" },
              { label: "Mũ", pct: 60, color: "bg-pink-500" },
              { label: "Vòng cổ", pct: 45, color: "bg-purple-500" },
              { label: "Hoa tai", pct: 30, color: "bg-orange-500" },
              { label: "Khác", pct: 15, color: "bg-gray-400" },
            ].map((cat, i) => (
              <div key={i}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{cat.label}</span>
                  <span className="font-bold text-gray-900">{cat.pct}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    style={{ width: `${cat.pct}%` }}
                    className={`h-full rounded-full ${cat.color} transition-all duration-1000 ease-out`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-lg border border-orange-100 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* 3. Recent Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800">Giao dịch gần đây</h3>
          <a
            href="#"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            Xem tất cả
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã đơn hàng</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold">Ngày đặt</th>
                <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  id: "#ORD-7782",
                  user: "Nguyễn Văn A",
                  prod: "Mũ lưỡi trai unisex...",
                  date: "17/12/2025",
                  total: "450.000đ",
                  status: "Completed",
                  statusColor: "bg-green-100 text-green-700",
                },
                {
                  id: "#ORD-7781",
                  user: "Trần Thị B",
                  prod: "Vòng cổ layering bạc...",
                  date: "17/12/2025",
                  total: "1.250.000đ",
                  status: "Processing",
                  statusColor: "bg-blue-100 text-blue-700",
                },
                {
                  id: "#ORD-7780",
                  user: "Lê Văn C",
                  prod: "Kính râm Polarized...",
                  date: "16/12/2025",
                  total: "890.000đ",
                  status: "Completed",
                  statusColor: "bg-green-100 text-green-700",
                },
                {
                  id: "#ORD-7779",
                  user: "Phạm Thị D",
                  prod: "Hoa tai đính đá CZ...",
                  date: "16/12/2025",
                  total: "2.100.000đ",
                  status: "Pending",
                  statusColor: "bg-yellow-100 text-yellow-700",
                },
                {
                  id: "#ORD-7778",
                  user: "Hoàng Văn E",
                  prod: "Combo mũ + kính...",
                  date: "15/12/2025",
                  total: "600.000đ",
                  status: "Cancelled",
                  statusColor: "bg-red-100 text-red-700",
                },
              ].map((row, i) => (
                <tr key={i} className="transition hover:bg-orange-50/30">
                  <td className="px-6 py-4 font-medium text-orange-600">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 text-gray-800">{row.user}</td>
                  <td className="px-6 py-4 text-gray-600">{row.prod}</td>
                  <td className="px-6 py-4 text-gray-500">{row.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {row.total}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // Thay đổi default view thành 'reports' để hiển thị trang mới ngay lập tức
  const [currentView, setCurrentView] = useState("reports");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <style>{styles}</style>

      {/* Sidebar - fixed */}
      <aside className="custom-scroll fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white">
        <div
          className={`${CUSTOM_CLASSES.gradientOrange} flex h-24 items-center px-6`}
        >
          <div className="flex w-full items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl">
              🛍️
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin</h1>
              <p className="text-sm text-orange-100">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItemsConfig.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div
              className={`h-10 w-10 ${CUSTOM_CLASSES.gradientOrange} flex items-center justify-center rounded-full font-bold text-white`}
            >
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex min-h-screen flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-24 items-center border-b border-gray-200 bg-white/95 px-8 shadow-sm backdrop-blur-sm">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentView === "notifications"
                  ? "Trung tâm điều hành"
                  : currentView === "reports"
                    ? "Báo cáo doanh thu"
                    : "Xin chào, Admin"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
                <span className="text-xl">🔔</span>
                <span className={CUSTOM_CLASSES.notificationDot}></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Rendering */}
        <div className="flex-1 bg-gray-50">
          {currentView === "notifications" && <NotificationPage />}

          {currentView === "reports" && <ReportsPage />}

          {currentView !== "notifications" && currentView !== "reports" && (
            <div className="flex h-full flex-col items-center justify-center p-20 text-center">
              <div className="mb-4 text-6xl opacity-50">🚧</div>
              <h3 className="text-xl font-medium text-gray-600">
                Đang xây dựng
              </h3>
              <p className="mt-2 text-gray-400">
                Chức năng{" "}
                <strong>
                  {navItemsConfig.find((i) => i.id === currentView)?.label}
                </strong>{" "}
                đang được phát triển.
              </p>
              <button
                onClick={() => setCurrentView("reports")}
                className="mt-6 font-semibold text-orange-600 hover:underline"
              >
                Quay lại trang Báo cáo
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
