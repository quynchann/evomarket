import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

// Xóa thuộc tính active cứng, sẽ xử lý bằng state
const navItems = [
  { icon: "📊", label: "Tổng quan" },
  { icon: "🛒", label: "Quản lý đơn hàng" },
  { icon: "📦", label: "Quản lý sản phẩm" },
  { icon: "👥", label: "Quản lý người dùng" },
  { icon: "👓", label: "Try-On Analytics" },
  { icon: "💰", label: "Quản lý thanh toán" },
  { icon: "🔔", label: "Thông báo", badge: 12 },
  { icon: "⭐", label: "Quản lý đánh giá" },
  { icon: "🎁", label: "Chương trình khuyến mãi" },
  { icon: "📈", label: "Báo cáo & Phân tích" },
  { icon: "⚙️", label: "Cài đặt hệ thống" },
];

const CUSTOM_CLASSES = {
  gradientOrange: "bg-gradient-to-br from-orange-600 to-orange-400",
  cardShadow: "shadow-md shadow-gray-200/50",
  hoverLift:
    "transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",
  notificationDot:
    "w-2 h-2 bg-red-500 rounded-full ring-2 ring-white absolute top-1.5 right-1.5",
};

// Hàm render cho các mục điều hướng
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

// Hàm render cho thẻ thống kê (Top Stats Card)
const StatCard = ({
  idLabel,
  label,
  value,
  trend,
  trendColor,
  icon,
  iconBgClass,
}) => (
  <div
    className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow} ${CUSTOM_CLASSES.hoverLift}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p id={idLabel} className="mb-2 text-sm font-medium text-gray-600">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className={`text-${trendColor}-600 mt-2 flex items-center text-sm`}>
          <span className="mr-1">{trendColor === "green" ? "↑" : "⚠️"}</span>{" "}
          {trend}
        </p>
      </div>
      <div
        className={`h-12 w-12 ${iconBgClass} flex items-center justify-center rounded-xl text-2xl`}
      >
        {icon}
      </div>
    </div>
  </div>
);

// Hàm render cho mục Trạng thái đơn hàng
const OrderStatusItem = ({
  icon,
  status,
  subStatus,
  count,
  bgClass,
  borderClass,
  iconBgClass,
  iconTextClass,
}) => (
  <div
    className={`flex items-center justify-between p-4 ${bgClass} rounded-lg border ${borderClass}`}
  >
    <div className="flex items-center space-x-3">
      <div
        className={`h-10 w-10 ${iconBgClass} flex items-center justify-center rounded-lg font-bold text-white ${iconTextClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800">{status}</p>
        <p className="text-sm text-gray-600">{subStatus}</p>
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{count}</p>
  </div>
);

// Hàm render cho mục Thông báo cần xử lý
const NotificationItem = ({
  icon,
  title,
  description,
  subText,
  count,
  borderColor,
  bgClass,
  countBgClass,
  countTextClass,
}) => (
  <div
    className={`p-4 ${bgClass} border-l-4 border-${borderColor}-500 rounded-lg ${CUSTOM_CLASSES.hoverLift} cursor-pointer`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <p className="font-semibold text-gray-800">{title}</p>
        </div>
        <p className="mb-2 text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500">{subText}</p>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${countBgClass} ${countTextClass}`}
      >
        {count}
      </span>
    </div>
  </div>
);

// Hàm render cho mục Sản phẩm bán chạy
const TopProductItem = ({
  rank,
  name,
  stats,
  revenue,
  trend,
  rankClass,
  rankBgClass,
  trendColor,
}) => (
  <div className="flex items-center space-x-4 rounded-lg p-3 transition hover:bg-gray-50">
    <div
      className={`h-8 w-8 flex-shrink-0 ${rankBgClass} flex items-center justify-center rounded-full ${rankClass} text-sm font-bold`}
    >
      {rank}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-600">{stats}</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-800">{revenue}</p>
      <p className={`text-xs text-${trendColor}-600`}>{trend}</p>
    </div>
  </div>
);

