import React, { useState } from "react";

// --- MOCK DATA ---
const NAV_ITEMS = [
  { icon: "📊", label: "Tổng quan", active: false },
  { icon: "🛒", label: "Quản lý đơn hàng" },
  { icon: "📦", label: "Quản lý sản phẩm", active: true },
  { icon: "👥", label: "Quản lý người dùng" },
  { icon: "👓", label: "Try-On Analytics" },
  { icon: "💰", label: "Quản lý thanh toán" },
  { icon: "🔔", label: "Thông báo", badge: 12 },
  { icon: "⭐", label: "Quản lý đánh giá" },
  { icon: "🎁", label: "Chương trình khuyến mãi" },
  { icon: "📈", label: "Báo cáo & Phân tích" },
  { icon: "⚙️", label: "Cài đặt hệ thống" },
];

// Dữ liệu mở rộng thêm Seller và trạng thái kiểm duyệt
const PRODUCTS_DATA = [
  {
    id: "#SP001",
    name: "Kính râm phân cực Classic",
    seller: "Optical Store VN",
    category: "Kính",
    brand: "Local Brand",
    price: 350000,
    stock: 124,
    sales: 12,
    rating: 4.8,
    status: "Active",
    reports: 0,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "#SP008",
    name: "Kính gọng mảnh chống ánh sáng xanh",
    seller: "Newbie Seller 123",
    category: "Kính",
    brand: "No Brand",
    price: 250000,
    stock: 50,
    sales: 0,
    rating: 0,
    status: "Pending",
    reports: 0,
    image:
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "#SP002",
    name: "Mũ lưỡi trai unisex",
    seller: "Hat Corner VN",
    category: "Mũ",
    brand: "Urban Cap",
    price: 150000,
    stock: 5,
    sales: 45,
    rating: 4.9,
    status: "Low Stock",
    reports: 0,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "#SP009",
    name: "Vòng cổ charm không rõ nguồn gốc",
    seller: "Bad Shop 99",
    category: "Vòng cổ",
    brand: "Unknown",
    price: 200000,
    stock: 100,
    sales: 2,
    rating: 1.5,
    status: "Reported",
    reports: 15,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5da4fb8?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "#SP003",
    name: "Mũ bucket vải denim",
    seller: "Bucket Studio",
    category: "Mũ",
    brand: "Street Hat",
    price: 520000,
    stock: 0,
    sales: 120,
    rating: 4.5,
    status: "Out of Stock",
    reports: 0,
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "#SP005",
    name: "Hoa tai dài đính đá CZ",
    seller: "Jewel Saigon",
    category: "Hoa tai",
    brand: "Silver Line",
    price: 380000,
    stock: 32,
    sales: 15,
    rating: 0,
    status: "Pending",
    reports: 0,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=100&h=100",
  },
];

const SYSTEM_CATEGORIES = [
  { id: 1, name: "Mũ", count: 420 },
  { id: 2, name: "Kính", count: 890 },
  { id: 3, name: "Hoa tai", count: 310 },
  { id: 4, name: "Vòng cổ", count: 265 },
];

const SYSTEM_BRANDS = [
  { id: 1, name: "Urban Cap", country: "Việt Nam" },
  { id: 2, name: "Optical Store VN", country: "Việt Nam" },
  { id: 3, name: "Jewel Saigon", country: "Việt Nam" },
  { id: 4, name: "Silver Line", country: "Việt Nam" },
];

