import React, { useState, useMemo } from "react";

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

  /* Review Status Badges */
  .badge-pending { background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
  .badge-published { background-color: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
  .badge-hidden { background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }
  .badge-violation { background-color: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
  .badge-reported { background-color: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }
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

// --- MOCK DATA FOR REVIEWS ---
const MOCK_REVIEWS = [
  {
    id: "RV-1023",
    productName: "Kính râm phân cực Polarized",
    productImg: "🕶️",
    userName: "Nguyễn Văn A",
    userAvatar: "👨",
    userEmail: "vana@gmail.com",
    rating: 5,
    content:
      "Kính đẹp, tròng rõ, giao hàng nhanh. Sẽ ủng hộ shop dài dài.",
    media: ["image"],
    status: "published",
    createdAt: "2023-10-25 14:30",
    history: [
      { action: "Auto-approved", user: "System", time: "2023-10-25 14:31" },
    ],
    reports: [],
  },
  {
    id: "RV-1024",
    productName: "Vòng cổ dây chuyền mảnh",
    productImg: "📿",
    userName: "Trần Thị B",
    userAvatar: "👩",
    userEmail: "bibi@yahoo.com",
    rating: 1,
    content:
      "Hàng không giống hình, yêu cầu hoàn tiền ngay lập tức! Shop lừa đảo.",
    media: [],
    status: "reported",
    createdAt: "2023-10-24 09:15",
    history: [],
    reports: [
      { reason: "Ngôn từ xúc phạm", time: "2023-10-24 10:00" },
      { reason: "Spam", time: "2023-10-24 11:30" },
    ],
  },
  {
    id: "RV-1025",
    productName: "Hoa tai khuyên bạc 925",
    productImg: "✨",
    userName: "Lê Hoàng C",
    userAvatar: "🧑",
    userEmail: "hoangcdev@gmail.com",
    rating: 4,
    content:
      "Xinh nhưng hộp hơi móp. Hy vọng shop đóng gói kỹ hơn lần sau.",
    media: ["image", "video"],
    status: "pending",
    createdAt: "2023-10-26 08:00",
    history: [],
    reports: [],
  },
  {
    id: "RV-1026",
    productName: "Mũ Lưỡi Trai Basic",
    productImg: "🧢",
    userName: "Phạm Nhật D",
    userAvatar: "👱",
    userEmail: "dpham@outlook.com",
    rating: 3,
    content: "Tạm ổn trong tầm giá.",
    media: [],
    status: "published",
    createdAt: "2023-10-20 16:45",
    history: [
      { action: "Approved", user: "Admin01", time: "2023-10-21 08:00" },
    ],
    reports: [],
  },
  {
    id: "RV-1027",
    productName: "Kính gọng chống ánh sáng xanh",
    productImg: "👓",
    userName: "Spam Bot 1",
    userAvatar: "🤖",
    userEmail: "bot123@xyz.com",
    rating: 5,
    content: "Click link này để nhận 1 tỷ đồng: http://spam-link.com",
    media: [],
    status: "violation",
    createdAt: "2023-10-26 10:00",
    history: [
      {
        action: "Marked Violation",
        user: "AutoFilter",
        time: "2023-10-26 10:01",
      },
    ],
    reports: [],
  },
];

// --- HELPER FUNCTIONS ---
const renderStars = (count) => {
  return (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < count ? "★" : <span className="text-gray-300">★</span>}
        </span>
      ))}
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return (
        <span className="badge-pending rounded px-2 py-1 text-xs font-bold">
          Chờ duyệt
        </span>
      );
    case "published":
      return (
        <span className="badge-published rounded px-2 py-1 text-xs font-bold">
          Đã hiển thị
        </span>
      );
    case "hidden":
      return (
        <span className="badge-hidden rounded px-2 py-1 text-xs font-bold">
          Đã ẩn
        </span>
      );
    case "violation":
      return (
        <span className="badge-violation rounded px-2 py-1 text-xs font-bold">
          Vi phạm
        </span>
      );
    case "reported":
      return (
        <span className="badge-reported rounded px-2 py-1 text-xs font-bold">
          Bị báo cáo
        </span>
      );
    default:
      return null;
  }
};

