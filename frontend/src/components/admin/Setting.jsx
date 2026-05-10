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
  
  /* Style cho item trong menu cài đặt */
  .setting-menu-item {
    transition: all 0.2s;
  }
  .setting-menu-item:hover {
    background-color: #fff7ed; /* orange-50 */
    color: #c2410c; /* orange-700 */
  }
  .setting-menu-active {
    background-color: #fff7ed;
    color: #ea580c;
    font-weight: 600;
    border-right: 3px solid #f97316;
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
  { id: "reports", icon: "📈", label: "Báo cáo & Phân tích" },
  { id: "settings", icon: "⚙️", label: "Cài đặt hệ thống" }, // Active Page
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

// --- UI COMPONENTS FOR SETTINGS ---

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <span className="font-medium text-gray-700">{label}</span>
    <div className="relative mr-2 inline-block w-12 align-middle transition duration-200 ease-in select-none">
      <input
        type="checkbox"
        name="toggle"
        checked={checked}
        onChange={onChange}
        className="toggle-checkbox absolute top-0 left-0 block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-gray-300 bg-white transition-all duration-300 ease-in-out checked:border-orange-500"
      />
      <label className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 transition-colors duration-300 ease-in-out"></label>
    </div>
  </div>
);

const InputField = ({ label, type = "text", placeholder, value, subLabel }) => (
  <div className="mb-4">
    <label className="mb-1 block text-sm font-bold text-gray-700">
      {label}
    </label>
    {subLabel && <p className="mb-2 text-xs text-gray-400">{subLabel}</p>}
    <input
      type={type}
      className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm transition focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
      placeholder={placeholder}
      defaultValue={value}
    />
  </div>
);

const SectionHeader = ({ title, desc }) => (
  <div className="mb-6 border-b border-gray-100 pb-3">
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{desc}</p>
  </div>
);

