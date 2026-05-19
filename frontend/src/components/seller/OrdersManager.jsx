import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderApi } from "../../services/orderApi.js";
import {
  ORDER_STATUS,
  ORDER_STATUS_VI,
  SELLER_NEXT_STATUSES,
  SELLER_ACTION_LABEL,
  ORDER_FILTER_KEYS,
  statusColors,
} from "../../constants/orderStatus.js";

/** Cố định số đơn mỗi trang (seller) */
const SELLER_ORDERS_PER_PAGE = 20;

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

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}

function formatOrderDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("vi-VN");
}

function groupSellerOrderRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const ord = row.Order ?? row.order;
    if (!ord) continue;
    const oid = ord.id;
    if (!map.has(oid)) map.set(oid, { order: ord, lines: [] });
    map.get(oid).lines.push(row);
  }
  return Array.from(map.values())
    .map(({ order, lines }) => {
      const created = order.created_at ?? order.createdAt;
      const itemQty = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const subtotal = lines.reduce((s, l) => {
        const tp =
          l.total_price ??
          Number(l.selling_price) * Number(l.quantity);
        return s + (Number(tp) || 0);
      }, 0);
      return {
        id: order.id,
        customer: order.fullname || order.email || "—",
        date: formatOrderDate(created),
        total: formatVnd(subtotal),
        status: order.status || ORDER_STATUS.PENDING_CONFIRMATION,
        items: itemQty,
        lineItems: lines,
        rawOrder: order,
      };
    })
    .sort((a, b) => {
      const ca = new Date(a.rawOrder.created_at ?? a.rawOrder.createdAt ?? 0);
      const cb = new Date(b.rawOrder.created_at ?? b.rawOrder.createdAt ?? 0);
      return cb - ca;
    });
}

function filterLabel(key) {
  if (key === "all") return "Tất cả";
  return ORDER_STATUS_VI[key] || key;
}

