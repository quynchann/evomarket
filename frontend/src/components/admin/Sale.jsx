import React, { useState } from "react";

// --- MOCK DATA ---
const NAV_ITEMS = [
  { icon: "📊", label: "Tổng quan", active: false },
  { icon: "🛒", label: "Quản lý đơn hàng" },
  { icon: "📦", label: "Quản lý sản phẩm" },
  { icon: "👥", label: "Quản lý người dùng" },
  { icon: "👓", label: "Try-On Analytics" },
  { icon: "💰", label: "Quản lý thanh toán" },
  { icon: "🔔", label: "Thông báo", badge: 12 },
  { icon: "⭐", label: "Quản lý đánh giá" },
  { icon: "🎁", label: "Chương trình khuyến mãi", active: true },
  { icon: "📈", label: "Báo cáo & Phân tích" },
  { icon: "⚙️", label: "Cài đặt hệ thống" },
];

const PROMOTIONS_DATA = [
  // SYSTEM CAMPAIGNS (Sàn tạo)
  {
    id: "SYS-1212",
    creator: "System",
    shopName: "Sàn TMĐT (Admin)",
    name: "Siêu Sale 12.12 - Chốt Năm Cực Đỉnh",
    code: "SIEUSALE1212",
    type: "percent",
    value: 50,
    startDate: "2025-12-12",
    endDate: "2025-12-14",
    status: "Scheduled",
    riskLevel: "safe",
    used: 0,
    revenue: 0,
  },
  {
    id: "SYS-TET26",
    creator: "System",
    shopName: "Sàn TMĐT (Admin)",
    name: "Lì Xì Đầu Năm - Tết 2026",
    code: "LIXI_TET",
    type: "fixed",
    value: 68000,
    startDate: "2026-01-15",
    endDate: "2026-01-30",
    status: "Scheduled",
    riskLevel: "safe",
    used: 0,
    revenue: 0,
  },
  {
    id: "SYS-FREESHIP",
    creator: "System",
    shopName: "Sàn TMĐT (Admin)",
    name: "Freeship Xtra - Tháng 12",
    code: "FS_DEC",
    type: "fixed",
    value: 30000,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    status: "Active",
    riskLevel: "safe",
    used: 45200,
    revenue: 0,
  },

  // SELLER CAMPAIGNS (Giám sát)
  {
    id: "SEL-XMAS",
    creator: "Seller",
    shopName: "TechZone Official",
    name: "Giáng Sinh Công Nghệ - Deal Ấm Áp",
    code: "XMAS_TECH",
    type: "percent",
    value: 15,
    startDate: "2025-12-05",
    endDate: "2025-12-25",
    status: "Active",
    riskLevel: "safe",
    used: 342,
    revenue: 850000000,
  },
  {
    id: "SEL-DONKHO",
    creator: "Seller",
    shopName: "Phụ Kiện Mùa Đông AB",
    name: "Dọn Kho Đón Tết - Xả Hết 90%",
    code: "XA_KHO_90",
    type: "percent",
    value: 90,
    startDate: "2025-12-08",
    endDate: "2025-12-10",
    status: "Flagged", // Cảnh báo
    riskLevel: "high",
    violationReason: "Giảm > 70% & Nghi vấn nâng giá ảo",
    used: 12,
    revenue: 1500000,
  },
  {
    id: "SEL-BLACKFRIDAY",
    creator: "Seller",
    shopName: "Mũ Kính Accessories",
    name: "Black Friday - Săn Sale Sập Sàn",
    code: "BF_SALE",
    type: "percent",
    value: 40,
    startDate: "2025-11-25",
    endDate: "2025-11-30",
    status: "Ended",
    riskLevel: "safe",
    used: 1540,
    revenue: 3200000000,
  },
  {
    id: "SEL-FAKE01",
    creator: "Seller",
    shopName: "Kính Hàng Chợ XYZ",
    name: "Kính Ray giả nhái — giá 99k",
    code: "KINH_FAKE",
    type: "fixed",
    value: 99000,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    status: "Locked",
    riskLevel: "high",
    violationReason: "Hàng giả/nhái thương hiệu",
    used: 0,
    revenue: 0,
  },
];