// --- SETTINGS PAGE CONTENT ---

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  const menuItems = [
    { id: "general", label: "Cài đặt chung", icon: "🌍" },
    { id: "users", label: "Người dùng & Phân quyền", icon: "👥" },
    { id: "reviews", label: "Đánh giá & Kiểm duyệt", icon: "⭐" },
    { id: "reports", label: "Báo cáo & Khiếu nại", icon: "🚩" },
    { id: "notifications", label: "Thông báo hệ thống", icon: "🔔" },
    { id: "content", label: "Nội dung & Chính sách", icon: "📜" },
    { id: "media", label: "Media & Hình ảnh", icon: "🖼️" },
    { id: "security", label: "Bảo mật hệ thống", icon: "🛡️" },
    { id: "logs", label: "Nhật ký & Logs", icon: "📝" },
    { id: "backup", label: "Sao lưu & Khôi phục", icon: "💾" },
    { id: "integration", label: "Dịch vụ tích hợp", icon: "🔌" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Cài đặt chung"
              desc="Thông tin cơ bản về nền tảng và hiển thị hệ thống"
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <InputField
                  label="Tên hệ thống / Nền tảng"
                  value="Fashion Admin Pro"
                />
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                  <label className="mb-3 block text-sm font-bold text-gray-700">
                    Logo hệ thống
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white text-2xl shadow-sm">
                      🛍️
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="rounded border bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50">
                        Tải lên ảnh mới
                      </button>
                      <button className="text-xs text-red-500 hover:underline">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                  <label className="mb-3 block text-sm font-bold text-gray-700">
                    Favicon
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white text-sm shadow-sm">
                      ico
                    </div>
                    <button className="rounded border bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50">
                      Thay đổi
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Múi giờ mặc định
                  </label>
                  <select className="w-full rounded border bg-white p-2 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                    <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                    <option>(GMT+00:00) UTC</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Ngôn ngữ mặc định
                  </label>
                  <select className="w-full rounded border bg-white p-2 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Định dạng ngày - giờ
                  </label>
                  <select className="w-full rounded border bg-white p-2 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                    <option>DD/MM/YYYY HH:mm</option>
                    <option>MM/DD/YYYY HH:mm</option>
                  </select>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <ToggleSwitch
                    label="Chế độ bảo trì hệ thống"
                    checked={false}
                    onChange={() => {}}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Khi bật, chỉ Admin mới có thể truy cập hệ thống.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Người dùng & Phân quyền"
              desc="Quản lý đăng ký, bảo mật tài khoản và vai trò"
            />
            <div className="mb-6 rounded-lg border border-orange-100 bg-orange-50/50 p-6">
              <h4 className="mb-4 flex items-center font-bold text-gray-800">
                <span className="mr-2">🔐</span> Cấu hình đăng nhập
              </h4>
              <ToggleSwitch
                label="Cho phép đăng ký tài khoản mới"
                checked={true}
                onChange={() => {}}
              />
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label="Độ dài mật khẩu tối thiểu"
                  type="number"
                  value="8"
                />
                <InputField
                  label="Giới hạn số lần đăng nhập sai"
                  type="number"
                  value="5"
                  subLabel="Khóa tạm thời nếu sai quá số lần"
                />
              </div>
              <div className="mt-2">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                    defaultChecked
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Yêu cầu ký tự đặc biệt trong mật khẩu
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-gray-800">
                  Danh sách Vai trò (Roles)
                </h4>
                <button className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-700">
                  + Thêm vai trò
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-3">Vai trò</th>
                      <th className="px-6 py-3">Mô tả quyền hạn</th>
                      <th className="px-6 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        Super Admin
                      </td>
                      <td className="px-6 py-4">Toàn quyền hệ thống</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-gray-400 italic">
                          Mặc định
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        Admin
                      </td>
                      <td className="px-6 py-4">
                        Quản lý nội dung, người dùng (Trừ Settings)
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="#"
                          className="font-medium text-orange-600 hover:underline"
                        >
                          Sửa
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        Moderator
                      </td>
                      <td className="px-6 py-4">
                        Kiểm duyệt đánh giá, bình luận
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="#"
                          className="font-medium text-orange-600 hover:underline"
                        >
                          Sửa
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Đánh giá & Kiểm duyệt"
              desc="Cấu hình hệ thống review sản phẩm"
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="space-y-2 rounded-lg bg-white">
                  <ToggleSwitch
                    label="Bật chức năng đánh giá sản phẩm"
                    checked={true}
                    onChange={() => {}}
                  />
                  <ToggleSwitch
                    label="Bật kiểm duyệt trước khi hiển thị (Pre-moderation)"
                    checked={false}
                    onChange={() => {}}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <InputField
                    label="Số sao tối thiểu cho phép"
                    type="number"
                    value="1"
                  />
                  <InputField
                    label="Auto-flag (Số sao)"
                    type="number"
                    value="2"
                    subLabel="Đánh giá <= mức này sẽ cần duyệt"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Từ khóa nhạy cảm (Cấm)
                  </label>
                  <textarea
                    className="w-full rounded-lg border bg-gray-50 p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                    placeholder="Nhập các từ khóa cách nhau bởi dấu phẩy..."
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-400">
                    Hệ thống sẽ tự động ẩn các đánh giá chứa từ khóa này.
                  </p>
                </div>
              </div>

              <div className="h-fit rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <h4 className="mb-2 text-sm font-bold text-blue-800">
                  💡 Gợi ý cấu hình
                </h4>
                <p className="mb-4 text-sm text-blue-600">
                  Nên bật chế độ "Pre-moderation" trong giai đoạn đầu ra mắt để
                  kiểm soát chất lượng nội dung tốt hơn.
                </p>
                <div className="space-y-1 text-xs text-blue-500">
                  <p>• Từ khóa cấm: lừa đảo, fake, ...</p>
                  <p>• Ngưỡng Auto-flag: 1 hoặc 2 sao</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Báo cáo & Khiếu nại"
              desc="Quản lý việc người dùng báo cáo nội dung xấu"
            />
            <div className="space-y-6">
              <div>
                <ToggleSwitch
                  label="Cho phép người dùng báo cáo đánh giá"
                  checked={true}
                  onChange={() => {}}
                />
                <ToggleSwitch
                  label="Tự động ẩn nội dung khi vượt ngưỡng báo cáo"
                  checked={true}
                  onChange={() => {}}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label="Ngưỡng báo cáo để tự động ẩn"
                  type="number"
                  value="5"
                />
                <InputField
                  label="Giới hạn số lần báo cáo / người dùng / ngày"
                  type="number"
                  value="10"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="mb-3 block text-sm font-bold text-gray-700">
                  Danh sách lý do báo cáo mặc định
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    "Nội dung spam",
                    "Ngôn từ thù địch",
                    "Thông tin sai lệch",
                    "Quảng cáo trái phép",
                  ].map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {reason}
                      </span>
                      <button className="rounded p-1 text-xs text-red-500 hover:bg-red-50">
                        ✕
                      </button>
                    </div>
                  ))}
                  <button className="flex items-center justify-center rounded-lg border border-dashed border-orange-300 bg-orange-50 p-3 text-sm font-medium text-orange-600 transition hover:bg-orange-100">
                    + Thêm lý do mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Thông báo hệ thống"
              desc="Cấu hình Email và Push Notification"
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 border-b pb-2 font-bold text-gray-800">
                    Kênh thông báo
                  </h4>
                  <ToggleSwitch
                    label="Gửi Email thông báo"
                    checked={true}
                    onChange={() => {}}
                  />
                  <ToggleSwitch
                    label="Thông báo trong ứng dụng (In-app)"
                    checked={true}
                    onChange={() => {}}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 border-b pb-2 font-bold text-gray-800">
                    Sự kiện kích hoạt (Admin)
                  </h4>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 rounded text-orange-600"
                        defaultChecked
                      />{" "}
                      <span className="text-sm">Có đánh giá mới cần duyệt</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 rounded text-orange-600"
                        defaultChecked
                      />{" "}
                      <span className="text-sm">Có nội dung bị báo cáo</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 rounded text-orange-600"
                      />{" "}
                      <span className="text-sm">Có người dùng đăng ký mới</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 rounded text-orange-600"
                        defaultChecked
                      />{" "}
                      <span className="text-sm">Cảnh báo bảo mật hệ thống</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">
                    Mẫu Email (Templates)
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    "Welcome Email",
                    "Password Reset",
                    "Review Approved",
                    "Account Locked Warning",
                  ].map((tpl) => (
                    <div
                      key={tpl}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:border-orange-400"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                          ✉️
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                          {tpl}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Sửa mẫu ›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "media":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Media & Hình ảnh"
              desc="Quản lý tập tin tải lên"
            />
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <InputField
                  label="Dung lượng tối đa mỗi file (MB)"
                  type="number"
                  value="5"
                />
                <InputField
                  label="Số lượng ảnh tối đa cho mỗi đánh giá"
                  type="number"
                  value="5"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <ToggleSwitch
                  label="Tự động nén ảnh khi tải lên"
                  checked={true}
                  onChange={() => {}}
                />
                <ToggleSwitch
                  label="Kiểm duyệt ảnh trước khi hiển thị"
                  checked={false}
                  onChange={() => {}}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-gray-700">
                  Định dạng file cho phép
                </label>
                <div className="flex flex-wrap gap-3">
                  {["JPG", "PNG", "WEBP", "MP4"].map((fmt) => (
                    <label
                      key={fmt}
                      className="flex cursor-pointer items-center space-x-2 rounded border border-gray-200 bg-white px-3 py-2 shadow-sm select-none hover:border-orange-300"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded text-orange-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {fmt}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center space-x-2 rounded border border-gray-200 bg-white px-3 py-2 opacity-50 shadow-sm select-none hover:border-orange-300">
                    <input
                      type="checkbox"
                      className="rounded text-orange-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      GIF
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="animate-slide-in">
            <SectionHeader
              title="Bảo mật hệ thống"
              desc="Cài đặt an toàn cho Admin và hệ thống"
            />
            <div className="space-y-6">
              <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                <h4 className="mb-3 flex items-center font-bold text-red-800">
                  <span className="mr-2">🛡️</span> Cấu hình bảo mật cao
                </h4>
                <ToggleSwitch
                  label="Bật xác thực 2 bước (2FA) cho Admin"
                  checked={false}
                  onChange={() => {}}
                />
                <div className="mt-4">
                  <InputField
                    label="Thời gian hết hạn phiên đăng nhập (phút)"
                    type="number"
                    value="60"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Danh sách IP Whitelist (Chỉ Admin)
                </label>
                <textarea
                  className="w-full rounded-lg border bg-white p-3 font-mono text-sm text-gray-700 outline-none"
                  rows="3"
                  placeholder="Nhập IP, mỗi dòng một IP..."
                ></textarea>
                <p className="mt-1 text-xs text-gray-400">
                  Chỉ những IP này mới được phép truy cập vào trang Admin.
                </p>
              </div>

              <div className="border-t pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">
                    Nhật ký đăng nhập gần đây
                  </h4>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    Xem tất cả
                  </a>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2">User</th>
                        <th className="px-4 py-2">IP</th>
                        <th className="px-4 py-2">Thời gian</th>
                        <th className="px-4 py-2 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-medium">Admin</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          192.168.1.1
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          10 phút trước
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                            Thành công
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Admin</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          113.161.22.5
                        </td>
                        <td className="px-4 py-3 text-gray-500">2 giờ trước</td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                            Thất bại
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case "content":
      case "logs":
      case "backup":
      case "integration":
        return (
          <div className="animate-slide-in flex h-full min-h-100 flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400">
              ⚙️
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              Cấu hình {menuItems.find((i) => i.id === activeTab)?.label}
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
              Các thiết lập chi tiết cho phần này đang được xây dựng. Vui lòng
              quay lại sau.
            </p>
            {activeTab === "integration" && (
              <div className="mt-8 w-full max-w-md space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📧</span>
                    <span className="text-sm font-bold text-gray-700">
                      SMTP Email Service
                    </span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 opacity-60 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">☁️</span>
                    <span className="text-sm font-bold text-gray-700">
                      Cloudinary Storage
                    </span>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500">
                    Not Configured
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden p-6">
      {/* --- SETTINGS PANEL CONTAINER --- */}
      <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* INNER SIDEBAR (MENU) */}
        <div className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200/50 bg-gray-50 p-5">
            <h3 className="text-lg font-bold text-gray-800">
              Danh mục cài đặt
            </h3>
          </div>
          <nav className="custom-scroll flex-1 space-y-1 overflow-y-auto p-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`setting-menu-item flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm transition-all ${
                  activeTab === item.id
                    ? "setting-menu-active bg-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* INNER CONTENT AREA */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="custom-scroll flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl p-8">{renderContent()}</div>
          </div>

          {/* Footer Action Bar (Sticky inside panel) */}
          <div className="z-10 flex justify-end space-x-3 border-t border-gray-100 bg-white p-4">
            <button className="rounded-lg px-6 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
              Hủy bỏ
            </button>
            <button className="flex items-center rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90">
              <span className="mr-2">💾</span> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // Mặc định hiển thị trang Settings
  const [currentView, setCurrentView] = useState("settings");

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-gray-50 font-sans text-slate-800">
      <style>{styles}</style>

      {/* Main Layout Flex Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. MAIN SIDEBAR (Fixed Left) */}
        <aside className="z-20 flex w-64 flex-col border-r border-gray-200 bg-white">
          <div
            className={`${CUSTOM_CLASSES.gradientOrange} flex h-20 shrink-0 items-center px-6`}
          >
            <div className="flex w-full items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                🛍️
              </div>
              <div>
                <h1 className="text-lg leading-tight font-bold text-white">
                  Admin Pro
                </h1>
                <p className="text-xs text-orange-100 opacity-90">
                  System Manager
                </p>
              </div>
            </div>
          </div>

          <nav className="custom-scroll flex-1 space-y-1 overflow-y-auto p-3">
            {navItemsConfig.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={currentView === item.id}
                onClick={() => setCurrentView(item.id)}
              />
            ))}
          </nav>

          <div className="border-t border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center space-x-3">
              <div
                className={`h-9 w-9 ${CUSTOM_CLASSES.gradientOrange} flex items-center justify-center rounded-full font-bold text-white shadow-sm`}
              >
                A
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-gray-800">
                  Administrator
                </p>
                <p className="flex items-center text-xs text-green-600">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                  Online
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 2. MAIN CONTENT WRAPPER */}
        <main className="flex min-w-0 flex-1 flex-col bg-gray-50">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur-md">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                {navItemsConfig.find((i) => i.id === currentView)?.label ||
                  "Trang quản trị"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <span className="text-xl">🔔</span>
                <span className={CUSTOM_CLASSES.notificationDot}></span>
              </button>
            </div>
          </header>

          {/* View Content */}
          <div className="relative flex-1 overflow-hidden">
            {currentView === "settings" ? (
              <SettingsPage />
            ) : (
              <div className="animate-slide-in flex h-full flex-col items-center justify-center p-10 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-4xl text-orange-500">
                  🚧
                </div>
                <h3 className="text-xl font-bold text-gray-700">
                  Đang xây dựng
                </h3>
                <p className="mx-auto mt-2 max-w-md text-gray-500">
                  Chức năng{" "}
                  <strong>
                    {navItemsConfig.find((i) => i.id === currentView)?.label}
                  </strong>{" "}
                  đang trong quá trình phát triển và sẽ sớm ra mắt.
                </p>
                <button
                  onClick={() => setCurrentView("settings")}
                  className="mt-8 rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Quay lại Cài đặt
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
