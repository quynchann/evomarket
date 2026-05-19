import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

export default function AdminCouponsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'platform-coupons'],
    queryFn: async () => {
      const res = await adminApi.getPlatformCoupons()
      return res.data.coupons
    },
  })

  const [form, setForm] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    minOrderValue: '0',
    maxUses: '',
    startDate: '',
    endDate: '',
    newUserOnly: false,
  })

  const createMut = useMutation({
    mutationFn: () =>
      adminApi.createPlatformCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue || 0),
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        newUserOnly: form.newUserOnly,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'platform-coupons'] })
      toast.success('Đã tạo mã')
      setForm({
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        minOrderValue: '0',
        maxUses: '',
        startDate: '',
        endDate: '',
        newUserOnly: false,
      })
    },
    onError: (e) => toast.error(e.message || 'Lỗi'),
  })

  const delMut = useMutation({
    mutationFn: (id) => adminApi.deletePlatformCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'platform-coupons'] })
      toast.success('Đã xóa mã')
    },
    onError: (e) => toast.error(e.message || 'Không xóa được (có thể đã có lượt dùng)'),
  })

  const coupons = data ?? []

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá sàn</h1>
        <p className="mt-1 text-sm text-gray-600">Tạo / xóa mã toàn sàn (seller_id = null)</p>
      </header>

      <div className="space-y-8 p-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tạo mã mới</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Mã (VD: SUMMER26)"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.discountType}
              onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
              <option value="Percentage">Phần trăm</option>
              <option value="Fixed">Số tiền cố định</option>
            </select>
            <input
              type="number"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Giá trị giảm"
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            />
            <input
              type="number"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Đơn tối thiểu (đ)"
              value={form.minOrderValue}
              onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Max lượt (để trống = không giới hạn)"
              value={form.maxUses}
              onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.newUserOnly}
                onChange={(e) => setForm((f) => ({ ...f, newUserOnly: e.target.checked }))}
              />
              Chỉ khách mới
            </label>
          </div>
          <button
            type="button"
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            disabled={createMut.isPending}
            onClick={() => createMut.mutate()}>
            Tạo mã
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold">Danh sách</h2>
          </div>
          {isLoading && <p className="p-6 text-gray-600">Đang tải…</p>}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Giảm</th>
                    <th className="px-4 py-3">Đơn tối thiểu</th>
                    <th className="px-4 py-3">Lượt</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3">
                        {c.discountType === 'Percentage' ? `${c.discountValue}%` : `${c.discountValue}đ`}
                      </td>
                      <td className="px-4 py-3">{c.minOrderValue?.toLocaleString?.('vi-VN') ?? c.minOrderValue}</td>
                      <td className="px-4 py-3 text-xs">
                        {c.usedCount} / {c.maxUses ?? '∞'}
                      </td>
                      <td className="px-4 py-3">{c.status}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="text-red-600 hover:underline disabled:opacity-40"
                          disabled={delMut.isPending}
                          onClick={() => delMut.mutate(c.id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && coupons.length === 0 && (
            <p className="py-8 text-center text-gray-500">Chưa có mã sàn.</p>
          )}
        </div>
      </div>
    </div>
  )
}