const CUSTOM_CLASSES = {
  gradientOrange: "bg-gradient-to-br from-orange-600 to-orange-400",
  notificationDot:
    "w-2 h-2 bg-red-500 rounded-full ring-2 ring-white absolute top-1.5 right-1.5",
};

// --- COMPONENTS ---

const NavItem = ({ icon, label, active, badge }) => {
  const baseClasses = `flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition duration-200 ease-in-out border-l-4 border-transparent`;
  const hoverClasses = `hover:bg-orange-50 hover:border-orange-500`;
  const activeClasses = active
    ? `bg-orange-100/50 border-orange-600 font-semibold`
    : "";

  return (
    <a href="#" className={`${baseClasses} ${hoverClasses} ${activeClasses}`}>
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

const StatusBadge = ({ status, riskLevel, reason }) => {
  const styles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    Flagged: "bg-red-50 text-red-700 border-red-200 animate-pulse",
    Locked: "bg-gray-800 text-white border-gray-600",
    Ended: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const labels = {
    Active: "Đang chạy",
    Scheduled: "Sắp diễn ra",
    Flagged: "Cảnh báo vi phạm",
    Locked: "Đã khoá",
    Ended: "Kết thúc",
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Ended}`}
      >
        <span
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-green-500" : status === "Scheduled" ? "bg-blue-500" : status === "Flagged" ? "bg-red-500" : "bg-gray-400"}`}
        ></span>
        {labels[status] || status}
      </span>
      {riskLevel === "high" && reason && (
        <span className="flex items-center text-[10px] font-bold text-red-600">
          ⚠️ {reason}
        </span>
      )}
    </div>
  );
};

