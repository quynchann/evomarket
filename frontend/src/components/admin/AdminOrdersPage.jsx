import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/services/adminApi'

const fmtVnd = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(n) || 0,
  )

const STATUS_LABEL = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  RETURN_REQUESTED: 'Trả hàng',
  RETURN_ACCEPTED: 'Chấp nhận trả hàng',
  REFUNDED: 'Đã hoàn tiền',
}

const STATUSES = [
  '',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURN_ACCEPTED',
  'REFUNDED',
]

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orders', page, status],
    queryFn: async () => {
      const res = await adminApi.getOrders({
        page,
        limit: 15,
        ...(status ? { status } : {}),
      })
      return res.data
    },
  })

  const orders = data?.orders ?? []
  const pg = data?.pagination

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="mt-1 text-sm text-gray-600">Toàn bộ đơn trên sàn (chỉ xem)</p>
      </header>

      <div className="p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">
            Trạng thái:{' '}
            <select
              className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}>
              {STATUSES.map((st) => (
                <option key={st || 'all'} value={st}>
                  {st ? STATUS_LABEL[st] ?? st : 'Tất cả'}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && <p className="text-gray-600">Đang tải…</p>}
        {isError && <p className="text-red-600">Không tải được danh sách đơn.</p>}

        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Khách</th>
                    <th className="px-4 py-3">Shop (dòng đầu)</th>
                    <th className="px-4 py-3">Tổng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Tạo lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => {
                    const first = o.OrderItems?.[0]
                    const seller = first?.Seller
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-medium">#{o.id}</td>
                        <td className="px-4 py-3">
                          <div>{o.Buyer?.fullname ?? '—'}</div>
                          <div className="text-xs text-gray-400">{o.Buyer?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {seller?.shop_name || seller?.fullname || '—'}
                        </td>
                        <td className="px-4 py-3">{fmtVnd(o.total_price)}</td>
                        <td className="px-4 py-3">{STATUS_LABEL[o.status] ?? o.status}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <p className="py-10 text-center text-gray-500">Không có đơn.</p>
            )}
            {pg && pg.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
                <span className="text-gray-500">
                  Trang {pg.page} / {pg.totalPages} ({pg.total} đơn)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    className="rounded border px-3 py-1 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= pg.totalPages}
                    className="rounded border px-3 py-1 disabled:opacity-40"
                    onClick={() => setPage((p) => p + 1)}>
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
