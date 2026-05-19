import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

export default function AdminReviewsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [reportedOnly, setReportedOnly] = useState('true')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page, reportedOnly],
    queryFn: async () => {
      const res = await adminApi.getReviews({
        page,
        limit: 15,
        reported_only: reportedOnly,
      })
      return res.data
    },
  })

  const mut = useMutation({
    mutationFn: async ({ id, patch }) => adminApi.patchReview(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Đã cập nhật đánh giá')
    },
    onError: (e) => toast.error(e.message || 'Lỗi'),
  })

  const reviews = data?.reviews ?? []
  const pg = data?.pagination

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá</h1>
        <p className="mt-1 text-sm text-gray-600">Xử lý báo cáo / duyệt nội dung</p>
      </header>

      <div className="space-y-4 p-8">
        <label className="text-sm text-gray-600">
          Lọc:{' '}
          <select
            className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            value={reportedOnly}
            onChange={(e) => {
              setReportedOnly(e.target.value)
              setPage(1)
            }}>
            <option value="true">Chỉ bị báo cáo</option>
            <option value="false">Tất cả</option>
          </select>
        </label>

        {isLoading && <p className="text-gray-600">Đang tải…</p>}
        {!isLoading && (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      SP: {r.Product?.title ?? `#${r.product_id}`} — {r.rating}★
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{r.comment || '(Không nội dung)'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {r.User?.fullname} • report: {String(r.is_reported)} • {r.report_status}
                      {r.report_reason ? ` — ${r.report_reason}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.is_reported && (
                      <>
                        <button
                          type="button"
                          className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800"
                          disabled={mut.isPending}
                          onClick={() =>
                            mut.mutate({
                              id: r.id,
                              patch: { report_status: 'Reviewed', is_reported: false },
                            })
                          }>
                          Gỡ báo cáo
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800"
                          disabled={mut.isPending}
                          onClick={() =>
                            mut.mutate({
                              id: r.id,
                              patch: { report_status: 'Rejected' },
                            })
                          }>
                          Vi phạm (Rejected)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="py-10 text-center text-gray-500">Không có đánh giá.</p>
            )}
            {pg && pg.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Trang {pg.page} / {pg.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    className="rounded border px-3 py-1 disabled:opacity-40"
                    onClick={() => setPage((x) => Math.max(1, x - 1))}>
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= pg.totalPages}
                    className="rounded border px-3 py-1 disabled:opacity-40"
                    onClick={() => setPage((x) => x + 1)}>
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