export default function OrdersManager({ initialConfig = {} }) {
  const config = useMemo(
    () => ({ ...defaultConfig, ...initialConfig }),
    [initialConfig],
  );

  const queryClient = useQueryClient();
  const [currentFilter, setCurrentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipCarrier, setShipCarrier] = useState("");
  const [shipTracking, setShipTracking] = useState("");

  const statusApiParam = currentFilter === "all" ? undefined : currentFilter;

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-orders", page, currentFilter],
    queryFn: async () => {
      const res = await orderApi.sellerList({
        page,
        ...(statusApiParam ? { status: statusApiParam } : {}),
      });
      return res.data;
    },
  });

  const { data: countsPayload } = useQuery({
    queryKey: ["seller-order-counts"],
    queryFn: async () => {
      const res = await orderApi.sellerOrderCounts();
      return res.data;
    },
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalOrders = pagination?.total ?? 0;

  useEffect(() => {
    if (!pagination || totalOrders === 0) return;
    if (page > totalPages && totalPages >= 1) setPage(totalPages);
  }, [pagination, page, totalPages, totalOrders]);

  const orders = useMemo(
    () => groupSellerOrderRows(data?.orders ?? []),
    [data?.orders],
  );

  useEffect(() => {
    if (selectedOrder == null) return;
    const fresh = orders.find((o) => o.id === selectedOrder.id);
    if (fresh) setSelectedOrder(fresh);
  }, [orders, selectedOrder?.id]);

  useEffect(() => {
    setShipCarrier("");
    setShipTracking("");
  }, [selectedOrder?.id]);

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status, carrier_name, tracking_number, note }) =>
      orderApi.updateStatus(orderId, {
        status,
        ...(carrier_name != null ? { carrier_name } : {}),
        ...(tracking_number != null ? { tracking_number } : {}),
        ...(note ? { note } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-counts"] });
      toast.success("Đã cập nhật trạng thái đơn hàng");
    },
    onError: (err) => {
      toast.error(err.message || "Không cập nhật được trạng thái");
    },
  });

  const acceptReturnMutation = useMutation({
    mutationFn: (orderId) => orderApi.sellerAcceptReturn(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-counts"] });
      toast.success("Đã chấp nhận trả hàng — chờ hoàn tiền");
    },
    onError: (err) => toast.error(err.message || "Thao tác thất bại"),
  });

  const rejectReturnMutation = useMutation({
    mutationFn: (orderId) => orderApi.sellerRejectReturn(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-counts"] });
      toast.success("Đã từ chối yêu cầu trả hàng");
    },
    onError: (err) => toast.error(err.message || "Thao tác thất bại"),
  });

  const completeRefundMutation = useMutation({
    mutationFn: (orderId) => orderApi.sellerCompleteRefund(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-counts"] });
      toast.success("Đã xác nhận hoàn tiền");
    },
    onError: (err) => toast.error(err.message || "Thao tác thất bại"),
  });

  const returnRefundBusy =
    acceptReturnMutation.isPending ||
    rejectReturnMutation.isPending ||
    completeRefundMutation.isPending;

  // Danh sách đã lọc theo trạng thái trên server

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
    const c = countsPayload;
    if (!c) return 0;
    if (status === "all") return c.all ?? 0;
    return c.byStatus?.[status] ?? 0;
  }

  function handleFilterChange(filter) {
    setCurrentFilter(filter);
    setPage(1);
  }

  function handleViewDetails(orderId) {
    const found = orders.find((o) => o.id === orderId);
    if (found) setSelectedOrder(found);
  }

  function handleCloseModal() {
    setSelectedOrder(null);
    setShipCarrier("");
    setShipTracking("");
  }

  function handleSellerTransition(orderId, toStatus) {
    if (toStatus === ORDER_STATUS.SHIPPED) {
      const c = shipCarrier.trim();
      if (!c) {
        toast.error("Vui lòng nhập tên đơn vị vận chuyển");
        return;
      }
      statusMutation.mutate({
        orderId,
        status: toStatus,
        carrier_name: c,
        tracking_number: shipTracking.trim() || undefined,
      });
    } else {
      statusMutation.mutate({ orderId, status: toStatus });
    }
  }

  // small inline style util for font sizing consistent with original code
  const baseSize = config.font_size || 14;
  const primaryColor = config.primary_action_color || "#ea580c";
  const textColor = config.text_color || "#1e293b";
  const surfaceColor = config.surface_color || "#ffffff";

  function badgeColors(statusKey) {
    return (
      statusColors[statusKey] || {
        bg: "#f8fafc",
        text: "#475569",
        border: "#cbd5e1",
      }
    );
  }

  return (
    <div
      className="min-h-full px-4 py-6 sm:p-6"
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
        <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[
            "all",
            ORDER_STATUS.PENDING_CONFIRMATION,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PREPARING,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.CANCELLED,
          ].map((key) => {
            const bc =
              key === "all"
                ? { text: textColor }
                : badgeColors(key);
            return (
              <div
                key={key}
                className="min-w-0 rounded-lg p-3 sm:p-4"
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
                  {filterLabel(key)}
                </div>
                <div
                  className="mt-1 font-bold"
                  style={{ fontSize: baseSize * 1.5, color: bc.text }}
                >
                  {getStatusCount(key)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div
          className="mb-6 flex max-w-full gap-1 overflow-x-auto rounded-lg p-1 sm:flex-wrap md:overflow-x-visible"
          style={{ backgroundColor: `${textColor}10` }}
        >
          {ORDER_FILTER_KEYS.map((filter) => {
            const isActive = currentFilter === filter;
            const label = filterLabel(filter);
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className="shrink-0 rounded-md px-3 py-2 transition-all"
                style={{
                  backgroundColor: isActive ? surfaceColor : "transparent",
                  color: isActive ? textColor : `${textColor}99`,
                  fontSize: baseSize * 0.85,
                  fontWeight: isActive ? 600 : 400,
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error.message || "Không tải được đơn hàng. Kiểm tra đăng nhập seller."}
          </p>
        )}

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
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_id}
                  </th>
                  <th
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_customer}
                  </th>
                  <th
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_date}
                  </th>
                  <th
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_total}
                  </th>
                  <th
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_status}
                  </th>
                  <th
                    className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-4"
                    style={{ fontSize: baseSize * 0.85, color: textColor }}
                  >
                    {config.table_header_actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center sm:px-6"
                      style={{ color: textColor, opacity: 0.7 }}
                    >
                      Đang tải đơn hàng…
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  orders.map((order) => {
                    const bc = badgeColors(order.status);
                    return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50"
                    style={{ borderBottom: `1px solid ${textColor}10` }}
                  >
                    <td
                      className="px-3 py-3 sm:px-6 sm:py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      #{order.id}
                    </td>
                    <td
                      className="px-3 py-3 sm:px-6 sm:py-4"
                      style={{ fontSize: baseSize, color: textColor }}
                    >
                      {order.customer}
                    </td>
                    <td
                      className="px-3 py-3 sm:px-6 sm:py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        opacity: 0.7,
                      }}
                    >
                      {order.date}
                    </td>
                    <td
                      className="px-3 py-3 sm:px-6 sm:py-4"
                      style={{
                        fontSize: baseSize,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {order.total}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <span
                        className="inline-block max-w-full rounded-lg px-2.5 py-1.5 text-center text-xs leading-snug font-medium wrap-break-word text-balance"
                        style={{
                          backgroundColor: bc.bg,
                          color: bc.text,
                          border: `1px solid ${bc.border}`,
                          fontSize: baseSize * 0.85,
                        }}
                        title={ORDER_STATUS_VI[order.status] || order.status}
                      >
                        {ORDER_STATUS_VI[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
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
                    );
                  })}

                {!isLoading && orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500 sm:px-6"
                    >
                      Không có đơn hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ fontSize: baseSize * 0.9, color: textColor }}
        >
          <div style={{ opacity: 0.8 }}>
            {totalOrders === 0
              ? "Không có đơn hàng trong bộ lọc này"
              : `Hiển thị ${(page - 1) * SELLER_ORDERS_PER_PAGE + 1}–${Math.min(page * SELLER_ORDERS_PER_PAGE, totalOrders)} trong ${totalOrders} đơn (${SELLER_ORDERS_PER_PAGE} đơn/trang)`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={isLoading || page <= 1}
                className="rounded-md px-3 py-1.5 disabled:opacity-40"
                style={{
                  border: `1px solid ${textColor}25`,
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
              >
                Trước
              </button>
              <span style={{ minWidth: "6.5rem", textAlign: "center" }}>
                Trang {totalPages === 0 ? 1 : page} /{" "}
                {totalPages === 0 ? 1 : totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  isLoading || totalPages === 0 || page >= totalPages
                }
                className="rounded-md px-3 py-1.5 disabled:opacity-40"
                style={{
                  border: `1px solid ${textColor}25`,
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
              >
                Sau
              </button>
            </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl sm:max-h-[90vh] sm:rounded-lg"
            style={{ backgroundColor: surfaceColor }}
          >
            <div
              className="border-b p-4 sm:p-6"
              style={{ borderColor: `${textColor}20` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="mb-1 font-bold"
                    style={{ fontSize: baseSize * 1.5, color: textColor }}
                  >
                    Chi tiết đơn hàng #{selectedOrder.id}
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

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    className="inline-block max-w-full rounded-lg px-2.5 py-1.5 text-center text-xs leading-snug font-medium wrap-break-word text-balance"
                    style={{
                      backgroundColor: badgeColors(selectedOrder.status).bg,
                      color: badgeColors(selectedOrder.status).text,
                      border: `1px solid ${badgeColors(selectedOrder.status).border}`,
                      fontSize: baseSize * 0.85,
                    }}
                    title={
                      ORDER_STATUS_VI[selectedOrder.status] ||
                      selectedOrder.status
                    }
                  >
                    {ORDER_STATUS_VI[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              {(selectedOrder.rawOrder?.carrier_name ||
                selectedOrder.rawOrder?.tracking_number) && (
                <div
                  className="mb-6 rounded-lg border p-3 text-sm"
                  style={{ borderColor: `${textColor}20` }}
                >
                  <p style={{ fontWeight: 600, color: textColor }}>Vận chuyển</p>
                  {selectedOrder.rawOrder?.carrier_name && (
                    <p className="mt-1" style={{ color: textColor }}>
                      ĐVVC: {selectedOrder.rawOrder.carrier_name}
                    </p>
                  )}
                  {selectedOrder.rawOrder?.tracking_number && (
                    <p className="mt-1 font-mono" style={{ color: textColor }}>
                      Mã vận đơn: {selectedOrder.rawOrder.tracking_number}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="mb-3 font-semibold"
                  style={{ fontSize: baseSize * 1.1, color: textColor }}
                >
                  Sản phẩm trong đơn (của shop bạn)
                </h3>
                <ul
                  className="space-y-2 rounded-lg border p-3"
                  style={{ borderColor: `${textColor}20` }}
                >
                  {(selectedOrder.lineItems || []).map((line) => (
                    <li
                      key={
                        line.id ??
                        `${line.order_id}-${line.product_id}-${line.variant_id ?? "x"}`
                      }
                      className="flex justify-between gap-2"
                      style={{ fontSize: baseSize * 0.95, color: textColor }}
                    >
                      <span>
                        {line.product_title ||
                          `Sản phẩm #${line.product_id}`}
                        {line.variant_name ? ` · ${line.variant_name}` : ""}
                        <span style={{ opacity: 0.65 }}>
                          {" "}
                          × {line.quantity}
                        </span>
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatVnd(
                          line.total_price ??
                            Number(line.selling_price) *
                              Number(line.quantity),
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3
                  className="mb-3 font-semibold"
                  style={{ fontSize: baseSize * 1.1, color: textColor }}
                >
                  Cập nhật trạng thái (theo đúng bước)
                </h3>
                {(SELLER_NEXT_STATUSES[selectedOrder.status] || []).includes(
                  ORDER_STATUS.SHIPPED,
                ) && (
                  <div className="mb-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Tên đơn vị vận chuyển *"
                      value={shipCarrier}
                      onChange={(e) => setShipCarrier(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: `${textColor}30` }}
                    />
                    <input
                      type="text"
                      placeholder="Mã vận đơn từ hãng (tuỳ chọn)"
                      value={shipTracking}
                      onChange={(e) => setShipTracking(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: `${textColor}30` }}
                    />
                    <p className="text-xs leading-snug" style={{ color: textColor, opacity: 0.75 }}>
                      Để trống: hệ thống tự tạo mã nội bộ dạng EVO-mã đơn-mã ngẫu nhiên để đối chiếu.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(SELLER_NEXT_STATUSES[selectedOrder.status] || []).map((toStatus) => {
                      const cols = badgeColors(toStatus);
                      return (
                        <button
                          key={toStatus}
                          type="button"
                          disabled={statusMutation.isPending || returnRefundBusy}
                          onClick={() =>
                            handleSellerTransition(selectedOrder.id, toStatus)
                          }
                          className="rounded-md px-4 py-2 text-center leading-snug transition-all"
                          style={{
                            backgroundColor: cols.bg,
                            color: cols.text,
                            border: `1px solid ${cols.border}`,
                            fontSize: baseSize * 0.9,
                          }}
                        >
                          {SELLER_ACTION_LABEL[toStatus] || ORDER_STATUS_VI[toStatus]}
                        </button>
                      );
                    })}
                </div>

                {(selectedOrder.status === ORDER_STATUS.RETURN_REQUESTED ||
                  selectedOrder.status === ORDER_STATUS.RETURN_ACCEPTED) && (
                  <div
                    className="mt-4 border-t pt-4"
                    style={{ borderColor: `${textColor}18` }}
                  >
                    <h4
                      className="mb-2 font-semibold"
                      style={{ fontSize: baseSize * 1.05, color: textColor }}
                    >
                      Trả hàng & hoàn tiền
                    </h4>
                    {selectedOrder.status === ORDER_STATUS.RETURN_REQUESTED && (
                      <p className="mb-3 text-xs" style={{ color: textColor, opacity: 0.8 }}>
                        Khách đã yêu cầu trả hàng. Chấp nhận để tạo phiếu hoàn tiền (chờ bạn chuyển
                        khoản / xử lý trên cổng thanh toán), hoặc từ chối để đơn tiếp tục ở trạng thái
                        đang giao.
                      </p>
                    )}
                    {selectedOrder.status === ORDER_STATUS.RETURN_ACCEPTED && (
                      <p className="mb-3 text-xs" style={{ color: textColor, opacity: 0.8 }}>
                        Đơn đã chấp nhận trả hàng. Sau khi đã chuyển khoản hoàn tiền (hoặc hoàn qua
                        VNPay thủ công trên cổng), hãy bấm «Đã hoàn tiền» — hệ thống sẽ cập nhật trạng
                        thái và hoàn tồn kho.
                      </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {selectedOrder.status === ORDER_STATUS.RETURN_REQUESTED && (
                        <>
                          <button
                            type="button"
                            disabled={statusMutation.isPending || returnRefundBusy}
                            onClick={() => acceptReturnMutation.mutate(selectedOrder.id)}
                            className="rounded-md px-4 py-2 font-semibold"
                            style={{
                              backgroundColor: "#ecfdf5",
                              color: "#065f46",
                              border: "1px solid #10b981",
                              fontSize: baseSize * 0.9,
                            }}
                          >
                            Chấp nhận trả hàng
                          </button>
                          <button
                            type="button"
                            disabled={statusMutation.isPending || returnRefundBusy}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Từ chối yêu cầu trả hàng? Đơn sẽ quay lại trạng thái đang giao.",
                                )
                              ) {
                                rejectReturnMutation.mutate(selectedOrder.id);
                              }
                            }}
                            className="rounded-md px-4 py-2 font-semibold"
                            style={{
                              backgroundColor: "#fef2f2",
                              color: "#991b1b",
                              border: "1px solid #f87171",
                              fontSize: baseSize * 0.9,
                            }}
                          >
                            Từ chối yêu cầu
                          </button>
                        </>
                      )}
                      {selectedOrder.status === ORDER_STATUS.RETURN_ACCEPTED && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending || returnRefundBusy}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Xác nhận đã hoàn đủ tiền cho khách? Hành động này sẽ đóng đơn (đã hoàn tiền) và hoàn tồn kho.",
                              )
                            ) {
                              completeRefundMutation.mutate(selectedOrder.id);
                            }
                          }}
                          className="rounded-md px-4 py-2 font-semibold"
                          style={{
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor,
                            border: `1px solid ${primaryColor}`,
                            fontSize: baseSize * 0.9,
                          }}
                        >
                          Đã hoàn tiền cho khách
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {(SELLER_NEXT_STATUSES[selectedOrder.status] || []).length === 0 &&
                  selectedOrder.status !== ORDER_STATUS.RETURN_REQUESTED &&
                  selectedOrder.status !== ORDER_STATUS.RETURN_ACCEPTED &&
                  selectedOrder.status !== ORDER_STATUS.REFUNDED && (
                  <p style={{ fontSize: baseSize * 0.9, color: textColor, opacity: 0.75 }}>
                    Không có thao tác chuyển trạng thái tiếp theo cho shop ở trạng thái này.
                  </p>
                )}
                {selectedOrder.status === ORDER_STATUS.REFUNDED && (
                  <p style={{ fontSize: baseSize * 0.9, color: textColor, opacity: 0.75 }}>
                    Đơn đã hoàn tiền — không còn thao tác.
                  </p>
                )}
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
