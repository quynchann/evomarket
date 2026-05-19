import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { notificationApi } from "../../services/notificationApi.js";

function formatRelativeTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

const TYPE_LABELS = {
  order_status: "Đơn hàng",
  system_announcement: "Hệ thống",
  promotion: "Ưu đãi",
  maintenance: "Bảo trì",
};

/** Trang thông báo đã lưu trong DB — đồng bộ realtime qua /system socket. */
export default function SellerNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const res = await notificationApi.list({ limit: 50, offset: 0 });
      return res?.data ?? { notifications: [], total: 0 };
    },
  });

  const notifications = data?.notifications ?? [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-orange-100/80 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Thông báo từ hệ thống
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Cập nhật chính sách, bảo trì và tin quan trọng dành cho kênh bán.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={
                  markAllMutation.isPending ||
                  notifications.length === 0 ||
                  !notifications.some((n) => !n.readAt)
                }
                onClick={() => markAllMutation.mutate()}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-200 hover:bg-orange-50/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                Đánh dấu đã đọc hết
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
                <Bell className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100/80 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Danh sách thông báo
          </h2>

          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải…</p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              Không tải được danh sách. Thử tải lại trang.
            </p>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-700">Chưa có thông báo</p>
              <p className="mt-1 text-sm text-gray-500">
                Khi hệ thống hoặc đơn hàng có cập nhật, tin sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => {
                const time = formatRelativeTime(n.createdAt);
                const typeLabel =
                  TYPE_LABELS[n.type] ||
                  (n.type
                    ? String(n.type).replace(/_/g, " ")
                    : "Thông báo");
                const unread = !n.readAt;

                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      disabled={markOneMutation.isPending}
                      onClick={() => {
                        if (unread) markOneMutation.mutate(n.id);
                      }}
                      className={`w-full rounded-xl border-2 p-4 text-left transition hover:shadow-sm ${
                        unread
                          ? "border-orange-200 bg-orange-50/40"
                          : "border-gray-100 bg-gray-50/30"
                      } ${unread ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                          📢
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-orange-800 ring-1 ring-orange-200">
                              {typeLabel}
                            </span>
                            {time ? (
                              <span className="text-xs text-gray-500">
                                {time}
                              </span>
                            ) : null}
                            {unread ? (
                              <span className="h-2 w-2 rounded-full bg-orange-500" />
                            ) : null}
                          </div>
                          <p className="font-semibold text-gray-900">
                            {n.title || "Thông báo"}
                          </p>
                          {n.message ? (
                            <p className="mt-1 text-sm text-gray-600">
                              {n.message}
                            </p>
                          ) : null}
                          {unread ? (
                            <p className="mt-2 text-xs text-orange-700/90">
                              Nhấn để đánh dấu đã đọc
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