// --- MODAL COMPONENT (CREATE & EDIT) ---
const CreatePromotionModal = ({ onClose, initialData }) => {
  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-bounce-in w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit
              ? "Cập nhật chương trình khuyến mãi"
              : "Tạo chương trình khuyến mãi mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {isEdit && (
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 italic">
              Đang chỉnh sửa ID:{" "}
              <span className="font-mono">{initialData.id}</span>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên chương trình
            </label>
            <input
              type="text"
              defaultValue={initialData?.name}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="VD: Siêu Sale 12.12"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mã Code
              </label>
              <input
                type="text"
                defaultValue={initialData?.code}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                placeholder="VD: SALE1212"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Loại giảm giá
              </label>
              <select
                defaultValue={initialData?.type || "percent"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="percent">Theo %</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mức giảm
            </label>
            <input
              type="number"
              defaultValue={initialData?.value}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="VD: 50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                defaultValue={initialData?.startDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày kết thúc
              </label>
              <input
                type="date"
                defaultValue={initialData?.endDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50 p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
          >
            {isEdit ? "Lưu thay đổi" : "Tạo chương trình"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR TABS ---

// 1. SYSTEM PROMOTIONS VIEW (UPDATED WITH MODAL)
const SystemPromotionsView = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const handleCreate = () => {
    setSelectedPromo(null);
    setShowModal(true);
  };

  const handleEdit = (promo) => {
    setSelectedPromo(promo);
    setShowModal(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="font-bold text-gray-800">
            Danh sách Khuyến mãi Toàn sàn (Admin tạo)
          </h3>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-700"
          >
            + Tạo mới
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-xs font-semibold text-gray-500 uppercase">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4">Tên Chương Trình</th>
              <th className="px-6 py-4">Mức Giảm</th>
              <th className="px-6 py-4">Hiệu quả (Doanh thu)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data
              .filter((p) => p.creator === "System")
              .map((promo) => (
                <tr key={promo.id} className="hover:bg-orange-50/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{promo.name}</p>
                    <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                      {promo.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-orange-600">
                      {promo.type === "percent"
                        ? `${promo.value}%`
                        : `${promo.value / 1000}k`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(promo.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {promo.used.toLocaleString()} lượt dùng
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={promo.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="mr-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Sửa
                    </button>
                    <button className="text-sm font-medium text-red-600 hover:text-red-800">
                      Dừng
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreatePromotionModal
          onClose={() => setShowModal(false)}
          initialData={selectedPromo}
        />
      )}
    </>
  );
};

// 2. SELLER MONITORING VIEW
const SellerMonitoringView = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <span className="text-2xl">🕵️‍♂️</span>
        <div>
          <h4 className="font-bold text-yellow-800">Cơ chế Giám sát Tự động</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Hệ thống tự động quét các khuyến mãi của Seller. Admin không cần
            duyệt từng mã, nhưng hãy chú ý các mã có cờ báo{" "}
            <span className="font-bold text-red-600">Vi phạm</span> hoặc{" "}
            <span className="font-bold text-orange-600">Rủi ro cao</span>.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="font-bold text-gray-800">
            Giám sát Khuyến mãi Seller
          </h3>
          <div className="flex gap-2">
            <select className="rounded-lg border-gray-300 text-sm shadow-sm">
              <option>Tất cả trạng thái</option>
              <option>⚠️ Chỉ xem Vi phạm</option>
            </select>
            <input
              type="text"
              placeholder="Tìm Shop / Mã..."
              className="rounded-lg border-gray-300 px-3 py-1 text-sm shadow-sm"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-xs font-semibold text-gray-500 uppercase">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4">Seller / Shop</th>
              <th className="px-6 py-4">Chi tiết Khuyến mãi</th>
              <th className="px-6 py-4">Độ sâu giảm giá</th>
              <th className="px-6 py-4">Cảnh báo / Trạng thái</th>
              <th className="px-6 py-4 text-right">Xử lý (Admin)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data
              .filter((p) => p.creator === "Seller")
              .map((promo) => (
                <tr
                  key={promo.id}
                  className={`hover:bg-gray-50 ${promo.riskLevel === "high" ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{promo.shopName}</p>
                    <p className="text-xs text-gray-500">ID: {promo.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{promo.name}</p>
                    <span className="rounded bg-gray-100 px-1 font-mono text-xs text-gray-500">
                      {promo.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${promo.value > 50 ? "text-lg text-red-600" : "text-green-600"}`}
                      >
                        -{promo.value}%
                      </span>
                      {promo.value > 70 && (
                        <span className="rounded border border-red-200 bg-red-100 px-1 text-[10px] text-red-700">
                          Bất thường
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={promo.status}
                      riskLevel={promo.riskLevel}
                      reason={promo.violationReason}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {promo.status !== "Locked" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          title="Cảnh báo Seller"
                        >
                          ⚠️ Nhắc nhở
                        </button>
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white shadow-sm hover:bg-red-700"
                          title="Khoá chương trình ngay lập tức"
                        >
                          🔒 Khoá
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        Đã xử lý
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. RULES CONFIGURATION
const RulesConfigurationView = () => {
  return (
    <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* General Rules */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-bold text-gray-800">
          <span>⚖️</span> Quy định Khuyến mãi Seller
        </h3>
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mức giảm giá tối đa (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={70}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-500">
                % (Quá mức này sẽ bị Flag)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Chặn Sale ảo (Anti-Fake Price)
              </p>
              <p className="w-64 text-xs text-gray-500">
                Không cho phép tạo KM nếu giá gốc bị nâng lên trong 7 ngày qua.
              </p>
            </div>
            <div className="relative mr-2 inline-block w-12 align-middle transition duration-200 ease-in select-none">
              <input
                type="checkbox"
                name="toggle"
                id="toggle1"
                className="toggle-checkbox absolute block h-6 w-6 translate-x-6 cursor-pointer appearance-none rounded-full border-4 border-green-400 bg-white"
              />
              <label
                htmlFor="toggle1"
                className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-green-400"
              ></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Yêu cầu tồn kho tối thiểu
              </p>
              <p className="text-xs text-gray-500">
                Sản phẩm phải có ít nhất X tồn kho mới được chạy Flash Sale.
              </p>
            </div>
            <input
              type="number"
              defaultValue={10}
              className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
            />
          </div>
        </div>
      </div>

      {/* Restricted Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-bold text-gray-800">
          <span>🚫</span> Hạn chế & Cấm
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Các danh mục sau không được phép tham gia chương trình Flash Sale tự
            động:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              Hàng 18+ <button className="hover:text-red-900">×</button>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              Voucher Tiền mặt <button className="hover:text-red-900">×</button>
            </span>
            <button className="rounded-full border border-dashed border-gray-400 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50">
              + Thêm danh mục
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Thông báo tự động khi vi phạm
            </label>
            <textarea
              className="h-24 w-full rounded-lg border border-gray-300 p-3 text-xs text-gray-600"
              defaultValue="Cảnh báo: Chương trình khuyến mãi [Code] của bạn vi phạm quy định về giá ảo. Vui lòng điều chỉnh hoặc chương trình sẽ bị huỷ sau 24h."
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end md:col-span-2">
        <button className="rounded-lg bg-orange-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-orange-700">
          Lưu cấu hình hệ thống
        </button>
      </div>
    </div>
  );
};

// --- MAIN CONTENT CONTROLLER (DEFINED TO FIX REFERENCE ERROR) ---
const PromotionManagementContent = () => {
  const [activeTab, setActiveTab] = useState("system"); // 'system', 'monitoring', 'rules'

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Khuyến mãi & Giám sát
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin tạo System Promo và đặt luật chơi cho Seller. Không duyệt thủ
            công từng mã.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("system")}
          className={`border-b-2 px-2 pb-3 text-sm font-medium transition-colors ${activeTab === "system" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          🏛️ Chương trình của Sàn (System)
        </button>
        <button
          onClick={() => setActiveTab("monitoring")}
          className={`border-b-2 px-2 pb-3 text-sm font-medium transition-colors ${activeTab === "monitoring" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          🕵️‍♂️ Giám sát Seller (Monitoring)
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`border-b-2 px-2 pb-3 text-sm font-medium transition-colors ${activeTab === "rules" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          ⚙️ Thiết lập Luật (Rules)
        </button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
              Doanh thu qua Khuyến mãi
            </p>
            <h3 className="mt-1 text-2xl font-bold text-gray-800">
              7.8 Tỷ VNĐ
            </h3>
            <p className="mt-1 text-xs text-green-600">
              Sàn: 5.2 Tỷ • Seller: 2.6 Tỷ
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
            💰
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
              Chiến dịch Seller đang chạy
            </p>
            <h3 className="mt-1 text-2xl font-bold text-gray-800">1,240</h3>
            <p className="mt-1 text-xs text-gray-500">Trên 450 Shop tham gia</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl text-purple-600">
            🛍️
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
              Cảnh báo Vi phạm
            </p>
            <h3 className="mt-1 text-2xl font-bold text-red-600">15 Vụ việc</h3>
            <p className="mt-1 text-xs text-red-500">
              Cần xử lý: Sale ảo, Hàng cấm
            </p>
          </div>
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-red-50 text-2xl text-red-600">
            🚨
          </div>
        </div>
      </div>

      {/* Dynamic Content Body */}
      <div>
        {activeTab === "system" && (
          <SystemPromotionsView data={PROMOTIONS_DATA} />
        )}
        {activeTab === "monitoring" && (
          <SellerMonitoringView data={PROMOTIONS_DATA} />
        )}
        {activeTab === "rules" && <RulesConfigurationView />}
      </div>
    </div>
  );
};

// --- LAYOUT WRAPPER ---
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <aside className="fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white shadow-xl">
        {/* Adjusted height to h-20 to match the header */}
        <div
          className={`${CUSTOM_CLASSES.gradientOrange} flex h-20 items-center px-6`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl shadow-sm">
              🛍️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Admin Center
              </h1>
              <p className="text-xs font-medium text-orange-100 opacity-90">
                Super Admin
              </p>
            </div>
          </div>
        </div>
        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item, index) => (
            <NavItem key={index} {...item} />
          ))}
        </nav>
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex cursor-pointer items-center space-x-3 rounded-lg px-3 py-2 transition hover:bg-gray-100">
            <div
              className={`h-9 w-9 ${CUSTOM_CLASSES.gradientOrange} flex items-center justify-center rounded-full font-bold text-white shadow-sm`}
            >
              A
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Administrator</p>
              <p className="text-xs text-gray-500">System Manager • Online</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64">
        {/* Adjusted height to h-20 and removed search bar */}
        <header className="sticky top-0 z-10 flex h-20 items-center border-b border-gray-200 bg-white/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Trung tâm Quản lý
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Thứ Hai, 21/11/2025 • Quyền Admin cao cấp
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search bar removed */}

              <button className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-orange-600">
                <span className="text-xl">🔔</span>
                <span className={CUSTOM_CLASSES.notificationDot}></span>
              </button>
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-80px)] overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AdminLayout>
      <PromotionManagementContent />
    </AdminLayout>
  );
};

export default App;