const CUSTOM_CLASSES = {
  gradientOrange: "bg-gradient-to-br from-orange-600 to-orange-400",
  cardShadow: "shadow-md shadow-gray-200/50",
  hoverLift:
    "transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",
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

// Status Badge - Cập nhật thêm status mới
const StatusBadge = ({ status, reports }) => {
  const styles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-blue-100 text-blue-700 border-blue-200", // Chờ duyệt
    "Low Stock": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Out of Stock": "bg-gray-100 text-gray-600 border-gray-200",
    Reported: "bg-red-100 text-red-700 border-red-200", // Vi phạm
    Locked: "bg-gray-800 text-white border-gray-600", // Đã khóa
  };

  const labels = {
    Active: "Đang hiển thị",
    Pending: "Chờ duyệt",
    "Low Stock": "Sắp hết",
    "Out of Stock": "Hết hàng",
    Reported: "Bị báo cáo",
    Locked: "Đã khóa",
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          styles[status] || styles.Pending
        }`}
      >
        <span
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-green-500" : status === "Reported" ? "bg-red-500" : status === "Pending" ? "bg-blue-500" : "bg-gray-500"}`}
        ></span>
        {labels[status] || status}
      </span>
      {reports > 0 && (
        <span className="flex items-center text-[10px] font-bold text-red-600">
          ⚠️ {reports} khiếu nại
        </span>
      )}
    </div>
  );
};

