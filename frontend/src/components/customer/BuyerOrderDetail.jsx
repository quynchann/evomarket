import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  History,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { orderApi } from "../../services/orderApi";
import { reviewApi } from "../../services/reviewApi.js";
import { ORDER_STATUS, ORDER_STATUS_VI, normalizeOrderStatus } from "../../constants/orderStatus";
import { toast } from "sonner";

const ACTOR_VI = {
  buyer: "Người mua",
  seller: "Người bán",
  system: "Hệ thống",
};

const REFUND_STATUS_VI = {
  Pending: "Chờ shop hoàn tiền",
  Approved: "Đã hoàn tiền",
  Rejected: "Từ chối hoàn tiền",
};

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}

/** Khối đánh giá một dòng đơn — chỉ hiện khi đơn COMPLETED; sau khi gửi chỉ xem, không sửa */
function OrderLineReviewForm({ line, orderNumericId, queryClient }) {
  const existing = line.review ?? null;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitMut = useMutation({
    mutationFn: async () =>
      reviewApi.create({
        order_item_id: line.id,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-order", orderNumericId] });
      if (line.product_id != null) {
        queryClient.invalidateQueries({ queryKey: ["product", String(line.product_id)] });
        queryClient.invalidateQueries({ queryKey: ["product-reviews", String(line.product_id)] });
      }
      const sid = line.seller_id ?? line.Seller?.id;
      if (sid != null) {
        queryClient.invalidateQueries({ queryKey: ["shop-profile", Number(sid)] });
        queryClient.invalidateQueries({ queryKey: ["shop-products", Number(sid)] });
      }
      toast.success("Cảm ơn bạn đã đánh giá");
    },
    onError: (err) => {
      toast.error(err?.message || "Không gửi được đánh giá");
    },
  });

  if (line?.id == null) return null;

  if (existing) {
    const r = Number(existing.rating) || 0;
    return (
      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <p className="text-xs font-semibold text-gray-800">Đánh giá của bạn</p>
        <div className="mt-2 flex flex-wrap items-center gap-1" aria-label={`${r} trên 5 sao`}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`text-xl leading-none ${s <= r ? "text-amber-500" : "text-gray-300"}`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-xs text-gray-600">{r}/5</span>
        </div>
        {existing.comment ? (
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{existing.comment}</p>
        ) : null}
        <p className="mt-2 text-[11px] text-gray-500">Đánh giá đã gửi, không thể chỉnh sửa.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
      <p className="text-xs font-semibold text-gray-800">Đánh giá sản phẩm</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            disabled={submitMut.isPending}
            onClick={() => setRating(s)}
            className={`rounded px-1 text-xl leading-none transition ${
              s <= rating ? "text-amber-500" : "text-gray-300 hover:text-amber-200"
            }`}
            aria-label={`${s} sao`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 self-center text-xs text-gray-600">{rating}/5</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitMut.isPending}
        placeholder="Nhận xét (tuỳ chọn)"
        rows={2}
        className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400"
      />
      <button
        type="button"
        disabled={submitMut.isPending}
        onClick={() => submitMut.mutate()}
        className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50"
      >
        {submitMut.isPending ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </div>
  );
}

function paymentLabel(method) {
  const m = String(method || "").toLowerCase();
  if (m === "online") return "Thanh toán trực tuyến (VNPay)";
  return "Thanh toán khi nhận hàng (COD)";
}

/** Gói Payment từ GET /orders/:id (sau khi backend include Payment) */
function orderPaymentRecord(order) {
  if (!order) return null;
  return order.Payment ?? order.payment ?? null;
}

function isOnlinePaymentPaid(order) {
  const pm = String(order?.payment_method || "").toLowerCase();
  if (pm !== "online") return false;
  const pay = orderPaymentRecord(order);
  return pay?.status === "Success";
}

function isOnlinePaymentPending(order) {
  const pm = String(order?.payment_method || "").toLowerCase();
  if (pm !== "online") return false;
  const pay = orderPaymentRecord(order);
  return !pay || pay.status === "Pending";
}

function isOnlinePaymentFailed(order) {
  const pm = String(order?.payment_method || "").toLowerCase();
  if (pm !== "online") return false;
  const pay = orderPaymentRecord(order);
  return pay?.status === "Failed";
}

function isOnlinePaymentRefunded(order) {
  const pm = String(order?.payment_method || "").toLowerCase();
  if (pm !== "online") return false;
  const pay = orderPaymentRecord(order);
  return !!(pay && pay.refunded_at);
}

export default function BuyerOrderDetail() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const queryClient = useQueryClient();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["buyer-order", id],
    queryFn: async () => {
      const res = await orderApi.getById(id);
      return res.data?.order ?? null;
    },
    enabled: Number.isFinite(id) && id > 0,
  });

  const confirmMut = useMutation({
    mutationFn: () => orderApi.confirmDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-order", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
    },
  });

  const returnMut = useMutation({
    mutationFn: () => orderApi.requestReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-order", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => orderApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-order", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
      toast.success("Đã hủy đơn hàng");
      setCancelConfirmOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Không hủy được đơn hàng");
      setCancelConfirmOpen(false);
    },
  });

  const invalidId = !Number.isFinite(id) || id <= 0;

  const histories =
    order?.OrderStatusHistories ?? order?.orderStatusHistories ?? [];

  const refunds = order?.Refunds ?? order?.refunds ?? [];

  const statusNorm = order ? normalizeOrderStatus(order.status) : null;

  const onlinePaid = order ? isOnlinePaymentPaid(order) : false;
  const onlinePending = order ? isOnlinePaymentPending(order) : false;
  const onlineFailed = order ? isOnlinePaymentFailed(order) : false;
  const onlineRefunded = order ? isOnlinePaymentRefunded(order) : false;

  const showReturnRefundPanel =
    order &&
    (refunds.length > 0 ||
      statusNorm === ORDER_STATUS.RETURN_REQUESTED ||
      statusNorm === ORDER_STATUS.RETURN_ACCEPTED ||
      statusNorm === ORDER_STATUS.REFUNDED ||
      (statusNorm === ORDER_STATUS.CANCELLED && refunds.length > 0));

  const canCancel =
    order &&
    (statusNorm === ORDER_STATUS.PENDING_CONFIRMATION ||
      statusNorm === ORDER_STATUS.CONFIRMED);

  const canConfirmShipped = order && statusNorm === ORDER_STATUS.SHIPPED;

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Link
              to="/customer/orders"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Đơn hàng của tôi
            </Link>
          </div>

          {invalidId && (
            <p className="rounded-xl bg-white p-6 text-center text-red-600 shadow-md">
              Mã đơn không hợp lệ.
            </p>
          )}

          {!invalidId && isLoading && (
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
            </div>
          )}

          {!invalidId && !isLoading && error && (
            <div className="rounded-xl bg-white p-8 text-center shadow-md">
              <p className="text-red-600">{error.message || "Không tải được chi tiết đơn hàng"}</p>
              <Link
                to="/customer/orders"
                className="mt-4 inline-block text-sm font-medium text-orange-600 hover:underline"
              >
                Quay lại danh sách
              </Link>
            </div>
          )}

          {!invalidId && !isLoading && !error && order && (
            <>
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Chi tiết đơn #{order.id}</h1>
                      <p className="mt-1 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-sm font-medium text-orange-800">
                        {ORDER_STATUS_VI[statusNorm] || statusNorm}
                      </p>
                      {(order.created_at || order.createdAt) && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.created_at || order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Tổng thanh toán</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(order.total_price)}</p>
                    <p className="mt-1 text-xs text-gray-600">{paymentLabel(order.payment_method)}</p>
                    {onlineRefunded && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-900">
                        <Banknote className="h-3.5 w-3.5" />
                        Đã hoàn tiền (VNPay)
                      </p>
                    )}
                    {onlinePaid && !onlineRefunded && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đã thanh toán
                      </p>
                    )}
                    {onlineFailed && (
                      <p className="mt-2 text-xs font-medium text-red-700">Thanh toán online không thành công</p>
                    )}
                    {onlinePending && !onlineFailed && (
                      <p className="mt-2 text-xs font-medium text-amber-700">Chưa hoàn tất thanh toán online</p>
                    )}
                  </div>
                </div>

                {(order.carrier_name || order.tracking_number) && (
                  <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-gray-800">
                    <p className="flex items-center gap-2 font-semibold text-amber-900">
                      <Truck className="h-4 w-4" />
                      Theo dõi vận chuyển
                    </p>
                    {order.carrier_name && (
                      <p className="mt-2">
                        Đơn vị: <span className="font-medium">{order.carrier_name}</span>
                      </p>
                    )}
                    {order.tracking_number && (
                      <p className="mt-1 font-mono text-xs sm:text-sm">
                        Mã vận đơn: {order.tracking_number}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800">Giao hàng</h2>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-700">
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      <User className="h-4 w-4 shrink-0 text-orange-600" />
                      {order.fullname || "—"}
                    </p>
                    <p className="mt-2 flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-orange-600" />
                      {order.phone || "—"}
                    </p>
                    <p className="mt-2 flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                      <span>{order.address || "—"}</span>
                    </p>
                    {order.email && <p className="mt-2 text-xs text-gray-500">{order.email}</p>}
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h2 className="text-sm font-semibold text-gray-800">Chi tiết thanh toán</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4 text-gray-700">
                      <dt>Trạng thái thanh toán</dt>
                      <dd className="font-medium text-gray-900">
                        {onlineRefunded ? (
                          <span className="text-violet-800">Đã hoàn tiền qua VNPay</span>
                        ) : onlinePaid ? (
                          <span className="text-emerald-700">Đã thanh toán</span>
                        ) : onlineFailed ? (
                          <span className="text-red-700">Thanh toán online không thành công</span>
                        ) : String(order.payment_method || "").toLowerCase() === "online" ? (
                          <span className="text-amber-700">Chưa hoàn tất thanh toán online</span>
                        ) : (
                          <span>Thanh toán khi nhận hàng</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 text-gray-700">
                      <dt>Tạm tính</dt>
                      <dd className="font-medium text-gray-900">
                        {formatPrice(
                          (order.OrderItems || order.orderItems || []).reduce(
                            (acc, l) => acc + Number(l.total_price || 0),
                            0,
                          ),
                        )}
                      </dd>
                    </div>
                    {Number(order.coupon_discount) > 0 && (
                      <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Giảm voucher</dt>
                        <dd className="font-medium">−{formatPrice(order.coupon_discount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 text-gray-700">
                      <dt>
                        Phí vận chuyển
                        <span className="mt-0.5 block text-xs font-normal text-gray-500">
                          {order.shipping_method_ui === "express"
                            ? "Giao nhanh (ước tính)"
                            : "Tiêu chuẩn"}
                        </span>
                      </dt>
                      <dd className="font-medium text-gray-900">
                        {Number(order.shipping_fee) > 0 ? formatPrice(order.shipping_fee) : "Miễn phí"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                      <dt>Tổng thanh toán</dt>
                      <dd>{formatPrice(order.total_price)}</dd>
                    </div>
                  </dl>
                </div>

              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <History className="h-4 w-4 text-orange-600" />
                  Tiến trình xử lý đơn
                </h2>
                {histories.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có lịch sử trạng thái.</p>
                ) : (
                  <ul className="space-y-4 border-l-2 border-orange-100 pl-4">
                    {histories.map((row) => (
                      <li key={row.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-white" />
                        <p className="text-xs text-gray-500">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString("vi-VN")
                            : "—"}
                          {" · "}
                          <span className="font-medium text-gray-700">
                            {ACTOR_VI[row.actor_type] || row.actor_type}
                          </span>
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                          {ORDER_STATUS_VI[row.to_status] || row.to_status}
                        </p>
                        {row.note && <p className="mt-1 text-xs text-gray-600">{row.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {showReturnRefundPanel && (
                <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-md">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Banknote className="h-4 w-4 text-violet-600" />
                    Trả hàng và hoàn tiền
                  </h2>
                  {statusNorm === ORDER_STATUS.CANCELLED && refunds.length > 0 && (
                    <p className="mb-3 text-sm text-emerald-800">
                      Đơn đã hủy. Nếu bạn đã thanh toán online, khoản tiền đã được gửi yêu cầu hoàn qua VNPay —
                      vui lòng kiểm tra ví / tài khoản ngân hàng.
                    </p>
                  )}
                  {statusNorm === ORDER_STATUS.RETURN_REQUESTED && (
                    <p className="mb-3 text-sm text-gray-600">
                      Yêu cầu trả hàng đã được gửi. Shop sẽ chấp nhận hoặc từ chối; nếu chấp nhận, bạn
                      sẽ thấy số tiền hoàn và trạng thái hoàn tiền bên dưới.
                    </p>
                  )}
                  {statusNorm === ORDER_STATUS.RETURN_ACCEPTED && refunds.length > 0 && (
                    <p className="mb-3 text-sm text-amber-800">
                      Shop đã chấp nhận trả hàng. Vui lòng gửi lại hàng theo hướng dẫn của shop (nếu có) và
                      chờ shop xác nhận đã chuyển khoản / hoàn qua cổng thanh toán.
                    </p>
                  )}
                  {statusNorm === ORDER_STATUS.REFUNDED && (
                    <p className="mb-3 text-sm text-emerald-800">
                      Đơn đã được đánh dấu hoàn tiền. Kiểm tra tài khoản ngân hàng hoặc ví thanh toán của
                      bạn.
                    </p>
                  )}
                  {refunds.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Chưa có bản ghi hoàn tiền (shop chưa chấp nhận yêu cầu trả hàng).
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {refunds.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-semibold text-gray-900">
                              {formatPrice(r.amount)}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-violet-200">
                              {REFUND_STATUS_VI[r.status] || r.status}
                            </span>
                          </div>
                          {r.reason && (
                            <p className="mt-1 text-xs text-gray-600">Ghi chú: {r.reason}</p>
                          )}
                          {r.created_at && (
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(r.created_at).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Truck className="h-4 w-4 text-orange-600" />
                  Sản phẩm
                </h2>
                <ul className="divide-y divide-gray-100">
                  {(order.OrderItems || order.orderItems || []).map((line) => {
                    const title = line.product_title || `Sản phẩm #${line.product_id}`;
                    const thumb = line.product_thumbnail || "https://via.placeholder.com/80";
                    const unit =
                      line.selling_price != null ? line.selling_price : line.price ?? 0;
                    const sellerName =
                      (line.Seller?.shop_name && String(line.Seller.shop_name).trim()) ||
                      line.Seller?.fullname ||
                      line.seller?.fullname;
                    return (
                      <li
                        key={line.id ?? `${line.product_id}-${line.variant_id}`}
                        className="flex flex-wrap gap-4 border-b border-gray-100 py-4 first:pt-0 last:border-b-0 last:pb-0"
                      >
                        <img
                          src={thumb}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-lg border border-gray-100 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">{title}</p>
                          {line.variant_name && (
                            <p className="mt-0.5 text-xs text-gray-500">{line.variant_name}</p>
                          )}
                          {sellerName && (
                            <p className="mt-1 text-xs text-gray-600">
                              Shop: <span className="font-medium">{sellerName}</span>
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-600">
                            SL: {line.quantity} × {formatPrice(unit)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-gray-900">{formatPrice(line.total_price)}</p>
                        </div>
                        {statusNorm === ORDER_STATUS.COMPLETED && (
                          <div className="basis-full mt-4 w-full border-t border-gray-100 pt-3">
                            <OrderLineReviewForm
                              line={line}
                              orderNumericId={id}
                              queryClient={queryClient}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {(canCancel || canConfirmShipped) && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
                  <h2 className="mb-1 text-sm font-semibold text-gray-800">Thao tác đơn hàng</h2>

                  {canConfirmShipped && (
                    <>
                      <p className="mb-4 text-xs text-gray-500">
                        Xác nhận đã nhận hàng hoặc gửi yêu cầu trả hàng khi đơn đang được giao.
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          disabled={confirmMut.isPending || returnMut.isPending}
                          onClick={() => confirmMut.mutate()}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Đã nhận được hàng
                        </button>
                        <button
                          type="button"
                          disabled={confirmMut.isPending || returnMut.isPending}
                          onClick={() => {
                            if (window.confirm("Bạn xác nhận muốn yêu cầu trả hàng cho đơn này?")) {
                              returnMut.mutate();
                            }
                          }}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-900 hover:bg-violet-100 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Yêu cầu trả hàng
                        </button>
                      </div>
                    </>
                  )}

                  {canCancel && (
                    <>
                      <p className="mb-4 text-xs text-gray-500">
                        Chỉ hủy được khi shop chưa bắt đầu chuẩn bị hàng (chờ xác nhận hoặc đã xác nhận).
                      </p>
                      <button
                        type="button"
                        disabled={cancelMut.isPending}
                        onClick={() => setCancelConfirmOpen(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 shrink-0" />
                        Hủy đơn hàng
                      </button>
                    </>
                  )}

                  {(confirmMut.isError || returnMut.isError || cancelMut.isError) && (
                    <p className="mt-4 text-center text-sm text-red-600">
                      {(confirmMut.error || returnMut.error || cancelMut.error)?.message ||
                        "Thao tác thất bại"}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {cancelConfirmOpen && order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
          role="presentation"
          onClick={() => !cancelMut.isPending && setCancelConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="cancel-order-title" className="text-lg font-semibold text-gray-900">
                  Xác nhận hủy đơn?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {onlinePaid
                    ? "Đơn đã thanh toán online. Sau khi hủy, hệ thống sẽ gửi yêu cầu hoàn tiền qua VNPay. Thao tác này không thể hoàn tác."
                    : "Bạn có chắc muốn hủy đơn hàng này? Đơn sẽ được hủy và không thể khôi phục."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelMut.isPending}
                onClick={() => setCancelConfirmOpen(false)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Giữ đơn
              </button>
              <button
                type="button"
                disabled={cancelMut.isPending}
                onClick={() => cancelMut.mutate()}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
              >
                {cancelMut.isPending ? "Đang xử lý…" : "Hủy đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
