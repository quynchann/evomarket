import React, { useState, useCallback, useEffect } from "react";

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
  }
  
  .tab-active::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-slide-in {
    animation: slideInUp 0.3s ease-out forwards;
  }
  
  .toast-enter {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  /* Custom Scrollbar for Sidebar */
  .sidebar-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
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

const navItems = [
  { icon: "📊", label: "Tổng quan" },
  { icon: "🛒", label: "Quản lý đơn hàng" },
  { icon: "📦", label: "Quản lý sản phẩm" },
  { icon: "👥", label: "Quản lý người dùng", active: true },
  { icon: "👓", label: "Try-On Analytics" },
  { icon: "💰", label: "Quản lý thanh toán" },
  { icon: "🔔", label: "Thông báo", badge: 12 },
  { icon: "⭐", label: "Quản lý đánh giá" },
  { icon: "🎁", label: "Chương trình khuyến mãi" },
  { icon: "📈", label: "Báo cáo & Phân tích" },
  { icon: "⚙️", label: "Cài đặt hệ thống" },
];

const NavItem = ({ icon, label, active, badge }) => {
  const baseClasses = `flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition duration-200 ease-in-out border-l-4 border-transparent`;
  const hoverClasses = `hover:bg-orange-50 hover:border-orange-500`;
  const activeClasses = active
    ? `bg-orange-100/50 border-orange-600 font-semibold`
    : "";

  return (
    <a
      href="#"
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
    </a>
  );
};

// --- Mock Data ---
const initialBuyers = [
  {
    id: "#BUY-24518",
    name: "Nguyễn Văn Thành",
    email: "thanh.nguyen@email.com",
    phone: "0912 345 678",
    status: "active",
    type: "buyer",
    orders: 47,
    ordersThisMonth: 8,
    spending: "28,450,000đ",
    spendingChange: "+3.2M tháng này",
    joinDate: "24/11/2024",
    avatarText: "NT",
    avatarBg: "gradient-primary",
  },
  {
    id: "#BUY-24517",
    name: "Lê Thị Hương",
    email: "huong.le@email.com",
    phone: "0987 654 321",
    status: "active",
    type: "buyer",
    orders: 132,
    ordersThisMonth: 12,
    spending: "89,200,000đ",
    spendingChange: "+8.5M tháng này",
    joinDate: "24/11/2022",
    avatarText: "LH",
    avatarBg: "bg-purple-500",
  },
  {
    id: "#BUY-24516",
    name: "Trần Minh",
    email: "minh.tran@email.com",
    phone: "0909 876 543",
    status: "pending",
    type: "buyer",
    orders: 3,
    ordersThisMonth: 3,
    spending: "2,750,000đ",
    spendingChange: "+2.75M tháng này",
    joinDate: "24/11/2023",
    avatarText: "TM",
    avatarBg: "bg-blue-500",
  },
];

const initialSellers = [
  {
    id: "#SELL-6176",
    name: "Optical Store VN",
    shopName: "Optical Store VN",
    email: "contact@opticalstore.vn",
    status: "active",
    type: "seller",
    products: 487,
    productsChange: "+23 tháng này",
    orders: 2341,
    ordersThisMonth: 156,
    revenue: "2.8 tỷ",
    revenueChange: "↑ +18.5% tháng này",
    rating: 4.8,
    reviews: 1234,
    avatarText: "OS",
    avatarBg: "gradient-primary",
  },
  {
    id: "#SELL-6175",
    name: "Fashion Eyes",
    shopName: "Fashion Eyes",
    email: "hello@fashioneyes.vn",
    status: "active",
    type: "seller",
    products: 342,
    productsChange: "+18 tháng này",
    orders: 1892,
    ordersThisMonth: 124,
    revenue: "1.9 tỷ",
    revenueChange: "↑ +12.3% tháng này",
    rating: 4.7,
    reviews: 892,
    avatarText: "FE",
    avatarBg: "bg-blue-500",
  },
  {
    id: "#SELL-6174",
    name: "Luxury Eyewear",
    shopName: "Luxury Eyewear",
    email: "support@luxuryeyewear.vn",
    status: "pending",
    type: "seller",
    products: 89,
    productsChange: "+12 tháng này",
    orders: 47,
    ordersThisMonth: 8,
    revenue: "456 triệu",
    revenueChange: "↑ +8.7% tháng này",
    rating: 4.9,
    reviews: 47,
    avatarText: "LE",
    avatarBg: "bg-purple-500",
  },
  {
    id: "#SELL-6173",
    name: "Glass Shop 24h",
    shopName: "Glass Shop 24h",
    email: "info@glassshop24h.vn",
    status: "locked",
    type: "seller",
    products: 234,
    productsChange: "Đã ẩn hết",
    orders: 567,
    ordersThisMonth: 0,
    revenue: "1.2 tỷ",
    revenueChange: "Không hoạt động",
    rating: 3.2,
    reviews: 234,
    avatarText: "GS",
    avatarBg: "bg-red-500",
  },
];

const stats = [
  {
    label: "Tổng người dùng",
    value: "24,518",
    change: "↑ 12.5%",
    changeColor: "text-green-600",
    icon: "👥",
    iconBg: "gradient-primary",
  },
  {
    label: "Người mua",
    value: "18,342",
    change: "↑ 8.3%",
    changeColor: "text-green-600",
    icon: "🛍️",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    label: "Người bán",
    value: "6,176",
    change: "↑ 15.7%",
    changeColor: "text-green-600",
    icon: "🏪",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    label: "Người dùng mới",
    value: "2,847",
    change: "↑ 18.5%",
    changeColor: "text-green-600",
    icon: "✨",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    label: "Chờ xác minh",
    value: "147",
    change: "Cần duyệt",
    changeColor: "text-orange-600",
    icon: "⏳",
    iconBg: "bg-yellow-100 text-yellow-600",
  },
];

// --- Utility Components ---

const StatusDisplay = ({ status }) => {
  let text, dotColor, bgColor;
  switch (status) {
    case "active":
      text = "Đang hoạt động";
      dotColor = "bg-green-500";
      bgColor = "bg-green-100 text-green-700";
      break;
    case "locked":
      text = "Đã khóa";
      dotColor = "bg-red-500";
      bgColor = "bg-red-100 text-red-700";
      break;
    case "pending":
    default:
      text = "Chờ xác minh";
      dotColor = "bg-yellow-500";
      bgColor = "bg-yellow-100 text-yellow-700";
      break;
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bgColor}`}
    >
      <span
        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${dotColor}`}
      />
      {text}
    </span>
  );
};

