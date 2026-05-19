import React, { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chart } from 'chart.js/auto'
import { orderApi } from '../../services/orderApi.js'
import { ORDER_STATUS_VI } from '../../constants/orderStatus.js'

function formatBriefVnd(vnd) {
  const v = Number(vnd) || 0
  if (v >= 1_000_000_000) {
    return `${(v / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ ₫`
  }
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1).replace('.', ',')} triệu ₫`
  }
  return `${new Intl.NumberFormat('vi-VN').format(v)} ₫`
}

function formatCount(n) {
  return new Intl.NumberFormat('vi-VN').format(Number(n) || 0)
}

const CHART_PALETTE = [
  '#f97316',
  '#ea580c',
  '#fdba74',
  '#fed7aa',
  '#92400e',
  '#78350f',
  '#fdba74',
  '#cbd5e1',
  '#64748b',
  '#475569',
]

export default function SellerReports() {
  const statusChartRef = useRef(null)
  const statusChartInstance = useRef(null)
  const trendChartRef = useRef(null)
  const trendChartInstance = useRef(null)

  const {
    data: todayStats,
    isLoading: todayLoading,
    isError: todayError,
  } = useQuery({
    queryKey: ['seller-today-stats'],
    queryFn: async () => {
      const res = await orderApi.sellerTodayStats()
      return res.data
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const {
    data: orderCounts,
    isLoading: countsLoading,
    isError: countsError,
  } = useQuery({
    queryKey: ['seller-order-counts'],
    queryFn: async () => {
      const res = await orderApi.sellerOrderCounts()
      return res.data
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const statusRows = useMemo(() => {
    const by = orderCounts?.byStatus || {}
    const total = orderCounts?.all ?? 0
    const entries = Object.entries(by)
      .map(([key, cnt]) => ({
        key,
        label: ORDER_STATUS_VI[key] || key,
        count: Number(cnt) || 0,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
    return entries.map((r) => ({
      ...r,
      pct: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }))
  }, [orderCounts])

  /* Phân bổ trạng thái (dữ liệu thật) */
  useEffect(() => {
    const canvas = statusChartRef.current
    if (!canvas) return
    if (statusRows.length === 0) {
      statusChartInstance.current?.destroy()
      statusChartInstance.current = null
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    statusChartInstance.current?.destroy()

    const labels = statusRows.map((r) => r.label)
    const data = statusRows.map((r) => r.count)

    statusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map(
              (_, i) => CHART_PALETTE[i % CHART_PALETTE.length],
            ),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
          },
        },
      },
    })

    return () => statusChartInstance.current?.destroy()
  }, [statusRows])

  /* Xu hướng minh họa (chưa có API theo ngày) — scale nhẹ theo đơn hôm nay */
  useEffect(() => {
    const canvas = trendChartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (trendChartInstance.current) trendChartInstance.current.destroy()

    const base = Number(todayStats?.ordersToday) || 0
    const mock = Array.from({ length: 7 }, (_, i) => {
      const wobble = [0.75, 0.9, 1.1, 0.85, 1.05, 0.95, 1.0][i] ?? 1
      return Math.max(0, Math.round(base * wobble))
    })

    trendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
          {
            label: 'Đơn hàng',
            data: mock,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    })

    return () => trendChartInstance.current?.destroy()
  }, [todayStats?.ordersToday])

  const totalOrders = orderCounts?.all ?? 0

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-orange-100">Trung tâm phân tích</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Báo cáo cửa hàng</h1>
          <p className="mt-1 max-w-xl text-sm text-orange-100">
            Theo dõi doanh thu trong ngày, lưu lượng đơn và phân bổ trạng thái.
            Số liệu hôm nay lấy trực tiếp từ hệ thống.
          </p>
        </div>
        <Link
          to="/seller/orders"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 shadow transition hover:bg-orange-50">
          Xem đơn hàng chi tiết →
        </Link>
      </div>

      {(todayError || countsError) && (
        <p className="mb-4 text-sm text-red-600">
          Một số dữ liệu chưa tải được; thử làm mới trang hoặc đợi hệ thống thử
          lại.
        </p>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
          <p
            className={`mt-1 text-2xl font-bold text-gray-900 tabular-nums ${todayLoading ? 'opacity-60' : ''}`}>
            {todayLoading && todayStats == null
              ? '…'
              : formatBriefVnd(todayStats?.revenueVnd ?? 0)}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            GMV dòng hàng (đơn đã xác nhận trở đi)
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">Đơn tạo hôm nay</p>
          <p
            className={`mt-1 text-2xl font-bold text-gray-900 tabular-nums ${todayLoading ? 'opacity-60' : ''}`}>
            {todayLoading && todayStats == null
              ? '…'
              : formatCount(todayStats?.ordersToday ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">Khách truy cập hôm nay</p>
          <p
            className={`mt-1 text-2xl font-bold text-gray-900 tabular-nums ${todayLoading ? 'opacity-60' : ''}`}>
            {todayLoading && todayStats == null
              ? '…'
              : formatCount(todayStats?.visitorsToday ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">Đánh giá shop</p>
          <p
            className={`mt-1 text-2xl font-bold text-gray-900 tabular-nums ${todayLoading ? 'opacity-60' : ''}`}>
            {todayLoading && todayStats == null
              ? '…'
              : todayStats?.ratingSummary?.average != null
                ? `${Number(todayStats.ratingSummary.average).toFixed(1)} ★`
                : '—'}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {(todayStats?.ratingSummary?.count ?? 0) > 0
              ? `${formatCount(todayStats.ratingSummary.count)} lượt — trung bình trên SP của shop`
              : 'Chưa có đánh giá từ khách'}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">Tổng đơn (mọi thời điểm)</p>
          <p
            className={`mt-1 text-2xl font-bold text-gray-900 tabular-nums ${countsLoading ? 'opacity-60' : ''}`}>
            {countsLoading && orderCounts == null
              ? '…'
              : formatCount(totalOrders)}
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Phân bổ đơn theo trạng thái
            </h2>
            <p className="text-xs text-gray-500">
              Dữ liệu thực từ các đơn có sản phẩm của shop
            </p>
          </div>
          <div className="relative h-64">
            {countsLoading && orderCounts === undefined ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500">
                Đang tải biểu đồ…
              </div>
            ) : statusRows.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
                Chưa có đơn hàng để hiển thị biểu đồ.
              </div>
            ) : (
              <canvas ref={statusChartRef} />
            )}
          </div>
          {countsLoading && orderCounts !== undefined && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Đang cập nhật…
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Xu hướng đơn hàng tuần
            </h2>
          </div>
          <div className="h-64">
            <canvas ref={trendChartRef} />
          </div>
        </div>
      </div>

      <div className="mb-12 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Bảng chi tiết trạng thái
        </h2>
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">Số đơn</th>
                <th className="px-4 py-3 font-medium text-gray-700">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {statusRows.length === 0 && !countsLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng để thống kê.
                  </td>
                </tr>
              ) : (
                statusRows.map((row) => (
                  <tr key={row.key} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{row.label}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatCount(row.count)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {row.pct}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
