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
  { id: "notifications", icon: "🔔", label: "Thông báo", badge: 12 }, // Active Page
  { id: "reviews", icon: "⭐", label: "Quản lý đánh giá" },
  { id: "promotions", icon: "🎁", label: "Chương trình khuyến mãi" },
  { id: "reports", icon: "📈", label: "Báo cáo & Phân tích" },
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

// --- COMPONENT CON MỚI CHO TRANG THÔNG BÁO ---

// 1. Dashboard Thống kê nhỏ (Mini Stats)
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

// 2. Form Tạo Thông Báo Mới (Create Notification)
const CreateNotificationForm = () => {
  return (
    <div className="animate-slide-in rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center text-lg font-bold text-gray-800">
        <span className="mr-2">📝</span> Tạo thông báo mới
      </h3>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cột trái: Nội dung */}
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Hình thức gửi
            </label>
            <div className="flex flex-wrap gap-4">
              {["Tin nhắn hệ thống", "Email"].map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <input
                    type="checkbox"
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Cấu hình gửi */}
        <div className="space-y-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div>
            <label className="mb-3 block text-sm font-bold text-gray-800">
              Đối tượng nhận
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="target"
                  defaultChecked
                  className="text-orange-600"
                />{" "}
                <span className="text-sm">Tất cả người dùng</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="target" className="text-orange-600" />{" "}
                <span className="text-sm">Tất cả Seller</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="target" className="text-orange-600" />{" "}
                <span className="text-sm">Nhóm Buyer cụ thể</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="target" className="text-orange-600" />{" "}
                <span className="text-sm">Theo Category bán hàng</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="target" className="text-orange-600" />{" "}
                <span className="text-sm">1 User/Seller cụ thể (Nhập ID)</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="mb-3 block text-sm font-bold text-gray-800">
              Lịch trình
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="schedule"
                  defaultChecked
                  className="text-orange-600"
                />{" "}
                <span className="text-sm">Gửi ngay lập tức</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="schedule"
                  className="text-orange-600"
                />{" "}
                <span className="text-sm">Lên lịch gửi</span>
              </label>
              <input
                type="datetime-local"
                disabled
                className="mt-1 w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-400"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex cursor-pointer items-center space-x-2">
              <input type="checkbox" className="rounded text-orange-600" />
              <span className="text-sm font-medium text-gray-800">
                Ghim lên đầu trang chủ (Pin)
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-2.5 font-bold text-white shadow-md transition hover:opacity-90">
              🚀 Gửi Thông Báo
            </button>
            <button className="w-full rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 transition hover:bg-gray-50">
              Lưu bản nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Danh sách thông báo (Management List)
const NotificationList = () => {
  const notifs = [
    {
      id: 1,
      title: "Siêu Sale 12.12 - Giảm 50%",
      type: "Marketing",
      target: "All Users",
      method: "Push, Email",
      status: "Active",
      sent: "12,405",
      read: "45%",
      date: "08/12/2025",
    },
    {
      id: 2,
      title: "Bảo trì server định kỳ",
      type: "System",
      target: "All Sellers",
      method: "Popup",
      status: "Scheduled",
      sent: "-",
      read: "-",
      date: "10/12/2025 02:00",
    },
    {
      id: 3,
      title: "Cảnh báo vi phạm chính sách hình ảnh",
      type: "Violation",
      target: "Seller Group A",
      method: "System Msg",
      status: "Expired",
      sent: "142",
      read: "89%",
      date: "01/12/2025",
    },
    {
      id: 4,
      title: "Chào mừng Seller mới tháng 12",
      type: "System",
      target: "New Sellers",
      method: "Email",
      status: "Active",
      sent: "56",
      read: "62%",
      date: "05/12/2025",
    },
  ];

  return (
    <div className="animate-slide-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-orange-500"
          />
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none">
            <option>Tất cả loại</option>
            <option>Marketing</option>
            <option>Hệ thống</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-orange-600">
            <span className="text-lg">🗑️</span>
          </button>
          <button className="text-gray-500 hover:text-orange-600">
            <span className="text-lg">⬇️</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
              <th className="px-6 py-4">Tiêu đề</th>
              <th className="px-6 py-4">Phân loại</th>
              <th className="px-6 py-4">Đối tượng</th>
              <th className="px-6 py-4">Hình thức</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-center">Hiệu quả (Đọc)</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {notifs.map((n) => (
              <tr key={n.id} className="transition hover:bg-orange-50/30">
                <td className="px-6 py-4 font-medium text-gray-800">
                  <div className="max-w-[200px] truncate" title={n.title}>
                    {n.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{n.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      n.type === "Marketing"
                        ? "bg-pink-100 text-pink-700"
                        : n.type === "System"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {n.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{n.target}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{n.method}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      n.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : n.status === "Scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {n.status === "Active" && (
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    )}
                    {n.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="font-bold text-gray-800">{n.read}</div>
                  <div className="text-xs text-gray-400">Gửi: {n.sent}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="rounded p-1.5 text-blue-600 hover:bg-gray-100"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                      title="Thống kê"
                    >
                      📊
                    </button>
                    <button
                      className="rounded p-1.5 text-red-600 hover:bg-gray-100"
                      title="Xóa/Ẩn"
                    >
                      🚫
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. Automation Rules (Automation)
const AutomationRules = () => {
  const rules = [
    {
      id: 1,
      trigger: "Seller đăng sản phẩm vi phạm",
      action: "Gửi cảnh báo & Yêu cầu sửa",
      channel: "Email + App Push",
      active: true,
    },
    {
      id: 2,
      trigger: "Buyer hủy > 3 đơn/ngày",
      action: "Gửi nhắc nhở chính sách bom hàng",
      channel: "Tin nhắn hệ thống",
      active: true,
    },
    {
      id: 3,
      trigger: "Seller đạt doanh thu > 100tr",
      action: "Mời tham gia 'Shop Yêu Thích'",
      channel: "Email",
      active: false,
    },
    {
      id: 4,
      trigger: "User đăng ký mới",
      action: "Gửi Welcome & Voucher",
      channel: "Popup + Email",
      active: true,
    },
  ];

  return (
    <div className="animate-slide-in rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          ⚙️ Cấu hình Tự động gửi (Automation)
        </h3>
        <button className="text-sm font-medium text-orange-600 hover:underline">
          + Thêm quy tắc mới
        </button>
      </div>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl text-orange-600">
                ⚡
              </div>
              <div>
                <p className="font-bold text-gray-800">{rule.trigger}</p>
                <p className="text-sm text-gray-500">
                  Hành động:{" "}
                  <span className="text-blue-600">{rule.action}</span> • Kênh:{" "}
                  {rule.channel}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`text-xs font-bold ${
                  rule.active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {rule.active ? "Đang chạy" : "Tạm dừng"}
              </span>
              {/* Mock Toggle Switch */}
              <div
                className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${
                  rule.active ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    rule.active ? "translate-x-6" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- NOTIFICATION PAGE CONTAINER ---
const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("create"); // 'list', 'create', 'automation', 'templates'

  const subTabs = [
    { id: "create", label: "Tạo & Gửi" },
    { id: "list", label: "Danh sách & Quản lý" },
    { id: "automation", label: "Automation Rules" },
    { id: "templates", label: "Mẫu thông báo" },
  ];

  return (
    // THAY ĐỔI: Đã xóa class `max-w-7xl mx-auto` để đảm bảo layout full-width
    <div className="p-8">
      {/* Page Header */}
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

      {/* Sub Tabs */}
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

      {/* Content Rendering */}
      <div>
        <NotificationStats />
        {activeTab === "create" && <CreateNotificationForm />}
        {activeTab === "list" && <NotificationList />}
        {activeTab === "automation" && <AutomationRules />}
        {activeTab === "templates" && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <div className="mb-3 text-4xl">📄</div>
            <h3 className="text-lg font-medium text-gray-600">
              Thư viện mẫu đang được cập nhật
            </h3>
            <p className="text-gray-400">
              Tính năng quản lý template sẽ sớm ra mắt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [currentView, setCurrentView] = useState("notifications");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <style>{styles}</style>

      {/* Sidebar - fixed */}
      <aside className="custom-scroll fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white">
        {/* THAY ĐỔI: Sử dụng h-24 và flex items-center để căn giữa header giống code mẫu */}
        <div
          className={`${CUSTOM_CLASSES.gradientOrange} flex h-24 items-center px-6`}
        >
          <div className="flex items-center space-x-3">
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
        {/* THAY ĐỔI: Sử dụng h-24 và flex items-center cho header chính */}
        <header className="sticky top-0 z-10 flex h-24 items-center border-b border-gray-200 bg-white/95 px-8 shadow-sm backdrop-blur-sm">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentView === "notifications"
                  ? "Trung tâm điều hành"
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
          {currentView === "notifications" ? (
            <NotificationPage />
          ) : (
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
                onClick={() => setCurrentView("notifications")}
                className="mt-6 font-semibold text-orange-600 hover:underline"
              >
                Quay lại trang Thông báo
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
