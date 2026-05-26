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
    title: '',
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
        title: form.title,
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
        title: '',
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
      </header>

      <div className="space-y-8 p-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tạo mã mới</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="VD: Giảm giá mùa hè"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mã giảm giá</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="VD: SUMMER26"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại giảm giá</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="Percentage">Phần trăm</option>
                <option value="Fixed">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Giá trị giảm (0-100)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="VD: 10"
                value={form.discountValue}
                min="0"
                max="100"
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                    setForm((f) => ({ ...f, discountValue: value }))
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Đơn hàng tối thiểu (đ)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="0"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Số lượt sử dụng tối đa
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Để trống = không giới hạn"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.newUserOnly}
                  onChange={(e) => setForm((f) => ({ ...f, newUserOnly: e.target.checked }))}
                />
                <span className="font-medium text-gray-700">Chỉ dành cho khách hàng mới</span>
              </label>
            </div>
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