// --- SUB-COMPONENT: REVIEW DETAIL MODAL ---
const ReviewDetailModal = ({ review, onClose, onUpdateStatus }) => {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-slide-in flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Chi tiết đánh giá #{review.id}
            </h3>
            <p className="text-sm text-gray-500">Tạo lúc: {review.createdAt}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-3">
          {/* Left Column: Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Rating & Content */}
            <div>
              <div className="mb-3 flex items-center space-x-2">
                {renderStars(review.rating)}
                <span className="text-sm font-semibold text-gray-700">
                  ({review.rating}/5)
                </span>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-lg leading-relaxed text-gray-800">
                  {review.content}
                </p>
              </div>
            </div>

            {/* Media */}
            {review.media && review.media.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-gray-700">
                  Hình ảnh / Video đính kèm
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {review.media.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex h-24 w-24 items-center justify-center rounded-lg border border-gray-300 bg-gray-200 text-2xl"
                    >
                      {m === "image" ? "🖼️" : "🎥"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Note */}
            <div>
              <h4 className="mb-2 font-semibold text-gray-700">
                Ghi chú nội bộ (Admin Note)
              </h4>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập ghi chú xử lý..."
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Right Column: Meta Info */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-xs font-bold text-gray-400 uppercase">
                Sản phẩm
              </h4>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xl">
                  {review.productImg}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {review.productName}
                  </p>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    Xem sản phẩm
                  </a>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-xs font-bold text-gray-400 uppercase">
                Người đánh giá
              </h4>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xl">
                  {review.userAvatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {review.userName}
                  </p>
                  <p className="text-xs text-gray-500">{review.userEmail}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Đã mua: 12 đơn hàng <br />
                Tỉ lệ đánh giá tích cực: 98%
              </div>
            </div>

            {/* Reports Info (If any) */}
            {review.reports.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <h4 className="mb-2 text-xs font-bold text-red-600 uppercase">
                  ⚠️ Báo cáo vi phạm
                </h4>
                <ul className="space-y-2">
                  {review.reports.map((r, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-xs text-red-800"
                    >
                      <span>- {r.reason}</span>
                      <span className="opacity-70">{r.time.split(" ")[1]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Current Status */}
            <div>
              <h4 className="mb-2 text-xs font-bold text-gray-400 uppercase">
                Trạng thái hiện tại
              </h4>
              {getStatusBadge(review.status)}
            </div>
          </div>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6">
          <div className="text-xs text-gray-500 italic">
            Cập nhật lần cuối: Hôm nay, 10:30 AM bởi Admin
          </div>
          <div className="flex space-x-3">
            {review.status !== "violation" && (
              <button
                onClick={() => {
                  onUpdateStatus(review.id, "violation");
                  onClose();
                }}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Đánh dấu Vi phạm
              </button>
            )}
            {review.status !== "hidden" && (
              <button
                onClick={() => {
                  onUpdateStatus(review.id, "hidden");
                  onClose();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Ẩn đánh giá
              </button>
            )}
            {(review.status === "pending" ||
              review.status === "hidden" ||
              review.status === "reported") && (
              <button
                onClick={() => {
                  onUpdateStatus(review.id, "published");
                  onClose();
                }}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-green-700"
              >
                ✅ Duyệt / Hiển thị
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: REVIEW MANAGEMENT PAGE ---
const ReviewManagementPage = () => {
  // State
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Filter Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchSearch =
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRating =
        filterRating === "all" || review.rating === parseInt(filterRating);
      const matchStatus =
        filterStatus === "all" || review.status === filterStatus;

      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, searchTerm, filterRating, filterStatus]);

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredReviews.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (actionType) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn thực hiện hành động này với ${selectedIds.length} đánh giá?`,
      )
    ) {
      const newStatus =
        actionType === "approve"
          ? "published"
          : actionType === "hide"
            ? "hidden"
            : "violation";

      setReviews((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id) ? { ...r, status: newStatus } : r,
        ),
      );
      setSelectedIds([]);
      alert("Cập nhật thành công!");
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    alert(`Đã cập nhật trạng thái đánh giá thành: ${newStatus}`);
  };

  const openDetail = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col p-8">
      {/* 1. Top Action Bar */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h2>
          <p className="mt-1 text-sm text-gray-500">
            Đang hiển thị{" "}
            <span className="font-bold text-orange-600">
              {filteredReviews.length}
            </span>{" "}
            / {reviews.length} đánh giá
          </p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="mb-6 grid grid-cols-1 items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="mb-1 block text-xs font-bold text-gray-500">
            TÌM KIẾM
          </label>
          <div className="relative">
            <span className="absolute top-2.5 left-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo nội dung, tên, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-9 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-bold text-gray-500">
            TRẠNG THÁI
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="published">✅ Đã hiển thị</option>
            <option value="hidden">🚫 Bị ẩn</option>
            <option value="violation">⚠️ Vi phạm</option>
            <option value="reported">🚩 Bị báo cáo</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-gray-500">
            SỐ SAO
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="all">Tất cả sao</option>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>
        </div>

        {/* Date Filter (Mock) */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-bold text-gray-500">
            THỜI GIAN
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 outline-none"
          />
        </div>
      </div>

      {/* 5. Bulk Actions (Conditional Render) */}
      {selectedIds.length > 0 && (
        <div className="animate-slide-in mb-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-orange-800">
              Đánh giá được chọn
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction("approve")}
              className="rounded border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              ✅ Duyệt
            </button>
            <button
              onClick={() => handleBulkAction("hide")}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-100"
            >
              🚫 Ẩn
            </button>
            <button
              onClick={() => handleBulkAction("violation")}
              className="rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              ⚠️ Báo xấu
            </button>
            <button className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700">
              🗑️ Xóa
            </button>
          </div>
        </div>
      )}

      {/* 3. Review Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="w-12 border-b border-gray-200 p-4">
                  <input
                    type="checkbox"
                    className="cursor-pointer rounded text-orange-600 focus:ring-orange-500"
                    checked={
                      selectedIds.length === filteredReviews.length &&
                      filteredReviews.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-1/4 border-b border-gray-200 p-4">
                  Đánh giá / Người dùng
                </th>
                <th className="w-1/3 border-b border-gray-200 p-4">Nội dung</th>
                <th className="border-b border-gray-200 p-4">Sản phẩm</th>
                <th className="border-b border-gray-200 p-4 text-center">
                  Media
                </th>
                <th className="border-b border-gray-200 p-4 text-center">
                  Trạng thái
                </th>
                <th className="border-b border-gray-200 p-4 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className={`transition hover:bg-gray-50 ${selectedIds.includes(review.id) ? "bg-orange-50/30" : ""}`}
                  >
                    <td className="p-4 align-top">
                      <input
                        type="checkbox"
                        className="cursor-pointer rounded text-orange-600 focus:ring-orange-500"
                        checked={selectedIds.includes(review.id)}
                        onChange={() => handleSelectOne(review.id)}
                      />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm">
                          {review.userAvatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {review.userName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {review.userEmail}
                          </div>
                          <div className="mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="mb-1 line-clamp-2 text-gray-700">
                        {review.content}
                      </p>
                      <span className="text-xs text-gray-400">
                        {review.createdAt}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{review.productImg}</span>
                        <span
                          className="line-clamp-1 max-w-[120px] text-xs font-medium text-blue-600"
                          title={review.productName}
                        >
                          {review.productName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center align-top">
                      <div className="flex justify-center space-x-1">
                        {review.media.includes("image") && (
                          <span title="Có hình ảnh">🖼️</span>
                        )}
                        {review.media.includes("video") && (
                          <span title="Có video">🎥</span>
                        )}
                        {review.media.length === 0 && (
                          <span className="text-gray-300">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center align-top">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openDetail(review)}
                          className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>

                        {review.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(review.id, "published")
                            }
                            className="rounded p-1.5 text-green-600 transition hover:bg-green-50"
                            title="Duyệt nhanh"
                          >
                            ✅
                          </button>
                        )}

                        <div className="group relative">
                          <button
                            className="rounded p-1.5 text-gray-400 hover:text-gray-600"
                            title="Thêm"
                          >
                            ⋮
                          </button>
                          {/* Simple Dropdown for Demo */}
                          <div className="absolute right-0 z-20 mt-1 hidden w-32 rounded border border-gray-200 bg-white shadow-lg group-hover:block">
                            <button
                              onClick={() =>
                                handleUpdateStatus(review.id, "hidden")
                              }
                              className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-100"
                            >
                              Ẩn đánh giá
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(review.id, "violation")
                              }
                              className="block w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                            >
                              Báo vi phạm
                            </button>
                            <button className="block w-full px-4 py-2 text-left text-xs text-gray-500 hover:bg-gray-100">
                              Ghi chú
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-500">
                    <div className="mb-3 text-4xl">📭</div>
                    Không tìm thấy đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white p-4">
          <span className="text-xs text-gray-500">
            Hiển thị 1 - {filteredReviews.length} trên tổng số{" "}
            {filteredReviews.length} dòng
          </span>
          <div className="flex space-x-1">
            <button
              className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Trước
            </button>
            <button className="rounded bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              1
            </button>
            <button className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">
              2
            </button>
            <button className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">
              3
            </button>
            <button className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal Integration */}
      {isModalOpen && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // Thay đổi default view thành 'reviews' để hiển thị ngay kết quả
  const [currentView, setCurrentView] = useState("reviews");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <style>{styles}</style>

      {/* Sidebar - fixed */}
      <aside className="custom-scroll fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white">
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
        <header className="sticky top-0 z-10 flex h-24 items-center border-b border-gray-200 bg-white/95 px-8 shadow-sm backdrop-blur-sm">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentView === "notifications"
                  ? "Trung tâm Thông báo"
                  : currentView === "reviews"
                    ? "Trung tâm Đánh giá"
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
          {currentView === "reviews" ? (
            <ReviewManagementPage />
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
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setCurrentView("reviews")}
                  className="font-semibold text-orange-600 hover:underline"
                >
                  Xem Demo Quản lý Đánh giá
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
