import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Settings, CheckCheck } from 'lucide-react'
import { notificationApi } from '@/services/notificationApi'

function formatRelativeTime(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ''
  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 45) return 'Vừa xong'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

const TYPE_LABELS = {
  order_status: 'Đơn hàng',
  system_announcement: 'Hệ thống',
  promotion: 'Ưu đãi',
  maintenance: 'Bảo trì',
}

export default function SystemNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const res = await notificationApi.list({ limit: 50, offset: 0 })
      return res?.data ?? { notifications: [], total: 0 }
    },
  })

  const notifications = data?.notifications ?? []

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    },
  })

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h2 className="mb-1 text-2xl font-bold text-gray-800">
                  Thông báo từ hệ thống
                </h2>
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
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-200 hover:bg-orange-50/50 disabled:cursor-not-allowed disabled:opacity-50">
                  <CheckCheck className="h-4 w-4" />
                  Đánh dấu đã đọc
                </button>
                <Link
                  to="/customer/notification-settings"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 transition hover:border-orange-300 hover:bg-orange-100">
                  <Settings className="h-4 w-4" />
                  Cài đặt thông báo
                </Link>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Danh sách thông báo
            </h3>
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
                  Khi có sự kiện (ví dụ đơn hàng đổi trạng thái), tin sẽ lưu tại
                  đây.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => {
                  const key = n.id
                  const time = formatRelativeTime(n.createdAt)
                  const typeLabel =
                    TYPE_LABELS[n.type] ||
                    (n.type
                      ? String(n.type).replace(/_/g, ' ')
                      : 'Thông báo')
                  const unread = !n.readAt

                  return (
                    <li
                      key={key}
                      className={`rounded-xl border-2 p-4 transition hover:shadow-sm ${
                        unread
                          ? 'border-orange-200 bg-orange-50/40'
                          : 'border-gray-100 bg-gray-50/30'
                      }`}>
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                          📢
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-200">
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
                          <h4 className="font-semibold text-gray-900">
                            {n.title || 'Thông báo'}
                          </h4>
                          {n.message ? (
                            <p className="mt-1 text-sm text-gray-600">
                              {n.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
