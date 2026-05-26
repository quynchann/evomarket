import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

export default function AdminNotifyPage() {
  const [mode, setMode] = useState('role')
  const [role, setRole] = useState('buyer')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('')
  const [pickedUser, setPickedUser] = useState(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedUserSearch(userSearch.trim()), 350)
    return () => clearTimeout(id)
  }, [userSearch])

  const { data: userSearchData, isFetching: userSearchLoading } = useQuery({
    queryKey: ['admin', 'notify-user-picker', debouncedUserSearch],
    queryFn: async () => {
      const res = await adminApi.getUsers({ q: debouncedUserSearch, limit: 12 })
      return res.data
    },
    enabled: mode === 'user' && debouncedUserSearch.length >= 2,
  })

  const searchHits = userSearchData?.users ?? []

  useEffect(() => {
    if (mode === 'role') {
      setPickedUser(null)
      setUserSearch('')
    }
  }, [mode])

  const resolvedRecipientId = () =>
    pickedUser?.id != null ? Number(pickedUser.id) : NaN

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'role') {
        await adminApi.notifyByRole({ role, title: title.trim(), message: message.trim() })
        toast.success('Đã gửi thông báo')
      } else {
        const userId = resolvedRecipientId()
        if (!Number.isFinite(userId)) {
          toast.error('Chọn người nhận từ danh sách tìm kiếm')
          setLoading(false)
          return
        }
        await adminApi.notifyUser({
          userId,
          title: title.trim(),
          message: message.trim(),
        })
        toast.success('Đã gửi thông báo cho người dùng')
      }
      setTitle('')
      setMessage('')
    } catch (err) {
      toast.error(err.message || 'Lỗi')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit =
    (title.trim() || message.trim()) &&
    (mode === 'role' || Number.isFinite(resolvedRecipientId()))

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông báo hệ thống</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gửi theo vai trò (tất cả buyer/seller) hoặc chọn một người cụ thể
        </p>
      </header>

      <div className="p-8">
        <form
          onSubmit={submit}
          className="max-w-xl space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('role')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                mode === 'role'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Theo vai trò
            </button>
            <button
              type="button"
              onClick={() => setMode('user')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                mode === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Một người cụ thể
            </button>
          </div>

          {mode === 'role' ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}>
                <option value="buyer">Người mua</option>
                <option value="seller">Người bán</option>
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Tìm người nhận</label>
                <input
                  type="search"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setPickedUser(null)
                  }}
                  placeholder="Gõ tên, email hoặc SĐT (ít nhất 2 ký tự)"
                />
                {mode === 'user' && debouncedUserSearch.length >= 2 && (
                  <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-gray-100 bg-gray-50">
                    {userSearchLoading && (
                      <p className="px-3 py-2 text-xs text-gray-500">Đang tìm…</p>
                    )}
                    {!userSearchLoading && searchHits.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-500">Không có kết quả</p>
                    )}
                    {!userSearchLoading &&
                      searchHits.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setPickedUser(u)}
                          className="flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-white">
                          <span className="font-medium text-gray-900">
                            {u.fullname || u.email || `User #${u.id}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{u.id} · {u.email || '—'} · {u.role}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {pickedUser && (
                <p className="text-xs text-gray-600">
                  Đang gửi tới:{' '}
                  <strong>
                    #{pickedUser.id} {pickedUser.fullname || pickedUser.email}
                  </strong>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nội dung</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nội dung thông báo"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">
            {loading ? 'Đang gửi…' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  )
}
