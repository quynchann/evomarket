import React, { useEffect, useMemo, useState } from "react";

const defaultConfig = {
  background_color: "#f8fafc", // light
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action_color: "#ea580c", // orange
  secondary_action_color: "#64748b",
  font_family: "Inter",
  font_size: 14,
  page_title: "Quản Lý Đơn Hàng",
  table_header_id: "Mã Đơn",
  table_header_customer: "Khách Hàng",
  table_header_date: "Ngày Đặt",
  table_header_total: "Tổng Tiền",
  table_header_status: "Trạng Thái",
  table_header_actions: "Thao Tác",
};

const sampleOrders = [
  {
    id: "DH001",
    customer: "Nguyễn Văn A",
    date: "2024-01-15",
    total: "1.250.000đ",
    status: "pending",
    items: 3,
  },
  {
    id: "DH002",
    customer: "Trần Thị B",
    date: "2024-01-14",
    total: "850.000đ",
    status: "processing",
    items: 2,
  },
  {
    id: "DH003",
    customer: "Lê Văn C",
    date: "2024-01-14",
    total: "2.100.000đ",
    status: "shipped",
    items: 5,
  },
  {
    id: "DH004",
    customer: "Phạm Thị D",
    date: "2024-01-13",
    total: "650.000đ",
    status: "delivered",
    items: 1,
  },
  {
    id: "DH005",
    customer: "Hoàng Văn E",
    date: "2024-01-13",
    total: "1.800.000đ",
    status: "cancelled",
    items: 4,
  },
  {
    id: "DH006",
    customer: "Vũ Thị F",
    date: "2024-01-12",
    total: "950.000đ",
    status: "pending",
    items: 2,
  },
  {
    id: "DH007",
    customer: "Đặng Văn G",
    date: "2024-01-12",
    total: "1.450.000đ",
    status: "processing",
    items: 3,
  },
  {
    id: "DH008",
    customer: "Bùi Thị H",
    date: "2024-01-11",
    total: "3.200.000đ",
    status: "delivered",
    items: 6,
  },
];

const statusLabels = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đã gửi hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

// Orange-themed / friendly color tokens (for badges & buttons)
const statusColors = {
  pending: { bg: "#fff7ed", text: "#92400e", border: "#fb923c" }, // light orange bg
  processing: { bg: "#fff7ed", text: "#92400e", border: "#f97316" }, // orange
  shipped: { bg: "#fffbeb", text: "#7c2d12", border: "#f59e0b" },
  delivered: { bg: "#ecfdf5", text: "#065f46", border: "#10b981" },
  cancelled: { bg: "#fef2f2", text: "#991b1b", border: "#ef4444" },
};