// --- SYSTEM ATTRIBUTE MANAGER (Requirement 3) ---
const SystemAttributeManager = ({ onBack }) => {
  return (
    <div className="animate-fade-in p-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          ⬅️ Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Thuộc tính Hệ thống
          </h1>
          <p className="text-sm text-gray-500">
            Admin tạo Category, Brand, Size chuẩn để Seller sử dụng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Categories Management */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              📁 Danh mục Sản phẩm (Categories)
            </h3>
            <button className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200">
              + Thêm mới
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Tên Danh mục</th>
                  <th className="px-4 py-3 text-center">Số SP</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SYSTEM_CATEGORIES.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-center">{cat.count}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="mr-2 text-blue-600 hover:underline">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:underline">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brands Management */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              🏷️ Thương hiệu Chính hãng (Brands)
            </h3>
            <button className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
              + Thêm Brand
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Tên Brand</th>
                  <th className="px-4 py-3">Xuất xứ</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SYSTEM_BRANDS.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{brand.country}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 hover:underline">
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PRODUCT PAGE CONTENT ---
const ProductManagementContent = () => {
  const [activeView, setActiveView] = useState("list"); // 'list' or 'attributes'
  const [selectedTab, setSelectedTab] = useState("All");

  // Mock filtering based on tabs
  const getFilteredProducts = () => {
    if (selectedTab === "All") return PRODUCTS_DATA;
    if (selectedTab === "Pending")
      return PRODUCTS_DATA.filter((p) => p.status === "Pending");
    if (selectedTab === "Reported")
      return PRODUCTS_DATA.filter(
        (p) => p.status === "Reported" || p.reports > 0,
      );
    if (selectedTab === "Active")
      return PRODUCTS_DATA.filter(
        (p) => p.status === "Active" || p.status === "Low Stock",
      );
    return PRODUCTS_DATA;
  };

  const filteredProducts = getFilteredProducts();

  if (activeView === "attributes") {
    return <SystemAttributeManager onBack={() => setActiveView("list")} />;
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Sản phẩm Hệ thống
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quyền Admin: Duyệt bài, Xử lý vi phạm, và Quản lý danh mục chuẩn.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Requirement 3: Admin manages categories/attributes */}
          <button
            onClick={() => setActiveView("attributes")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span>⚙️</span> Cấu hình Danh mục & Thuộc tính
          </button>
        </div>
      </div>

      {/* Admin Action Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="flex cursor-pointer items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-sm transition hover:shadow-md"
          onClick={() => setSelectedTab("Pending")}
        >
          <div>
            <p className="text-xs font-bold tracking-wide text-blue-800 uppercase">
              Yêu cầu duyệt mới
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-900">2 Sản phẩm</p>
            <p className="mt-1 text-xs text-blue-700">
              Cần xác nhận tiêu chuẩn
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl text-blue-600 shadow-sm">
            ⏳
          </div>
        </div>
        <div
          className="flex cursor-pointer items-center justify-between rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-sm transition hover:shadow-md"
          onClick={() => setSelectedTab("Reported")}
        >
          <div>
            <p className="text-xs font-bold tracking-wide text-red-800 uppercase">
              Báo cáo & Vi phạm
            </p>
            <p className="mt-1 text-2xl font-bold text-red-900">15 Cảnh báo</p>
            <p className="mt-1 text-xs text-red-700">
              Hàng giả / Spam / Sai hình ảnh
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl text-red-600 shadow-sm">
            🚨
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
              Tổng sản phẩm
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-800">3,842</p>
            <p className="mt-1 text-xs text-green-600">↑ 12 mới hôm nay</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-600">
            📦
          </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {/* Tabs updated to reflect Admin Tasks */}
            <button
              onClick={() => setSelectedTab("All")}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${selectedTab === "All" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedTab("Pending")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${selectedTab === "Pending" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"}`}
            >
              <span>🛡️</span> Chờ duyệt (2)
            </button>
            <button
              onClick={() => setSelectedTab("Active")}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${selectedTab === "Active" ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-green-600"}`}
            >
              Đang hiển thị
            </button>
            <button
              onClick={() => setSelectedTab("Reported")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${selectedTab === "Reported" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-red-600"}`}
            >
              <span>⚠️</span> Báo cáo / Vi phạm (1)
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm theo Tên SP, SKU, hoặc Tên Seller..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none">
              <option>Người bán: Tất cả</option>
              <option>Shop Chính Hãng</option>
              <option>Seller Cá nhân</option>
            </select>
            <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              ⚡ Bộ lọc nâng cao
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                <th className="w-12 px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-4">Sản phẩm</th>
                {/* Requirement 1 & 4: Monitor Seller */}
                <th className="px-6 py-4">Người bán (Seller)</th>
                <th className="px-6 py-4">Kho & Giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                {/* Requirement 4: Check quality */}
                <th className="px-6 py-4">Chất lượng</th>
                <th className="px-6 py-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="group transition duration-150 hover:bg-orange-50/30"
                >
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        {product.status === "Reported" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 text-xs">
                            ⚠️
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="truncate font-medium text-gray-900 transition-colors group-hover:text-orange-600">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.brand} • {product.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs">
                        👤
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {product.seller}
                      </span>
                    </div>
                    <p className="pl-8 text-xs text-gray-400">ID: #SEL882</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Kho: {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={product.status}
                      reports={product.reports}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      ⭐ {product.rating > 0 ? product.rating : "N/A"}{" "}
                      <span className="text-gray-400">
                        ({product.sales} bán)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Requirement 1: Actions for Pending Products */}
                      {product.status === "Pending" && (
                        <>
                          <button className="rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-700 transition hover:bg-green-200">
                            ✔ Duyệt
                          </button>
                          <button className="rounded bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100">
                            ❌ Từ chối
                          </button>
                        </>
                      )}

                      {/* Requirement 7 & 8: Actions for Reported Products */}
                      {product.status === "Reported" && (
                        <>
                          <button
                            className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                            title="Xem chi tiết báo cáo"
                          >
                            🔍 Review
                          </button>
                          <button
                            className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-700"
                            title="Khóa sản phẩm & Cảnh cáo Seller"
                          >
                            🔒 Khoá SP
                          </button>
                        </>
                      )}

                      {/* Standard Actions */}
                      {(product.status === "Active" ||
                        product.status === "Low Stock" ||
                        product.status === "Out of Stock") && (
                        <>
                          <button
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Xem chi tiết"
                          >
                            📄
                          </button>
                          {/* Requirement 2: Control Visibility (Hide) */}
                          <button
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-50 hover:text-orange-600"
                            title="Ẩn sản phẩm"
                          >
                            👁️‍🗨️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <span className="text-sm text-gray-500">
            Hiển thị {filteredProducts.length} kết quả
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-white disabled:opacity-50">
              Prev
            </button>
            <button className="rounded bg-orange-600 px-3 py-1 text-sm font-medium text-white">
              1
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-white disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT WRAPPER ---
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <aside className="fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white shadow-xl">
        <div className={`${CUSTOM_CLASSES.gradientOrange} p-6`}>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl shadow-sm">
              🛍️
            </div>
            <div>
              <h1
                id="dashboard-title"
                className="text-xl font-bold tracking-tight text-white"
              >
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
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-8 py-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Trung tâm Quản lý
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Thứ Hai, 21/11/2025 • Quyền Admin cao cấp
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
      <ProductManagementContent />
    </AdminLayout>
  );
};

export default App;