// Hàm render cho thanh tiến trình đánh giá
const ReviewProgressBar = ({ star, width, color }) => (
  <div className="flex items-center space-x-3">
    <span className="w-12 text-xs text-gray-600">{star}⭐</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
      <div
        className={`h-full bg-${color}-500`}
        style={{ width: `${width}%` }}
      ></div>
    </div>
    <span className="w-12 text-right text-xs text-gray-600">{width}%</span>
  </div>
);

// Component Toggle Switch nhỏ
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none ${
      checked ? "bg-orange-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// Component SettingsContent Mới
const SettingsContent = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
        <p className="text-gray-600">Quản lý cấu hình cửa hàng và tài khoản</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cột trái: Thông tin chung & Bảo mật */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin cửa hàng */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              Thông tin cửa hàng
            </h3>
            <div className="flex items-start space-x-6">
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 text-4xl">
                  🛍️
                </div>
                <button className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                  Thay đổi Logo
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tên cửa hàng
                    </label>
                    <input
                      type="text"
                      defaultValue="Fashion Eyewear Official"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Mã định danh (Store ID)
                    </label>
                    <input
                      type="text"
                      defaultValue="STORE-88392"
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows="3"
                    defaultValue="Chuyên cung cấp kính mắt thời trang cao cấp chính hãng."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@fashioneyewear.vn"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Hotline
                    </label>
                    <input
                      type="text"
                      defaultValue="1900 888 888"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700">
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Bảo mật & Đăng nhập */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              Bảo mật & Đăng nhập
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800">Đổi mật khẩu</p>
                  <p className="text-sm text-gray-500">
                    Lần đổi cuối: 3 tháng trước
                  </p>
                </div>
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cập nhật
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 py-2">
                <div>
                  <p className="font-medium text-gray-800">
                    Xác thực 2 bước (2FA)
                  </p>
                  <p className="text-sm text-gray-500">
                    Tăng cường bảo mật cho tài khoản admin
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Đang bật
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 py-2">
                <div>
                  <p className="font-medium text-gray-800">Phiên đăng nhập</p>
                  <p className="text-sm text-gray-500">
                    Quản lý các thiết bị đang đăng nhập
                  </p>
                </div>
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Cấu hình & Thông báo */}
        <div className="space-y-6">
          {/* Cấu hình chung */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              Cấu hình hiển thị
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ngôn ngữ hệ thống
                </label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option>Tiếng Việt (Vietnamese)</option>
                  <option>English (US)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Múi giờ
                </label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Đơn vị tiền tệ
                </label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option>VND (₫)</option>
                  <option>USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cài đặt thông báo */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              Cài đặt thông báo
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Email thông báo</p>
                  <p className="text-xs text-gray-500">
                    Nhận đơn hàng mới qua email
                  </p>
                </div>
                <ToggleSwitch checked={emailNotif} onChange={setEmailNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Push Notification</p>
                  <p className="text-xs text-gray-500">
                    Thông báo trên trình duyệt
                  </p>
                </div>
                <ToggleSwitch checked={pushNotif} onChange={setPushNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Tin nhắn SMS</p>
                  <p className="text-xs text-gray-500">
                    Nhận OTP và cảnh báo bảo mật
                  </p>
                </div>
                <ToggleSwitch checked={smsNotif} onChange={setSmsNotif} />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-100 bg-red-50 p-6">
            <h3 className="mb-2 text-lg font-bold text-red-700">
              Vùng nguy hiểm
            </h3>
            <p className="mb-4 text-sm text-red-600">
              Các hành động này không thể hoàn tác. Hãy cẩn thận.
            </p>
            <button className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
              Tạm ngưng hoạt động
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tách nội dung dashboard thành component
const DashboardContent = () => (
  <div className="p-8">
    {/* Top Stats */}
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        idLabel="revenue-label"
        label="Tổng doanh thu"
        value="15.8 tỷ"
        trend="24.5% so với tháng trước"
        trendColor="green"
        icon="💰"
        iconBgClass={CUSTOM_CLASSES.gradientOrange}
      />
      <StatCard
        idLabel="orders-label"
        label="Tổng đơn hàng"
        value="8,947"
        trend="12.3% so với tháng trước"
        trendColor="green"
        icon="🛒"
        iconBgClass="bg-blue-100"
      />
      <StatCard
        idLabel="users-label"
        label="Tổng người dùng"
        value="24,518"
        trend="18.7% so với tháng trước"
        trendColor="green"
        icon="👥"
        iconBgClass="bg-purple-100"
      />
      <StatCard
        idLabel="products-label"
        label="Tổng sản phẩm"
        value="3,842"
        trend="127 sản phẩm tồn kho thấp"
        trendColor="orange"
        icon="📦"
        iconBgClass="bg-green-100"
      />
    </div>

    {/* Order Status & User Stats */}
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* User Statistics (moved before Order Status) */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Thống kê người dùng
        </h3>
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-orange-800">
                  Tổng Buyers
                </p>
                <p className="text-3xl font-bold text-orange-600">18,342</p>
                <p className="mt-1 text-sm text-orange-700">+1,234 tháng này</p>
              </div>
              <div className="text-5xl">🛍️</div>
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-blue-800">
                  Tổng Sellers
                </p>
                <p className="text-3xl font-bold text-blue-600">6,176</p>
                <p className="mt-1 text-sm text-blue-700">+89 tháng này</p>
              </div>
              <div className="text-5xl">🏪</div>
            </div>
          </div>
          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-green-800">
                  Người dùng mới (30 ngày)
                </p>
                <p className="text-3xl font-bold text-green-600">2,847</p>
                <p className="mt-1 text-sm text-green-700">
                  +18.5% so với tháng trước
                </p>
              </div>
              <div className="text-5xl">✨</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tỷ lệ Buyer/Seller</span>
            <span className="font-bold text-gray-800">2.97:1</span>
          </div>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-gray-200">
            {/* style={{ width: 74.8% }} */}
            <div className="bg-orange-500" style={{ width: "74.8%" }}></div>
            {/* style={{ width: 25.2% }} */}
            <div className="bg-blue-500" style={{ width: "25.2%" }}></div>
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-orange-600">● 74.8% Buyers</span>
            <span className="text-blue-600">● 25.2% Sellers</span>
          </div>
        </div>
      </div>

      {/* Order Status (moved after User Statistics) */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Trạng thái đơn hàng
        </h3>
        <div className="space-y-4">
          <OrderStatusItem
            icon="⏳"
            status="Pending"
            subStatus="Chờ xử lý"
            count="342"
            bgClass="bg-yellow-50"
            borderClass="border-yellow-200"
            iconBgClass="bg-yellow-500"
            iconTextClass="text-lg"
          />
          <OrderStatusItem
            icon="⚙️"
            status="Processing"
            subStatus="Đang xử lý"
            count="1,247"
            bgClass="bg-blue-50"
            borderClass="border-blue-200"
            iconBgClass="bg-blue-500"
            iconTextClass="text-lg"
          />
          <OrderStatusItem
            icon="🚚"
            status="Shipped"
            subStatus="Đang giao"
            count="2,156"
            bgClass="bg-purple-50"
            borderClass="border-purple-200"
            iconBgClass="bg-purple-500"
            iconTextClass="text-lg"
          />
          <OrderStatusItem
            icon="✅"
            status="Delivered"
            subStatus="Đã giao"
            count="4,789"
            bgClass="bg-green-50"
            borderClass="border-green-200"
            iconBgClass="bg-green-500"
            iconTextClass="text-lg"
          />
          <OrderStatusItem
            icon="❌"
            status="Cancelled"
            subStatus="Đã hủy"
            count="289"
            bgClass="bg-red-50"
            borderClass="border-red-200"
            iconBgClass="bg-red-500"
            iconTextClass="text-lg"
          />
          <OrderStatusItem
            icon="↩️"
            status="Returned"
            subStatus="Đã hoàn trả"
            count="124"
            bgClass="bg-orange-50"
            borderClass="border-orange-200"
            iconBgClass="bg-orange-500"
            iconTextClass="text-lg"
          />
        </div>
      </div>
    </div>

    {/* Notifications & Top Products */}
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Pending Notifications */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            Thông báo cần xử lý
          </h3>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            12 mới
          </span>
        </div>
        <div className="space-y-3">
          <NotificationItem
            icon="💸"
            title="Refund Pending"
            description="8 yêu cầu hoàn tiền đang chờ duyệt"
            subText="Tổng giá trị: 24,500,000đ"
            count="8"
            borderColor="red"
            bgClass="bg-red-50"
            countBgClass="bg-red-100"
            countTextClass="text-red-700"
          />
          <NotificationItem
            icon="💰"
            title="Rút tiền Pending"
            description="23 yêu cầu rút tiền từ sellers"
            subText="Tổng giá trị: 186,750,000đ"
            count="23"
            borderColor="yellow"
            bgClass="bg-yellow-50"
            countBgClass="bg-yellow-100"
            countTextClass="text-yellow-700"
          />
          <NotificationItem
            icon="⚠️"
            title="Report Pending"
            description="15 báo cáo vi phạm chờ xử lý"
            subText="Sản phẩm: 8 | Người dùng: 5 | Đánh giá: 2"
            count="15"
            borderColor="orange"
            bgClass="bg-orange-50"
            countBgClass="bg-orange-100"
            countTextClass="text-orange-700"
          />
          <NotificationItem
            icon="📦"
            title="Tồn kho thấp"
            description="127 sản phẩm cần nhập thêm hàng"
            subText="Cần xem xét và thông báo sellers"
            count="127"
            borderColor="blue"
            bgClass="bg-blue-50"
            countBgClass="bg-blue-100"
            countTextClass="text-blue-700"
          />
        </div>
        <button className="mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
          Xem tất cả thông báo →
        </button>
      </div>

      {/* Top Products */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Sản phẩm bán chạy</h3>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>90 ngày qua</option>
          </select>
        </div>
        <div className="space-y-4">
          <TopProductItem
            rank={1}
            name="Elara Diamond Necklace"
            stats="Try-on: 2,341 | Đã bán: 847"
            revenue="2.8 tỷ"
            trend="↑ 23%"
            rankClass="text-white"
            trendColor="green"
            rankBgClass={CUSTOM_CLASSES.gradientOrange}
          />
          <TopProductItem
            rank={2}
            name="Rayne Cat-Eye Sunglasses"
            stats="Try-on: 1,892 | Đã bán: 623"
            revenue="1.9 tỷ"
            trend="↑ 18%"
            rankClass="text-gray-700"
            trendColor="green"
            rankBgClass="bg-gray-300"
          />
          <TopProductItem
            rank={3}
            name="Aurora Pearl Earrings"
            stats="Try-on: 1,567 | Đã bán: 489"
            revenue="4.3 tỷ"
            trend="↑ 31%"
            rankClass="text-orange-800"
            trendColor="green"
            rankBgClass="bg-orange-200"
          />
          <TopProductItem
            rank={4}
            name="Monaco Panama Hat"
            stats="Try-on: 1,234 | Đã bán: 412"
            revenue="3.6 tỷ"
            trend="↑ 15%"
            rankClass="text-gray-600"
            trendColor="green"
            rankBgClass="bg-gray-200"
          />
          <TopProductItem
            rank={5}
            name="Luxe Gold Hoop Earrings"
            stats="Try-on: 1,089 | Đã bán: 356"
            revenue="5.2 tỷ"
            trend="↑ 28%"
            rankClass="text-gray-600"
            trendColor="green"
            rankBgClass="bg-gray-200"
          />
        </div>
        <button className="mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
          Xem tất cả sản phẩm →
        </button>
      </div>
    </div>

    {/* Reviews & Promotions */}
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Reviews Management */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-bold text-gray-800">
              Quản lý đánh giá toàn hệ thống
            </h3>
          </div>
          <button className="rounded-lg px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
            {" "}
            Xem tất cả{" "}
          </button>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">
                Tổng đánh giá
              </span>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">12,847</p>
            <p className="mt-1 text-xs text-yellow-600">+234 hôm nay</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                Chất lượng nền tảng
              </span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-2xl font-bold text-green-700">4.6/5</p>
            <p className="mt-1 text-xs text-green-600">
              ↑ 0.2 so với tháng trước
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-semibold text-red-600">
                    ⚠️ Cần kiểm duyệt
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    47
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Nội dung nhạy cảm, bị người dùng báo cáo
                </p>
              </div>
            </div>
            <button className="text-xs font-medium text-red-600 hover:text-red-700">
              Xử lý vi phạm →
            </button>
          </div>
          <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-semibold text-orange-600">
                    📉 Đánh giá 1-2 sao
                  </span>
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    342
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Phục vụ phân tích chất lượng hệ thống/seller
                </p>
              </div>
            </div>
            <button className="text-xs font-medium text-orange-600 hover:text-orange-700">
              Xem báo cáo →
            </button>
          </div>
          <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-semibold text-blue-600">
                    📸 Có hình ảnh/video
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    2,847
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Ưu tiên kiểm duyệt do ảnh hưởng lớn tới hiển thị
                </p>
              </div>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Kiểm duyệt media →
            </button>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Phân bố đánh giá:</span>
          </div>
          <div className="mt-3 space-y-2">
            <ReviewProgressBar star={5} width={68} color="green" />
            <ReviewProgressBar star={4} width={22} color="blue" />
            <ReviewProgressBar star={3} width={7} color="yellow" />
            <ReviewProgressBar star={2} width={2} color="orange" />
            <ReviewProgressBar star={1} width={1} color="red" />
          </div>
        </div>
      </div>

      {/* Promotions Management */}
      <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎁</span>
            <h3 className="text-lg font-bold text-gray-800">
              Chương trình khuyến mãi
            </h3>
          </div>
          <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700">
            {" "}
            + Tạo mới{" "}
          </button>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="mb-1 text-xs font-medium text-green-600">Đang chạy</p>
            <p className="text-2xl font-bold text-green-700">18</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="mb-1 text-xs font-medium text-blue-600">
              Sắp diễn ra
            </p>
            <p className="text-2xl font-bold text-blue-700">7</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
            <p className="mb-1 text-xs font-medium text-gray-600">
              Đã kết thúc
            </p>
            <p className="text-2xl font-bold text-gray-700">142</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                    HOT
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Đang chạy
                  </span>
                </div>
                <p className="mt-2 font-bold text-gray-800">
                  Flash Sale Cuối Tuần
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Giảm 30-50% toàn bộ kính mắt
                </p>
              </div>
              <span className="text-3xl">🔥</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">📅 Kết thúc: 27/11/2025</span>
              <span className="font-bold text-orange-600">
                Đã dùng: 2,341 mã
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Sắp diễn ra
                  </span>
                </div>
                <p className="mt-2 font-semibold text-gray-800">
                  Tết Sale 2026
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Giảm đến 70% + Quà tặng hấp dẫn
                </p>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">📅 Bắt đầu: 25/01/2026</span>
              <span className="font-bold text-blue-600">
                Chuẩn bị kích hoạt
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Đang chạy
                  </span>
                </div>
                <p className="mt-2 font-semibold text-gray-800">
                  Giảm 15% Khách Hàng Mới
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Áp dụng cho đơn hàng đầu tiên
                </p>
              </div>
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">📅 Vô thời hạn</span>
              <span className="font-bold text-yellow-600">
                Đã dùng: 4,523 mã
              </span>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
          Quản lý tất cả chương trình →
        </button>
      </div>
    </div>

    {/* Low Stock Alert */}
    <div className={`rounded-xl bg-white p-6 ${CUSTOM_CLASSES.cardShadow}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📦</span>
          <h3 className="text-lg font-bold text-gray-800">
            Cảnh báo tồn kho thấp
          </h3>
        </div>
        <button className="rounded-lg px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50">
          {" "}
          Xuất danh sách{" "}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Seller
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Tồn kho
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Đã bán (30d)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Mức độ
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="transition hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">
                  Ray-Ban Aviator Gold
                </p>
                <p className="text-xs text-gray-500">SKU: RB3025-001</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                Optical Store VN
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-red-600">3</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">
                124
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Rất thấp
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Thông báo
                </button>
              </td>
            </tr>
            <tr className="transition hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">Oakley Frogskins</p>
                <p className="text-xs text-gray-500">SKU: OO9013-24</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">Fashion Eyes</td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-orange-600">8</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">
                89
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Thấp
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Thông báo
                </button>
              </td>
            </tr>
            <tr className="transition hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">Gucci GG0637S</p>
                <p className="text-xs text-gray-500">SKU: GG0637S-002</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                Luxury Eyewear
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-red-600">2</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">
                156
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Rất thấp
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Thông báo
                </button>
              </td>
            </tr>
            <tr className="transition hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">Prada PR 01VS</p>
                <p className="text-xs text-gray-500">SKU: PR01VS-2AU</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                Premium Vision
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-orange-600">12</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">
                67
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  Trung bình
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Thông báo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>Hiển thị 4 trong tổng số 127 sản phẩm tồn kho thấp</p>
        <button className="font-medium text-orange-600 hover:text-orange-700">
          Xem tất cả →
        </button>
      </div>
    </div>
  </div>
);

// Component chính bây giờ hỗ trợ children để dùng làm layout (persist header/sidebar)
const App = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activePage, setActivePage] = useState("Tổng quan");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const preventBack = () => {
      if (!useAuthStore.getState().isAuthenticated) {
        navigate("/admin/login", { replace: true });
      }
    };

    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const renderContent = () => {
    switch (activePage) {
      case "Cài đặt hệ thống":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar - fixed để luôn hiển thị khi cuộn */}
      <aside className="fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div
          className={`${CUSTOM_CLASSES.gradientOrange} flex h-24 items-center px-6`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl">
              🛍️
            </div>
            <div>
              <h1 id="dashboard-title" className="text-xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-orange-100">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              {...item}
              active={activePage === item.label}
              onClick={() => setActivePage(item.label)}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div
                className={`h-10 w-10 ${CUSTOM_CLASSES.gradientOrange} flex items-center justify-center rounded-full font-bold text-white`}
              >
                A
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.fullname || "Admin"}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-4 bottom-full mb-2 w-48 rounded-lg bg-white shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content — có margin-left bằng width sidebar để tránh bị che */}
      <main className="ml-64">
        {/* Header (sticky) */}
        <header className="sticky top-0 z-10 flex h-24 items-center border-b border-gray-200 bg-white px-8">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2
                id="welcome-message"
                className="text-2xl font-bold text-gray-800"
              >
                Chào mừng trở lại, Admin
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {activePage === "Tổng quan"
                  ? "Tổng quan hệ thống ngày 21/11/2025"
                  : "Quản lý cài đặt hệ thống"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative rounded-lg p-2.5 text-gray-600 transition hover:bg-gray-100">
                <span className="text-xl">🔔</span>
                <span className={CUSTOM_CLASSES.notificationDot}></span>
              </button>
              <button
                className={`px-5 py-2.5 ${CUSTOM_CLASSES.gradientOrange} rounded-lg text-sm font-medium text-white transition hover:opacity-90`}
              >
                Xuất báo cáo
              </button>
            </div>
          </div>
        </header>

        {/* Nội dung chính: Thay đổi dựa trên state */}
        <div className="min-h-[calc(100vh-80px)] overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
