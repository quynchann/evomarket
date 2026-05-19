import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

const fmtVnd = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(n) || 0,
  )

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [deletedFilter, setDeletedFilter] = useState('false')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, deletedFilter, q],
    queryFn: async () => {
      const res = await adminApi.getProducts({
        page,
        limit: 15,
        deleted: deletedFilter,
        q: q || undefined,
      })
      return res.data
    },
  })

  const mut = useMutation({
    mutationFn: async ({ id, deleted }) => adminApi.patchProductVisibility(id, deleted),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success(v.deleted ? 'Đã ẩn sản phẩm' : 'Đã hiển thị sản phẩm')
    },
    onError: (e) => toast.error(e.message || 'Lỗi'),
  })

  const products = data?.products ?? []
  const pg = data?.pagination

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <p className="mt-1 text-sm text-gray-600">Ẩn / hiện sản phẩm trên sàn (cờ deleted)</p>
      </header>

      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-3">
          <input
            className="max-w-md flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Tìm theo tiêu đề…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setQ(qInput.trim())
                setPage(1)
              }
            }}
          />
          <button
            type="button"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white"
            onClick={() => {
              setQ(qInput.trim())
              setPage(1)
            }}>
            Tìm
          </button>
          <select
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
            value={deletedFilter}
            onChange={(e) => {
              setDeletedFilter(e.target.value)
              setPage(1)
            }}>
            <option value="false">Đang hiển thị</option>
            <option value="true">Đã ẩn</option>
            <option value="">Tất cả</option>
          </select>
        </div>

        {isLoading && <p className="text-gray-600">Đang tải…</p>}
        {!isLoading && (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Shop</th>
                    <th className="px-4 py-3">Giá</th>
                    <th className="px-4 py-3">Tồn</th>
                    <th className="px-4 py-3">Ẩn?</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">{p.id}</td>
                      <td className="px-4 py-3 max-w-xs truncate font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-xs">
                        {p.Seller?.shop_name || p.Seller?.fullname || '—'}
                      </td>
                      <td className="px-4 py-3">{fmtVnd(p.price)}</td>
                      <td className="px-4 py-3">{p.total_stock ?? p.available ?? '—'}</td>
                      <td className="px-4 py-3">{p.deleted ? 'Có' : 'Không'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="text-sm font-medium text-orange-600 hover:underline"
                          disabled={mut.isPending}
                          onClick={() => mut.mutate({ id: p.id, deleted: !p.deleted })}>
                          {p.deleted ? 'Hiện lại' : 'Ẩn'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && <p className="py-10 text-center text-gray-500">Không có sản phẩm.</p>}
            {pg && pg.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
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
