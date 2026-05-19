import { createElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Receipt,
  ShoppingBag,
  Users,
  Wallet,
} from 'lucide-react'
import { adminApi } from '@/services/adminApi'
import { useAuthStore } from '@/stores/useAuthStore'

const fmtVnd = (n) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)

const STATUS_LABEL = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  RETURN_REQUESTED: 'Trả hàng',
  RETURN_ACCEPTED: 'Chấp nhận trả',
  REFUNDED: 'Đã hoàn tiền',
}

/** Màu nền + chữ cho badge trạng thái đơn */
const ORDER_BADGE = {
  PENDING_CONFIRMATION: 'bg-amber-100 text-amber-900 ring-amber-200',
  CONFIRMED: 'bg-sky-100 text-sky-900 ring-sky-200',
  PREPARING: 'bg-blue-100 text-blue-900 ring-blue-200',
  SHIPPED: 'bg-violet-100 text-violet-900 ring-violet-200',
  COMPLETED: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  CANCELLED: 'bg-red-100 text-red-900 ring-red-200',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-900 ring-orange-200',
  RETURN_ACCEPTED: 'bg-orange-50 text-orange-800 ring-orange-200',
  REFUNDED: 'bg-gray-100 text-gray-800 ring-gray-200',
}

/** Màu cột trong biểu đồ đếm đơn theo status */
const STATUS_BAR = {
  PENDING_CONFIRMATION: 'bg-amber-400',
  CONFIRMED: 'bg-sky-400',
  PREPARING: 'bg-blue-500',
  SHIPPED: 'bg-violet-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  RETURN_REQUESTED: 'bg-orange-500',
  RETURN_ACCEPTED: 'bg-orange-400',
  REFUNDED: 'bg-gray-400',
}

function fmtPeriod(period) {
  if (!period?.from || !period?.to) return null
  const from = new Date(period.from)
  const to = new Date(period.to)
  return `${from.toLocaleDateString('vi-VN')} – ${to.toLocaleDateString('vi-VN')}`
}