export default function OrdersManager({ initialConfig = {} }) {
  const config = useMemo(
    () => ({ ...defaultConfig, ...initialConfig }),
    [initialConfig],
  );

  // state
  const [orders, setOrders] = useState(() => structuredClone(sampleOrders));
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // derived filtered list
  const filteredOrders = useMemo(() => {
    if (currentFilter === "all") return orders;
    return orders.filter((o) => o.status === currentFilter);
  }, [orders, currentFilter]);

  useEffect(() => {
    // optional: if host provides window.elementSdk, initialize mapping like original
    if (
      window &&
      window.elementSdk &&
      typeof window.elementSdk.init === "function"
    ) {
      try {
        const element = {
          defaultConfig,
          onConfigChange: (newConfig = {}) => {
            console.warn(
              "elementSdk onConfigChange received new config but this component derives config from initialConfig; update initialConfig or wire a state setter.",
              newConfig,
            );
          },
          mapToCapabilities: () => ({}),
          mapToEditPanelValues: () => new Map(),
        };
        window.elementSdk.init(element);
      } catch (e) {
        console.error(e);
      }
    }
  }, [config]); // re-run when config (derived from initialConfig) changes

  // helpers
  function getStatusCount(status) {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  }

  function handleFilterChange(filter) {
    setCurrentFilter(filter);
  }

  function handleViewDetails(orderId) {
    const found = orders.find((o) => o.id === orderId);
    if (found) setSelectedOrder(found);
  }

  function handleCloseModal() {
    setSelectedOrder(null);
  }

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    // reflect in modal selection
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev,
    );
  }

  // small inline style util for font sizing consistent with original code
  const baseSize = config.font_size || 14;
  const primaryColor = config.primary_action_color || "#ea580c";
  const textColor = config.text_color || "#1e293b";
  const surfaceColor = config.surface_color || "#ffffff";

  return (
    <div
      className="min-h-full p-6"
      style={{
        backgroundColor: config.background_color || "#f8fafc",
        color: textColor,
        fontFamily: `${config.font_family}, system-ui, -apple-system, sans-serif`,
        fontSize: baseSize,
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            id="page-title"
            className="mb-2 font-bold"
            style={{ fontSize: baseSize * 2, color: textColor }}
          >
            {config.page_title}
          </h1>
          <p
            style={{
              fontSize: baseSize * 0.9,
              color: textColor,
              opacity: 0.75,
            }}
          >
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: surfaceColor,
              border: `1px solid ${textColor}20`,
            }}
          >
            <div
              style={{
                fontSize: baseSize * 0.85,
                color: textColor,
                opacity: 0.7,
              }}
            >
              Tất cả
            </div>
            <div
              className="mt-1 font-bold"
              style={{ fontSize: baseSize * 1.5, color: textColor }}
            >
              {getStatusCount("all")}
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: surfaceColor,
              border: `1px solid ${textColor}20`,
            }}
          >
            <div
              style={{
                fontSize: baseSize * 0.85,
                color: textColor,
                opacity: 0.7,
              }}
            >
              Chờ xử lý
            </div>
            <div
              className="mt-1 font-bold"
              style={{
                fontSize: baseSize * 1.5,
                color: statusColors.pending.text,
              }}
            >
              {getStatusCount("pending")}
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: surfaceColor,
              border: `1px solid ${textColor}20`,
            }}
          >
            <div
              style={{
                fontSize: baseSize * 0.85,
                color: textColor,
                opacity: 0.7,
              }}
            >
              Đang xử lý
            </div>
            <div
              className="mt-1 font-bold"
              style={{
                fontSize: baseSize * 1.5,
                color: statusColors.processing.text,
              }}
            >
              {getStatusCount("processing")}
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: surfaceColor,
              border: `1px solid ${textColor}20`,
            }}
          >
            <div
              style={{
                fontSize: baseSize * 0.85,
                color: textColor,
                opacity: 0.7,
              }}
            >
              Đã giao
            </div>
            <div
              className="mt-1 font-bold"
              style={{
                fontSize: baseSize * 1.5,
                color: statusColors.delivered.text,
              }}
            >
              {getStatusCount("delivered")}
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: surfaceColor,
              border: `1px solid ${textColor}20`,
            }}
          >
            <div
              style={{
                fontSize: baseSize * 0.85,
                color: textColor,
                opacity: 0.7,
              }}
            >
              Đã hủy
            </div>
            <div
              className="mt-1 font-bold"
              style={{
                fontSize: baseSize * 1.5,
                color: statusColors.cancelled.text,
              }}
            >
              {getStatusCount("cancelled")}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className="mb-6 inline-flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: `${textColor}10` }}
        >
          {[
            "all",
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ].map((filter) => {
            const isActive = currentFilter === filter;
            const label = filter === "all" ? "Tất cả" : statusLabels[filter];
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className="rounded-md px-4 py-2 transition-all"
                style={{
                  backgroundColor: isActive ? surfaceColor : "transparent",
                  color: isActive ? textColor : `${textColor}99`,
                  fontSize: baseSize * 0.9,
                  fontWeight: isActive ? 600 : 400,
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div
          className="overflow-hidden rounded-lg"
          style={{
            backgroundColor: surfaceColor,
            border: `1px solid ${textColor}20`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                style={{
                  backgroundColor: `${textColor}05`,
                  borderBottom: `1px solid ${textColor}20`,
                }}
              >
                <tr>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_id}
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_customer}
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_date}
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_total}
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_status}
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50"
                    style={{ borderBottom: `1px solid ${textColor}10` }}
                  >
                    <td
                      className="px-6 py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {order.id}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ fontSize: baseSize, color: textColor }}
                    >
                      {order.customer}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        opacity: 0.7,
                      }}
                    >
                      {order.date}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {order.total}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: statusColors[order.status].bg,
                          color: statusColors[order.status].text,
                          border: `1px solid ${statusColors[order.status].border}`,
                          fontSize: baseSize * 0.85,
                        }}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="rounded-md px-4 py-2 transition-all"
                        style={{
                          backgroundColor: primaryColor,
                          color: "white",
                          fontSize: baseSize * 0.9,
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Không có đơn hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }}
        >
          <div
            className="max-h-[90%] w-full max-w-2xl overflow-y-auto rounded-lg"
            style={{ backgroundColor: surfaceColor }}
          >
            <div
              className="border-b p-6"
              style={{ borderColor: `${textColor}20` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="mb-1 font-bold"
                    style={{ fontSize: baseSize * 1.5, color: textColor }}
                  >
                    Chi tiết đơn hàng {selectedOrder.id}
                  </h2>
                  <p
                    style={{
                      fontSize: baseSize * 0.9,
                      color: textColor,
                      opacity: 0.7,
                    }}
                  >
                    Khách hàng: {selectedOrder.customer}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-md p-2 transition-all"
                  style={{
                    backgroundColor: `${textColor}10`,
                    color: textColor,
                    fontSize: baseSize * 1.2,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <div
                    style={{
                      fontSize: baseSize * 0.85,
                      color: textColor,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Ngày đặt hàng
                  </div>
                  <div
                    style={{
                      fontSize: baseSize,
                      color: textColor,
                      fontWeight: 600,
                    }}
                  >
                    {selectedOrder.date}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: baseSize * 0.85,
                      color: textColor,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Tổng tiền
                  </div>
                  <div
                    style={{
                      fontSize: baseSize * 1.2,
                      color: primaryColor,
                      fontWeight: 700,
                    }}
                  >
                    {selectedOrder.total}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: baseSize * 0.85,
                      color: textColor,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Số lượng sản phẩm
                  </div>
                  <div
                    style={{
                      fontSize: baseSize,
                      color: textColor,
                      fontWeight: 600,
                    }}
                  >
                    {selectedOrder.items} sản phẩm
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: baseSize * 0.85,
                      color: textColor,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Trạng thái hiện tại
                  </div>
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: statusColors[selectedOrder.status].bg,
                      color: statusColors[selectedOrder.status].text,
                      border: `1px solid ${statusColors[selectedOrder.status].border}`,
                      fontSize: baseSize * 0.85,
                    }}
                  >
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3
                  className="mb-3 font-semibold"
                  style={{ fontSize: baseSize * 1.1, color: textColor }}
                >
                  Cập nhật trạng thái
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(statusLabels).map((statusKey) => {
                    const active = selectedOrder.status === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, statusKey)
                        }
                        className={`rounded-md px-4 py-2 transition-all ${active ? "ring-2" : ""}`}
                        style={{
                          backgroundColor: statusColors[statusKey].bg,
                          color: statusColors[statusKey].text,
                          border: `1px solid ${statusColors[statusKey].border}`,
                          fontSize: baseSize * 0.9,
                          boxShadow: active
                            ? `0 0 0 4px ${statusColors[statusKey].border}33`
                            : "none",
                        }}
                      >
                        {statusLabels[statusKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 rounded-md px-4 py-3 transition-all"
                  style={{
                    backgroundColor: config.secondary_action_color || "#64748b",
                    color: "white",
                    fontSize: baseSize,
                    fontWeight: 600,
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small hover/interaction styles appended inline via JSX style tag */}
      <style>{`
        .hover-row:hover { background-color: ${textColor}05 !important; }
        button:hover { opacity: 0.95; transform: translateY(-1px); }
        button:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}
