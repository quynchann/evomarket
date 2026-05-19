import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, role, q],
    queryFn: async () => {
      const res = await adminApi.getUsers({ page, limit: 15, role: role || undefined, q: q || undefined })
      return res.data
    },
  })

  const mut = useMutation({
    mutationFn: async ({ id, account_status }) => adminApi.patchUserStatus(id, account_status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Đã cập nhật trạng thái tài khoản')
    },
    onError: (e) => toast.error(e.message || 'Lỗi'),
  })

  const users = data?.users ?? []
  const pg = data?.pagination

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
        <p className="mt-1 text-sm text-gray-600">Khóa / mở tài khoản buyer & seller (không áp dụng admin)</p>
      </header>

      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Tìm tên, email, SĐT…"
            className="max-w-md flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
            onClick={() => {
              setQ(qInput.trim())
              setPage(1)
            }}>
            Tìm
          </button>
          <select
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setPage(1)
            }}>
            <option value="">Mọi vai trò</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
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
                    <th className="px-4 py-3">Họ tên</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Shop</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.fullname}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            u.account_status === 'LOCKED'
                              ? 'text-red-600'
                              : 'text-green-700'
                          }>
                          {u.account_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{u.shop_name || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            className="text-sm font-medium text-orange-600 hover:underline"
                            disabled={mut.isPending}
                            onClick={() =>
                              mut.mutate({
                                id: u.id,
                                account_status: u.account_status === 'LOCKED' ? 'ACTIVE' : 'LOCKED',
                              })
                            }>
                            {u.account_status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <p className="py-10 text-center text-gray-500">Không có người dùng.</p>}
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