function Skeleton() {
  return (
    <div className="animate-pulse px-8 pb-8">
      <div className="h-10 max-w-md rounded-lg bg-gray-200" />
      <div className="mt-2 h-5 max-w-xs rounded bg-gray-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-gray-100" />
        <div className="h-72 rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, hint, tint }) {
  const tints = {
    orange: 'from-orange-500 to-amber-500 shadow-orange-500/20',
    slate: 'from-slate-700 to-slate-600 shadow-slate-500/15',
    emerald: 'from-emerald-600 to-teal-500 shadow-emerald-500/15',
    violet: 'from-violet-600 to-indigo-500 shadow-violet-500/15',
  }
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br p-6 text-white shadow-lg ${tints[tint]}`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/90">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {hint ? <p className="mt-2 text-xs text-white/75">{hint}</p> : null}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          {createElement(icon, { className: 'h-6 w-6 text-white', strokeWidth: 2 })}
        </div>
      </div>
    </div>
  )
}

function SecondaryStat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-500">{sub}</p> : null}
    </div>
  )
}

export default function AdminOverview() {
  const { user } = useAuthStore()
  const name = user?.fullname?.trim() || 'Admin'

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminApi.getStats()
      return res.data
    },
  })

  const { data: ordersRes } = useQuery({
    queryKey: ['admin', 'orders', 'dash', 1],
    queryFn: async () => {
      const res = await adminApi.getOrders({ page: 1, limit: 8 })
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-[50vh]">
        <header className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        </header>
        <Skeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8">
        <p className="text-center text-red-600">Không tải được thống kê admin.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
          Thử lại
        </button>
      </div>
    )
  }

  const s = data
  const orders = ordersRes?.orders ?? []
  const byStatus = s.order_by_status ?? {}
  const totalOrders = s.total_orders ?? 0
  const buyers = s.user_counts?.buyers ?? 0
  const sellers = s.user_counts?.sellers ?? 0
  const userTotal = buyers + sellers || 1
  const buyerPct = Math.round((buyers / userTotal) * 1000) / 10
  const sellerPct = Math.round((sellers / userTotal) * 1000) / 10

  const statusEntries = Object.entries(byStatus)
    .map(([st, c]) => ({ st, c: Number(c) || 0 }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c)

  const periodLabel = fmtPeriod(s.period)

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur supports-backdrop-filter:bg-white/80 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Bảng điều khiển</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">Xin chào, {name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              {periodLabel
                ? `Doanh thu & đơn hàng trong kỳ: ${periodLabel}.`
                : `Tổng quan tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}.`}
              {isFetching ? <span className="ml-2 text-orange-600">Đang làm mới…</span> : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700">
              Quản lý đơn
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/product-management"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/50">
              Sản phẩm
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-6 py-8 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Wallet}
            label="GMV (kỳ)"
            value={fmtVnd(s.gmv)}
            hint="Tổng giá trị hàng hóa ghi nhận trong kỳ"
            tint="orange"
          />
          <KpiCard
            icon={Receipt}
            label="Phí sàn (kỳ)"
            value={fmtVnd(s.platform_revenue)}
            hint="Doanh thu nền tảng từ phí giao dịch"
            tint="slate"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Tổng đơn hàng"
            value={String(totalOrders)}
            hint="Mọi trạng thái"
            tint="emerald"
          />
          <KpiCard
            icon={Users}
            label="Người dùng"
            value={`${buyers.toLocaleString('vi-VN')} / ${sellers.toLocaleString('vi-VN')}`}
            hint="Người mua / Người bán"
            tint="violet"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SecondaryStat
            label="Đơn có GMV (kỳ)"
            value={String(s.order_count_revenue ?? 0)}
            sub="Theo dòng order item trong kỳ doanh thu"
          />
          <SecondaryStat label="Sản phẩm đang bán" value={String(s.products_listed ?? 0)} />
          <SecondaryStat
            label="Đánh giá bị báo cáo"
            value={String(s.reviews_reported_pending ?? 0)}
            sub="Cần kiểm duyệt"
          />
          <Link
            to="/admin/review"
            className="flex flex-col justify-center rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm transition hover:border-amber-300 hover:bg-amber-50">
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Hàng đợi đánh giá
            </span>
            <span className="mt-1 text-xs text-amber-800/90">Mở trang đánh giá để xử lý</span>
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-900">Đơn theo trạng thái</h2>
              <span className="text-sm text-gray-500">{totalOrders.toLocaleString('vi-VN')} đơn</span>
            </div>
            {totalOrders > 0 && statusEntries.length > 0 ? (
              <>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
                  {statusEntries.map(({ st, c }) => (
                    <div
                      key={st}
                      title={`${STATUS_LABEL[st] ?? st}: ${c}`}
                      className={`h-full min-w-px ${STATUS_BAR[st] ?? 'bg-gray-400'}`}
                      style={{ width: `${(c / totalOrders) * 100}%` }}
                    />
                  ))}
                </div>
                <ul className="mt-5 space-y-3">
                  {statusEntries.map(({ st, c }) => (
                    <li key={st} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-gray-700">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_BAR[st] ?? 'bg-gray-400'}`}
                        />
                        <span className="truncate">{STATUS_LABEL[st] ?? st}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                        {c.toLocaleString('vi-VN')}
                        <span className="ml-1 font-normal text-gray-400">
                          ({Math.round((c / totalOrders) * 100)}%)
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-6 text-sm text-gray-500">Chưa có đơn hàng trong hệ thống.</p>
            )}
            <Link
              to="/admin/orders"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700">
              Xem tất cả đơn
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Cơ cấu người dùng</h2>
            <p className="mt-1 text-sm text-gray-500">Người mua và người bán đã đăng ký</p>
            <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-linear-to-r from-orange-500 to-orange-400" style={{ width: `${buyerPct}%` }} />
              <div className="h-full bg-linear-to-r from-violet-500 to-indigo-400" style={{ width: `${sellerPct}%` }} />
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Người mua</span>
                <span className="font-semibold text-gray-900">
                  {buyers.toLocaleString('vi-VN')}
                  <span className="ml-2 text-orange-600">({buyerPct}%)</span>
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Người bán</span>
                <span className="font-semibold text-gray-900">
                  {sellers.toLocaleString('vi-VN')}
                  <span className="ml-2 text-violet-600">({sellerPct}%)</span>
                </span>
              </li>
            </ul>
            <Link
              to="/admin/user-management"
              className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-800 transition hover:border-orange-200 hover:bg-orange-50/50">
              Quản lý người dùng
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Đơn gần đây</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Quản lý đơn →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Khách</th>
                  <th className="px-6 py-3 text-right">Tổng</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-orange-50/30">
                    <td className="px-6 py-3.5 font-mono font-semibold text-gray-900">#{o.id}</td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-gray-900">{o.Buyer?.fullname ?? '—'}</p>
                      {o.Buyer?.email ? (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">{o.Buyer.email}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-gray-900">
                      {fmtVnd(o.total_price)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${ORDER_BADGE[o.status] ?? 'bg-gray-100 text-gray-800 ring-gray-200'}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-gray-500">Chưa có đơn.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