const UserTypeBadge = ({ type }) => {
  const isBuyer = type === "buyer";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        isBuyer
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-purple-200 bg-purple-50 text-purple-700"
      }`}
    >
      {isBuyer ? "🛍️ Người mua" : "🏪 Người bán"}
    </span>
  );
};

const ActionButton = ({ icon, title, onClick, className }) => (
  <button
    onClick={onClick}
    className={`action-button rounded-lg p-2 transition hover:scale-110 ${className}`}
    title={title}
  >
    {icon}
  </button>
);

const StatCard = ({ label, value, change, changeColor, icon, iconBg }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="mb-2 flex items-center justify-between">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${iconBg}`}
      >
        {icon}
      </div>
      <span className={`text-xs font-semibold ${changeColor}`}>{change}</span>
    </div>
    <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const Toast = ({ message, type, removeToast }) => {
  let bgColor, icon;
  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      icon = "✅";
      break;
    case "error":
      bgColor = "bg-red-500";
      icon = "❌";
      break;
    case "info":
    default:
      bgColor = "bg-blue-500";
      icon = "ℹ️";
      break;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast();
    }, 3000);
    return () => clearTimeout(timer);
  }, [removeToast]);

  return (
    <div
      className={`toast-enter ${bgColor} mb-3 flex w-full max-w-sm items-center space-x-3 rounded-lg px-6 py-4 text-white shadow-xl backdrop-blur-sm`}
    >
      <span className="text-xl">{icon}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

const ConfirmationModal = ({ modal, closeModal }) => {
  if (!modal) return null;

  const { title, subtitle, message, confirmText, confirmAction, iconBg, icon } =
    modal;

  const confirmButtonClass = `flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition hover:opacity-90 ${iconBg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />
      <div className="animate-slide-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-4 flex items-center space-x-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white ${iconBg}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-600">
            {message}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={closeModal}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                confirmAction();
                closeModal();
              }}
              className={confirmButtonClass}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Content (User Management Logic) ---
const UserManagementContent = () => {
  const [activeTab, setActiveTab] = useState("buyers"); // 'buyers', 'sellers', or 'new_users'
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirmationModal = useCallback(
    (title, subtitle, message, confirmText, confirmAction, iconBg, icon) => {
      setModal({
        title,
        subtitle,
        message,
        confirmText,
        confirmAction,
        iconBg,
        icon,
      });
    },
    [],
  );

  const closeModal = useCallback(() => setModal(null), []);

  // Action Handlers
  const viewUserDetail = (userType, userName) =>
    showToast(
      `Đang xem chi tiết ${
        userType === "buyer" ? "người mua" : "người bán"
      }: ${userName}`,
      "info",
    );
  const editUser = (userType, userName) =>
    showToast(`Đang chỉnh sửa thông tin: ${userName}`, "info");
  const viewShop = (shopName) =>
    showToast(`Đang xem shop: ${shopName}`, "info");

  const toggleUserStatus = (userName, action) => {
    const actionText = action === "lock" ? "khóa" : "mở khóa";
    const actionIcon = action === "lock" ? "🔒" : "🔓";
    const actionBg = action === "lock" ? "bg-red-500" : "bg-green-500";

    showConfirmationModal(
      `Xác nhận ${actionText} tài khoản`,
      userName,
      `Bạn có chắc chắn muốn ${actionText} tài khoản này? ${
        action === "lock"
          ? "Người dùng sẽ không thể đăng nhập và thực hiện giao dịch."
          : "Người dùng sẽ có thể hoạt động trở lại bình thường."
      }`,
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ngay`,
      () =>
        showToast(
          `Đã ${actionText} tài khoản: ${userName}`,
          action === "lock" ? "error" : "success",
        ),
      actionBg,
      actionIcon,
    );
  };

  const verifyUser = (userName) => {
    showConfirmationModal(
      "Xác minh tài khoản",
      userName,
      "Bạn có chắc chắn muốn xác minh tài khoản này? Sau khi xác minh, tài khoản sẽ được kích hoạt đầy đủ.",
      "Xác minh",
      () => showToast(`Đã xác minh tài khoản: ${userName}`, "success"),
      "bg-green-500",
      "✅",
    );
  };

  const deleteUser = (userName) => {
    showConfirmationModal(
      "Xóa tài khoản vĩnh viễn",
      userName,
      "CẢNH BÁO: Hành động này không thể hoàn tác! Tất cả dữ liệu của người dùng sẽ bị xóa vĩnh viễn.",
      "Xóa vĩnh viễn",
      () => showToast(`Đã xóa tài khoản: ${userName}`, "error"),
      "bg-red-500",
      "🗑️",
    );
  };

  return (
    <div className="flex flex-col font-sans text-slate-800">
      {/* Main Content Body */}
      <div className="flex-1 px-8 py-8">
        {/* Page Title & Breadcrumb-ish area inside content */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh sách người dùng
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý và theo dõi thông tin người mua và người bán
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs and Filters */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("buyers")}
                className={`relative py-4 text-sm transition-colors duration-200 ${
                  activeTab === "buyers"
                    ? "tab-active"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Người mua
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === "buyers" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}
                >
                  18,342
                </span>
              </button>
              <button
                onClick={() => setActiveTab("sellers")}
                className={`relative py-4 text-sm transition-colors duration-200 ${
                  activeTab === "sellers"
                    ? "tab-active"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Người bán
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === "sellers" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}
                >
                  6,176
                </span>
              </button>
              {/* Added 'New Users' Tab */}
              <button
                onClick={() => setActiveTab("new_users")}
                className={`relative py-4 text-sm transition-colors duration-200 ${
                  activeTab === "new_users"
                    ? "tab-active"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Người dùng mới
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === "new_users" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  2,847
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6">
            <div className="mb-6 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="max-w-md flex-1">
                <div className="group relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, SĐT..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                  <span className="absolute top-2.5 left-3 text-gray-400 transition-colors group-focus-within:text-orange-500">
                    🔍
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                  <option>Tất cả trạng thái</option>
                  <option>Đang hoạt động</option>
                  <option>Đã khóa</option>
                  <option>Chờ xác minh</option>
                </select>
                <select className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                  <option>Sắp xếp: Mới nhất</option>
                  <option>Cũ nhất</option>
                  <option>Tên A-Z</option>
                  <option>Tên Z-A</option>
                </select>
                <button className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                  📥
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {["Tất cả", "Đang hoạt động", "Đã khóa", "Chờ xác minh"].map(
                (filter) => {
                  const isActive = filter === activeFilter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition duration-200 ${
                        isActive
                          ? "gradient-primary text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* User Tables */}
          <div className="overflow-x-auto">
            {/* Buyers Table */}
            <table
              className={`w-full ${activeTab === "buyers" ? "" : "hidden"}`}
            >
              <thead className="border-y border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Loại tài khoản
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Email / SĐT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Tổng đơn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Chi tiêu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {initialBuyers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-orange-50/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${
                            user.avatarBg === "gradient-primary"
                              ? "gradient-primary"
                              : user.avatarBg
                          }`}
                        >
                          {user.avatarText}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserTypeBadge type={user.type} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDisplay status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.orders} đơn
                      </p>
                      <p className="text-xs text-gray-500">
                        Tháng này: {user.ordersThisMonth}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.spending}
                      </p>
                      <p
                        className={`text-xs ${
                          user.spendingChange.startsWith("↑") ||
                          user.spendingChange.includes("+")
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user.spendingChange}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.joinDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-1 opacity-80 transition-opacity group-hover:opacity-100">
                        <ActionButton
                          icon="👁️"
                          title="Xem chi tiết"
                          onClick={() => viewUserDetail("buyer", user.name)}
                          className="text-blue-600 hover:bg-blue-50"
                        />
                        {user.status === "pending" && (
                          <ActionButton
                            icon="✅"
                            title="Xác minh"
                            onClick={() => verifyUser(user.name)}
                            className="text-green-600 hover:bg-green-50"
                          />
                        )}
                        <ActionButton
                          icon="✏️"
                          title="Chỉnh sửa"
                          onClick={() => editUser("buyer", user.name)}
                          className="text-orange-600 hover:bg-orange-50"
                        />
                        {user.status === "locked" ? (
                          <ActionButton
                            icon="🔓"
                            title="Mở khóa"
                            onClick={() =>
                              toggleUserStatus(user.name, "unlock")
                            }
                            className="text-green-600 hover:bg-green-50"
                          />
                        ) : (
                          <ActionButton
                            icon="🔒"
                            title="Khóa tài khoản"
                            onClick={() => toggleUserStatus(user.name, "lock")}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                        {user.status === "locked" && (
                          <ActionButton
                            icon="🗑️"
                            title="Xóa"
                            onClick={() => deleteUser(user.name)}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sellers Table */}
            <table
              className={`w-full ${activeTab === "sellers" ? "" : "hidden"}`}
            >
              <thead className="border-y border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Người bán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Loại tài khoản
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Tên shop
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Doanh thu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Đánh giá
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {initialSellers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-orange-50/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${
                            user.avatarBg === "gradient-primary"
                              ? "gradient-primary"
                              : user.avatarBg
                          }`}
                        >
                          {user.avatarText}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserTypeBadge type={user.type} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        🏪 {user.shopName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDisplay status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.products} sản phẩm
                      </p>
                      <p className="text-xs text-green-600">
                        {user.productsChange}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.orders} đơn
                      </p>
                      <p className="text-xs text-gray-500">
                        Tháng này: {user.ordersThisMonth}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.revenue}
                      </p>
                      <p
                        className={`text-xs ${
                          user.revenueChange.startsWith("↑")
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user.revenueChange}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="mr-1 text-yellow-500">⭐</span>{" "}
                        <span className="font-semibold text-gray-800">
                          {user.rating}
                        </span>{" "}
                        <span className="ml-1 text-xs text-gray-500">
                          ({user.reviews.toLocaleString("vi-VN")})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-1 opacity-80 transition-opacity group-hover:opacity-100">
                        <ActionButton
                          icon="👁️"
                          title="Xem chi tiết"
                          onClick={() => viewUserDetail("seller", user.name)}
                          className="text-blue-600 hover:bg-blue-50"
                        />
                        <ActionButton
                          icon="🏪"
                          title="Xem shop"
                          onClick={() => viewShop(user.shopName)}
                          className="text-purple-600 hover:bg-purple-50"
                        />
                        {user.status === "pending" && (
                          <ActionButton
                            icon="✅"
                            title="Xác minh shop"
                            onClick={() => verifyUser(user.name)}
                            className="text-green-600 hover:bg-green-50"
                          />
                        )}
                        <ActionButton
                          icon="✏️"
                          title="Chỉnh sửa"
                          onClick={() => editUser("seller", user.name)}
                          className="text-orange-600 hover:bg-orange-50"
                        />
                        {user.status === "locked" ? (
                          <ActionButton
                            icon="🔓"
                            title="Mở khóa"
                            onClick={() =>
                              toggleUserStatus(user.name, "unlock")
                            }
                            className="text-green-600 hover:bg-green-50"
                          />
                        ) : (
                          <ActionButton
                            icon="🔒"
                            title="Khóa shop"
                            onClick={() => toggleUserStatus(user.name, "lock")}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                        {user.status === "locked" && (
                          <ActionButton
                            icon="🗑️"
                            title="Xóa vĩnh viễn"
                            onClick={() => deleteUser(user.name)}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* New Users Table (Reusing Buyers Layout) */}
            <table
              className={`w-full ${activeTab === "new_users" ? "" : "hidden"}`}
            >
              <thead className="border-y border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Người dùng mới
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Loại tài khoản
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Email / SĐT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Tổng đơn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Chi tiêu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {initialBuyers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-orange-50/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${
                            user.avatarBg === "gradient-primary"
                              ? "gradient-primary"
                              : user.avatarBg
                          }`}
                        >
                          {user.avatarText}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserTypeBadge type={user.type} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDisplay status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.orders} đơn
                      </p>
                      <p className="text-xs text-gray-500">
                        Tháng này: {user.ordersThisMonth}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {user.spending}
                      </p>
                      <p
                        className={`text-xs ${
                          user.spendingChange.startsWith("↑") ||
                          user.spendingChange.includes("+")
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user.spendingChange}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.joinDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-1 opacity-80 transition-opacity group-hover:opacity-100">
                        <ActionButton
                          icon="👁️"
                          title="Xem chi tiết"
                          onClick={() => viewUserDetail("buyer", user.name)}
                          className="text-blue-600 hover:bg-blue-50"
                        />
                        {user.status === "pending" && (
                          <ActionButton
                            icon="✅"
                            title="Xác minh"
                            onClick={() => verifyUser(user.name)}
                            className="text-green-600 hover:bg-green-50"
                          />
                        )}
                        <ActionButton
                          icon="✏️"
                          title="Chỉnh sửa"
                          onClick={() => editUser("buyer", user.name)}
                          className="text-orange-600 hover:bg-orange-50"
                        />
                        {user.status === "locked" ? (
                          <ActionButton
                            icon="🔓"
                            title="Mở khóa"
                            onClick={() =>
                              toggleUserStatus(user.name, "unlock")
                            }
                            className="text-green-600 hover:bg-green-50"
                          />
                        ) : (
                          <ActionButton
                            icon="🔒"
                            title="Khóa tài khoản"
                            onClick={() => toggleUserStatus(user.name, "lock")}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                        {user.status === "locked" && (
                          <ActionButton
                            icon="🗑️"
                            title="Xóa"
                            onClick={() => deleteUser(user.name)}
                            className="text-red-600 hover:bg-red-50"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 bg-gray-50/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị{" "}
                <span className="font-semibold text-gray-800">1-10</span> trong
                tổng số{" "}
                <span className="font-semibold text-gray-800">18,342</span> kết
                quả
              </p>
              <div className="flex items-center space-x-2">
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50">
                  ← Trước
                </button>
                <button className="gradient-primary rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm">
                  1
                </button>
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800">
                  2
                </button>
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800">
                  3
                </button>
                <span className="px-2 text-gray-400">...</span>
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800">
                  184
                </button>
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800">
                  Sau →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Container */}
      <div className="pointer-events-none fixed top-24 right-6 z-50 flex flex-col items-end">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              removeToast={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal modal={modal} closeModal={closeModal} />
    </div>
  );
};

// --- App Layout Component (Sidebar + Header + Children) ---
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{styles}</style>

      {/* Sidebar - fixed */}
      <aside className="sidebar-scroll fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col overflow-hidden border-r border-gray-200 bg-white">
        <div className={`${CUSTOM_CLASSES.gradientOrange} p-6`}>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl">
              🛍️
            </div>
            <div>
              <h1 id="dashboard-title" className="text-xl font-bold text-white">
                Admin
              </h1>
              <p className="text-sm text-orange-100">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item, index) => (
            <NavItem key={index} {...item} />
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
      <main className="ml-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="welcome-message"
                className="text-2xl font-bold text-gray-800"
              >
                Chào mừng trở lại, Admin
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Tổng quan hệ thống ngày 21/11/2025
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative rounded-lg p-2.5 text-gray-600 transition hover:bg-gray-100">
                <span className="text-xl">🔔</span>
                <span className={CUSTOM_CLASSES.notificationDot}></span>
              </button>
              <button
                className={`px-5 py-2.5 ${CUSTOM_CLASSES.gradientOrange} rounded-lg text-sm font-medium text-white shadow-md transition hover:opacity-90`}
              >
                Xuất báo cáo
              </button>
            </div>
          </div>
        </header>

        {/* Content Children */}
        <div className="min-h-[calc(100vh-80px)]">
          <UserManagementContent />
        </div>
      </main>
    </div>
  );
};

export default App;
