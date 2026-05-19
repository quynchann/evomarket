import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiService from "../../services/api.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const defaultConfig = {
  page_title: "Quản lý sản phẩm",
  add_button_text: "Thêm sản phẩm mới",
  add_category_text: "Thêm danh mục mới",
  background_color: "#fff7ed",
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action_color: "#ea580c",
  secondary_text_color: "#64748b",
  font_family: "system-ui, -apple-system, sans-serif",
};

// Phí sàn mặc định (5%)
const PLATFORM_FEE_PERCENT = 5.0;

/* ---------- Helper utilities ---------- */
function formatPrice(price) {
  if (typeof price !== "number") return price;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/* ---------- Badge component for status ---------- */
function StatusBadge({ status }) {
  const map = {
    active: {
      text: "Đang bán",
      bg: "bg-green-100",
      textColor: "text-green-600",
    },
    "out-of-stock": {
      text: "Hết hàng",
      bg: "bg-red-100",
      textColor: "text-red-600",
    },
  };
  const s = map[status] || map["out-of-stock"];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.bg} ${s.textColor}`}
    >
      {s.text}
    </span>
  );
}

/* ---------- Modal wrapper ---------- */
function Modal({ open, onClose, title, children, size = "max-w-2xl" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex min-h-[100dvh] items-center justify-center p-3 sm:min-h-screen sm:p-4">
        <div
          className="fixed inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        ></div>
        <div
          className={`relative ${size} w-full rounded-lg bg-white shadow-xl`}
          style={{ zIndex: 60 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-slate-100"
            >
              <svg
                className="h-6 w-6 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="px-4 py-4 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function ProductManager() {
  const [config] = useState(defaultConfig);
  const queryClient = useQueryClient();

  const accessToken = useAuthStore((s) => s.accessToken);

  const [authHydrated, setAuthHydrated] = useState(
    () => useAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    setAuthHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });
  }, []);

  const sellerApiReady = authHydrated && !!accessToken;

  const categoriesQuery = useQuery({
    queryKey: ["seller", "categories"],
    queryFn: async () => {
      const res = await apiService.seller.listCategories();
      const list = res?.data?.categories;
      if (!Array.isArray(list)) return [];
      return list;
    },
    enabled: sellerApiReady,
  });

  const productsQuery = useQuery({
    queryKey: ["seller", "products"],
    queryFn: async () => {
      const res = await apiService.seller.listProducts();
      const list = res?.data?.products;
      if (!Array.isArray(list)) return [];
      return list;
    },
    enabled: sellerApiReady,
  });

  const products = useMemo(
    () => productsQuery.data ?? [],
    [productsQuery.data],
  );

  const categories = useMemo(() => {
    const rows = categoriesQuery.data ?? [];
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      icon: "📁",
      description: "Danh mục từ hệ thống",
      productCount: products.filter((p) => p.category === c.name).length,
    }));
  }, [categoriesQuery.data, products]);

  const productSaveMutation = useMutation({
    mutationFn: async ({ editingProduct: ed, payload }) => {
      if (ed) {
        const res = await apiService.seller.updateProduct(ed.id, payload);
        return res.data.product;
      }
      const res = await apiService.seller.createProduct(payload);
      return res.data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      toast.success("Đã lưu sản phẩm");
    },
    onError: (err) => {
      toast.error(err.message || "Không lưu được sản phẩm");
    },
  });

  const productDeleteMutation = useMutation({
    mutationFn: (id) => apiService.seller.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      toast.success("Đã xóa sản phẩm");
    },
    onError: (err) => {
      toast.error(err.message || "Không xóa được sản phẩm");
    },
  });

  /* UI state */
  const [activeTab, setActiveTab] = useState("products");
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [pageSize, _setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  /* Modal states */
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null => add
  const [editingCategory, setEditingCategory] = useState(null);

  /* Delete confirmation dialog */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  /* Image upload state */
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  /* Selected checkbox state (for future batch actions) */
  const [selectedIds, setSelectedIds] = useState(new Set());

  /* Price calculation state for form */
  const [formSellingPrice, setFormSellingPrice] = useState(0);
  const [formImportPrice, setFormImportPrice] = useState(0);

  /* Derived: filtered & searched products */
  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      );
    }
    if (filterCategory)
      list = list.filter((p) => p.category === filterCategory);
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);
    return list;
  }, [products, searchText, filterCategory, filterStatus]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  /* ---------- CRUD: Categories (read-only — danh mục quản trị tập trung) ---------- */
  function openAddCategory() {
    toast.info(
      "Danh mục do Admin quản lý trên hệ thống. Bạn chỉ chọn danh mục khi thêm/sửa sản phẩm.",
    );
  }

  function openEditCategory() {
    toast.info("Không thể chỉnh sửa danh mục tại kênh người bán.");
  }

  function saveCategory(e) {
    e.preventDefault();
    toast.info("Không thể lưu danh mục tại kênh người bán.");
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }

  function removeCategory() {
    toast.info("Không thể xóa danh mục tại kênh người bán.");
  }

  /* ---------- CRUD: Products ---------- */
  function openAddProduct() {
    setEditingProduct(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setFormSellingPrice(0);
    setFormImportPrice(0);
    setProductModalOpen(true);
  }

  function openEditProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingProduct(p);
    setImagePreview(p.thumbnail || p.image || null);
    setUploadedImageUrl(p.thumbnail || p.image || null);
    setFormSellingPrice(p.price || 0);
    setFormImportPrice(p.importPrice || 0);
    setProductModalOpen(true);
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      const response = await apiService.seller.uploadProductImage(file);
      const imageUrl = `http://localhost:8080${response.data.url}`;
      setUploadedImageUrl(imageUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error(error.message || "Tải ảnh lên thất bại");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    const form = e.target;
    const name = form["product-name"].value.trim();
    const categoryId = parseInt(form["product-category"].value, 10);
    const importPrice = parseInt(form["product-import-price"].value || 0, 10);
    const price = parseInt(form["product-price"].value || 0, 10);
    const stock = parseInt(form["product-stock"].value || 0, 10);
    const status = form["product-status"].value;
    const description = form["product-description"].value.trim();

    if (!name) return alert("Vui lòng nhập tên sản phẩm.");
    if (!categoryId) return alert("Vui lòng chọn danh mục.");

    const payload = {
      categoryId,
      title: name,
      importPrice,
      price,
      stock,
      status,
      description,
      thumbnail: uploadedImageUrl || editingProduct?.thumbnail || "",
    };

    try {
      await productSaveMutation.mutateAsync({ editingProduct, payload });
      setProductModalOpen(false);
      setEditingProduct(null);
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFormSellingPrice(0);
      setFormImportPrice(0);
      if (!editingProduct) setPage(1);
    } catch {
      /* toast trong onError */
    }
  }

  function removeProduct(id) {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    try {
      await productDeleteMutation.mutateAsync(productToDelete);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch {
      /* toast trong onError */
    }
  }

  function cancelDelete() {
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  }

  /* ---------- Selection (checkbox) ---------- */
  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }

  function toggleSelectAllOnPage() {
    const allOnPage = pageProducts.map((p) => p.id);
    const allSelected = allOnPage.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const ns = new Set(prev);
      if (allSelected) {
        allOnPage.forEach((id) => ns.delete(id));
      } else {
        allOnPage.forEach((id) => ns.add(id));
      }
      return ns;
    });
  }

  /* ---------- Simple product detail modal ---------- */
  const [detailProduct, setDetailProduct] = useState(null);

  /* ---------- Render ---------- */
  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Quản lý sản phẩm
            </h1>
            <p className="mt-2 text-gray-600">
              Quản lý danh mục và sản phẩm của cửa hàng
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAddProduct()}
            className="shrink-0 rounded-xl bg-white px-4 py-2 font-medium text-orange-600 shadow hover:bg-orange-50"
          >
            + Thêm sản phẩm
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto border-b border-slate-200">
          <nav className="flex w-max min-w-full gap-6 sm:w-auto sm:min-w-0">
            {/* Danh mục trước, Sản phẩm sau */}
            <button
              onClick={() => setActiveTab("categories")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "categories"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-500 hover:text-orange-600"
              }`}
            >
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "products"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-500 hover:text-orange-600"
              }`}
            >
              Sản phẩm
            </button>
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === "products" ? (
          /* Products View: giữ nguyên nội dung cũ (table, filters, stats) */
          <div id="products-view">
            {/* Stats cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <StatCard
                title="Tổng sản phẩm"
                value={products.length}
                icon="📦"
                bg="#fed7aa"
                iconColor="#ea580c"
              />
              <StatCard
                title="Đang bán"
                value={products.filter((p) => p.status === "active").length}
                icon="✔️"
                bg="#d1fae5"
                iconColor="#10b981"
              />
              <StatCard
                title="Hết hàng"
                value={
                  products.filter((p) => p.status === "out-of-stock").length
                }
                icon="⚠️"
                bg="#fee2e2"
                iconColor="#ef4444"
              />
              <StatCard
                title="Doanh thu tháng"
                value={"125M"}
                icon="💰"
                bg="#fef3c7"
                iconColor="#f59e0b"
              />
            </div>

            {/* Filters / Search */}
            <div
              className="mb-6 rounded-lg p-4 shadow-sm"
              style={{
                backgroundColor: config.surface_color,
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <svg
                      className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:outline-none"
                      style={{
                        borderColor: "#e2e8f0",
                        backgroundColor: config.surface_color,
                        color: config.text_color,
                      }}
                    />
                  </div>
                </div>

                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang bán</option>
                  <option value="out-of-stock">Hết hàng</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div
              className="overflow-hidden rounded-lg shadow-sm"
              style={{
                backgroundColor: config.surface_color,
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <tr>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded"
                          onChange={toggleSelectAllOnPage}
                          checked={
                            pageProducts.length > 0 &&
                            pageProducts.every((p) => selectedIds.has(p.id))
                          }
                        />
                      </th>
                      <th
                        id="column-product"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Sản phẩm
                      </th>
                      <th
                        id="column-category"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Danh mục
                      </th>
                      <th
                        id="column-import-price"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Giá nhập
                      </th>
                      <th
                        id="column-selling-price"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Giá bán
                      </th>
                      <th
                        id="column-platform-fee"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase text-orange-600"
                        style={{ color: "#ea580c" }}
                      >
                        Phí sàn (5%)
                      </th>
                      <th
                        id="column-seller-receive"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase text-green-700"
                        style={{ color: "#15803d" }}
                      >
                        Seller nhận
                      </th>
                      <th
                        id="column-stock"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Tồn kho
                      </th>
                      <th
                        id="column-sold"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Đã bán
                      </th>
                      <th
                        id="column-profit-per-unit"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Lợi nhuận/sp
                      </th>
                      <th
                        id="column-total-profit"
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-left text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Tổng lợi nhuận
                      </th>
                      <th
                        id="column-status"
                        className="min-w-26 whitespace-nowrap px-2 py-2 text-center text-xs font-semibold tracking-wider uppercase sm:px-3 sm:py-3 lg:px-6"
                        style={{ color: config.secondary_text_color }}
                      >
                        Trạng thái
                      </th>
                      <th
                        className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 text-right text-xs font-semibold tracking-wider uppercase"
                        style={{ color: config.secondary_text_color }}
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    id="products-tbody"
                    className="divide-y"
                    style={{ divideColor: "#e2e8f0" }}
                  >
                    {!authHydrated ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-8 sm:px-6 text-center text-slate-500"
                        >
                          Đang khôi phục phiên đăng nhập…
                        </td>
                      </tr>
                    ) : !accessToken ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-8 sm:px-6 text-center text-slate-600"
                        >
                          <p className="mb-2">Bạn chưa đăng nhập kênh người bán.</p>
                          <Link
                            to="/seller/login"
                            className="font-medium text-orange-600 underline hover:text-orange-700"
                          >
                            Đăng nhập seller
                          </Link>
                        </td>
                      </tr>
                    ) : productsQuery.isLoading ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-8 sm:px-6 text-center text-slate-500"
                        >
                          Đang tải danh sách sản phẩm…
                        </td>
                      </tr>
                    ) : productsQuery.isError ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-8 sm:px-6 text-center text-red-600"
                        >
                          <p className="mb-1 font-medium">
                            {productsQuery.error?.code === "FORBIDDEN"
                              ? "Không có quyền truy cập API người bán."
                              : "Không tải được dữ liệu."}
                          </p>
                          <p className="text-sm text-red-700/90">
                            {productsQuery.error?.message ||
                              "Kiểm tra backend và token đăng nhập."}
                            {productsQuery.error?.status
                              ? ` (HTTP ${productsQuery.error.status})`
                              : ""}
                          </p>
                        </td>
                      </tr>
                    ) : pageProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-8 sm:px-6 text-center text-slate-500"
                        >
                          Không có sản phẩm nào.
                        </td>
                      </tr>
                    ) : (
                      pageProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded"
                              checked={selectedIds.has(product.id)}
                              onChange={() => toggleSelect(product.id)}
                            />
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg"
                                style={{
                                  backgroundColor: config.background_color,
                                }}
                                onClick={() => setDetailProduct(product)}
                              >
                                {product.image &&
                                product.image.startsWith("http") ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-2xl">
                                    {product.image || "📦"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div
                                  className="font-medium"
                                  style={{ color: config.text_color }}
                                >
                                  {product.name}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: config.secondary_text_color }}
                                >
                                  ID: #{product.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="text-sm"
                              style={{ color: config.text_color }}
                            >
                              {product.category}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="font-medium"
                              style={{ color: config.text_color }}
                            >
                              {formatPrice(product.importPrice || 0)}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="font-medium"
                              style={{ color: config.text_color }}
                            >
                              {formatPrice(product.price)}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span className="text-sm text-orange-600">
                              {formatPrice(Math.round((product.price * PLATFORM_FEE_PERCENT) / 100))}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span className="font-semibold text-green-700">
                              {formatPrice(product.price - Math.round((product.price * PLATFORM_FEE_PERCENT) / 100))}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="text-sm"
                              style={{ color: config.text_color }}
                            >
                              {product.stock}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="text-sm font-medium"
                              style={{ color: config.text_color }}
                            >
                              {product.sold || 0}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="font-medium text-green-600"
                            >
                              {formatPrice(product.profitPerUnit || 0)}
                            </span>
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <span
                              className="font-bold text-green-700"
                            >
                              {formatPrice(product.totalProfit || 0)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-2 py-3 text-center align-middle sm:px-3 sm:py-4 lg:px-6">
                            <StatusBadge status={product.status} />
                          </td>

                          <td className="px-2 py-3 sm:px-3 lg:px-6 sm:py-4 align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProduct(product.id)}
                                className="rounded-lg p-2 hover:bg-slate-100"
                                title="Chỉnh sửa"
                              >
                                <svg
                                  className="h-5 w-5 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={() => removeProduct(product.id)}
                                className="rounded-lg p-2 hover:bg-slate-100"
                                title="Xóa"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                style={{ borderTop: "1px solid #e2e8f0" }}
              >
                <div
                  className="text-center text-xs sm:text-left sm:text-sm"
                  style={{ color: config.secondary_text_color }}
                >
                  Hiển thị{" "}
                  <span
                    className="font-medium"
                    style={{ color: config.text_color }}
                  >
                    {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span
                    className="font-medium"
                    style={{ color: config.text_color }}
                  >
                    {Math.min(page * pageSize, totalItems)}
                  </span>{" "}
                  trong{" "}
                  <span
                    className="font-medium"
                    style={{ color: config.text_color }}
                  >
                    {totalItems}
                  </span>{" "}
                  sản phẩm
                </div>
                <div className="flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto sm:justify-end">
                  <button
                    className="rounded border px-2 py-1 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    style={{
                      borderColor: "#e2e8f0",
                      color: config.secondary_text_color,
                      backgroundColor: config.surface_color,
                    }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    title="Trang trước"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* simple page numbers */}
                  <div className="flex max-w-[min(100%,12rem)] gap-1 overflow-x-auto pb-1 sm:max-w-none">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`rounded px-3 py-1 ${i + 1 === page ? "" : "border"}`}
                        style={{
                          backgroundColor:
                            i + 1 === page
                              ? config.primary_action_color
                              : config.surface_color,
                          color:
                            i + 1 === page
                              ? "#ffffff"
                              : config.secondary_text_color,
                          borderColor: "#e2e8f0",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="rounded border px-2 py-1 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    style={{
                      borderColor: "#e2e8f0",
                      color: config.secondary_text_color,
                      backgroundColor: config.surface_color,
                    }}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    title="Trang sau"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Categories View: giữ nguyên nội dung cũ */
          <div id="categories-view">
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              id="categories-grid"
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border p-6 shadow-sm"
                  style={{
                    backgroundColor: config.surface_color,
                    borderColor: "#e2e8f0",
                  }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                        style={{ backgroundColor: config.background_color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: config.text_color }}
                        >
                          {category.name}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: config.secondary_text_color }}
                        >
                          {category.productCount} sản phẩm
                        </p>
                      </div>
                    </div>
                  </div>

                  <p
                    className="text-sm"
                    style={{ color: config.secondary_text_color }}
                  >
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Modals ---------- */}

      {/* Category Modal */}
      <Modal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        size="max-w-lg"
      >
        <form id="category-form" onSubmit={saveCategory}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Tên danh mục
              </label>
              <input
                name="category-name"
                defaultValue={editingCategory?.name || ""}
                required
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
                placeholder="Ví dụ: Vàng 24K"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Icon (emoji)
              </label>
              <input
                name="category-icon"
                defaultValue={editingCategory?.icon || ""}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
                placeholder="🏆"
                maxLength={2}
              />
            </div>

            <div>
              <label
                className="font medium mb-1 block text-sm"
                style={{ color: config.text_color }}
              >
                Mô tả
              </label>
              <textarea
                name="category-description"
                defaultValue={editingCategory?.description || ""}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
                placeholder="Mô tả về danh mục này"
              ></textarea>
            </div>
          </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setCategoryModalOpen(false);
                setEditingCategory(null);
              }}
              className="flex-1 rounded-lg border px-4 py-2 font-medium"
              style={{
                borderColor: "#e2e8f0",
                color: config.secondary_text_color,
                backgroundColor: config.surface_color,
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg px-4 py-2 font-medium"
              style={{
                backgroundColor: config.primary_action_color,
                color: "#ffffff",
              }}
            >
              Lưu danh mục
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        key={editingProduct ? `edit-product-${editingProduct.id}` : "new-product"}
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
          setImagePreview(null);
          setUploadedImageUrl(null);
          setFormSellingPrice(0);
          setFormImportPrice(0);
        }}
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        size="max-w-2xl"
      >
        <form id="product-form" onSubmit={saveProduct}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Tên sản phẩm
              </label>
              <input
                name="product-name"
                defaultValue={editingProduct?.name || ""}
                required
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: config.text_color }}
                >
                  Danh mục
                </label>
                <select
                  name="product-category"
                  defaultValue={
                    editingProduct?.categoryId != null
                      ? String(editingProduct.categoryId)
                      : ""
                  }
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: config.text_color }}
                >
                  Giá nhập (VNĐ)
                </label>
                <input
                  name="product-import-price"
                  type="number"
                  defaultValue={editingProduct?.importPrice ?? 0}
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                  placeholder="0"
                  onChange={(e) => setFormImportPrice(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: config.text_color }}
                >
                  Giá bán (VNĐ)
                </label>
                <input
                  name="product-price"
                  type="number"
                  defaultValue={editingProduct?.price ?? 0}
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                  placeholder="0"
                  onChange={(e) => setFormSellingPrice(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: config.text_color }}
                >
                  Số lượng
                </label>
                <input
                  name="product-stock"
                  type="number"
                  defaultValue={editingProduct?.stock ?? 0}
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Phí sàn ước tính */}
            {formSellingPrice > 0 && (
              <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-orange-800">
                  💰 Tính toán lợi nhuận dự kiến
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Giá bán:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(formSellingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Phí sàn EvoMarket (5%):</span>
                    <span className="font-medium">
                      -{formatPrice(Math.round((formSellingPrice * PLATFORM_FEE_PERCENT) / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-orange-300 pt-2 font-bold text-green-700">
                    <span>🎯 Bạn nhận được:</span>
                    <span className="text-lg">
                      {formatPrice(formSellingPrice - Math.round((formSellingPrice * PLATFORM_FEE_PERCENT) / 100))}
                    </span>
                  </div>
                  {formImportPrice > 0 && (
                    <>
                      <div className="flex justify-between text-gray-600 text-xs border-t border-orange-200 pt-2 mt-2">
                        <span>Chi phí vốn:</span>
                        <span>-{formatPrice(formImportPrice)}</span>
                      </div>
                      <div className="flex justify-between text-blue-700 font-semibold">
                        <span>💵 Lợi nhuận ròng/sp:</span>
                        <span>
                          {formatPrice(
                            formSellingPrice - 
                            Math.round((formSellingPrice * PLATFORM_FEE_PERCENT) / 100) - 
                            formImportPrice
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  ℹ️ Phí sàn được trừ tự động khi khách hàng thanh toán
                </p>
              </div>
            )}

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Trạng thái
              </label>
              <select
                name="product-status"
                defaultValue={editingProduct?.status || "active"}
                required
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
              >
                <option value="active">Đang bán</option>
                <option value="out-of-stock">Hết hàng</option>
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Mô tả
              </label>
              <textarea
                name="product-description"
                defaultValue={editingProduct?.description || ""}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                }}
                placeholder="Nhập mô tả sản phẩm"
              ></textarea>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: config.text_color }}
              >
                Ảnh sản phẩm
              </label>
              
              {imagePreview && (
                <div className="mb-3 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setUploadedImageUrl(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  id="product-image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="product-image-upload"
                  className="inline-block rounded-lg border px-4 py-2 font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor: config.surface_color,
                    color: config.text_color,
                    opacity: uploadingImage ? 0.6 : 1,
                    pointerEvents: uploadingImage ? 'none' : 'auto',
                  }}
                >
                  {uploadingImage ? "Đang tải..." : "Chọn tệp"}
                </label>
              </div>
              {uploadingImage && (
                <p className="mt-1 text-sm text-orange-600">Đang tải ảnh lên...</p>
              )}
            </div>
          </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setProductModalOpen(false);
                setEditingProduct(null);
                setImagePreview(null);
                setUploadedImageUrl(null);
                setFormSellingPrice(0);
                setFormImportPrice(0);
              }}
              className="flex-1 rounded-lg border px-4 py-2 font-medium"
              style={{
                borderColor: "#e2e8f0",
                color: config.secondary_text_color,
                backgroundColor: config.surface_color,
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={productSaveMutation.isPending}
              className="flex-1 rounded-lg px-4 py-2 font-medium disabled:opacity-60"
              style={{
                backgroundColor: config.primary_action_color,
                color: "#ffffff",
              }}
            >
              {productSaveMutation.isPending ? "Đang lưu…" : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        title="Chi tiết sản phẩm"
      >
        {detailProduct && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div
                className="mx-auto flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:mx-0"
                style={{ backgroundColor: config.background_color }}
              >
                {detailProduct.image &&
                detailProduct.image.startsWith("http") ? (
                  <img
                    src={detailProduct.image}
                    alt={detailProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-4xl">{detailProduct.image || "📦"}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="text-lg font-bold"
                  style={{ color: config.text_color }}
                >
                  {detailProduct.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: config.secondary_text_color }}
                >
                  ID: #{detailProduct.id}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Giá nhập:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(detailProduct.importPrice || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Giá bán:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(detailProduct.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-orange-600 mb-1">
                      <span>Phí sàn (5%):</span>
                      <span className="font-medium">
                        -{formatPrice(Math.round((detailProduct.price * PLATFORM_FEE_PERCENT) / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-green-700 border-t border-gray-300 pt-2 mt-1">
                      <span>Seller nhận/sp:</span>
                      <span>
                        {formatPrice(detailProduct.price - Math.round((detailProduct.price * PLATFORM_FEE_PERCENT) / 100))}
                      </span>
                    </div>
                    {detailProduct.importPrice > 0 && (
                      <div className="flex justify-between text-sm font-bold text-blue-700 mt-1">
                        <span>Lợi nhuận/sp:</span>
                        <span>
                          {formatPrice(detailProduct.profitPerUnit || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-gray-600">Danh mục:</span>
                      <p className="font-medium">{detailProduct.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <p className="font-medium">{detailProduct.stock}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Đã bán:</span>
                      <p className="font-medium text-blue-600">{detailProduct.sold || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng lợi nhuận:</span>
                      <p className="font-medium text-green-600">
                        {formatPrice(detailProduct.totalProfit || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <StatusBadge status={detailProduct.status} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium" style={{ color: config.text_color }}>
                Mô tả
              </h4>
              <p
                className="text-sm"
                style={{ color: config.secondary_text_color }}
              >
                {detailProduct.description || "Chưa có mô tả."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => openEditProduct(detailProduct.id)}
                className="rounded-lg px-4 py-2"
                style={{
                  backgroundColor: config.primary_action_color,
                  color: "#fff",
                }}
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  const productId = detailProduct.id;
                  setDetailProduct(null);
                  removeProduct(productId);
                }}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        title="Xác nhận xóa sản phẩm"
        size="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa sản phẩm này không?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={cancelDelete}
              disabled={productDeleteMutation.isPending}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              disabled={productDeleteMutation.isPending}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {productDeleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------- Smaller visual components ---------- */
function StatCard({ title, value, icon, bg, iconColor }) {
  return (
    <div
      className="rounded-lg p-5 shadow-sm"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "#1e293b" }}>
            {value}
          </p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: bg }}
        >
          <span className="text-xl" style={{ color: iconColor }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
