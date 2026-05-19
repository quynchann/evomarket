import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/services/adminApi'

export default function AdminNotifyPage() {
  const [role, setRole] = useState('buyer')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminApi.notifyByRole({ role, title: title.trim(), message: message.trim() })
      toast.success('Đã gửi thông báo')
      setTitle('')
      setMessage('')
    } catch (err) {
      toast.error(err.message || 'Lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông báo hệ thống</h1>
        <p className="mt-1 text-sm text-gray-600">Gửi thông báo đẩy theo vai trò (buyer / seller)</p>
      </header>

      <div className="p-8">
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
            disabled={loading || (!title.trim() && !message.trim())}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">
            {loading ? 'Đang gửi…' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  )
}
