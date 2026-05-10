import { useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'

export default function PrivacySettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'XÓA TÀI KHOẢN') {
      // TODO: Call API to delete account
      console.log('Deleting account...')
      alert(
        'Yêu cầu xóa tài khoản đã được gửi. Tài khoản sẽ bị xóa sau 30 ngày.',
      )
      setShowDeleteModal(false)
      setDeleteConfirmation('')
    } else {
      alert('Vui lòng nhập chính xác "XÓA TÀI KHOẢN" để xác nhận')
    }
  }

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800">
                  Những thiết lập riêng tư
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Yêu cầu xóa tài khoản */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  Yêu cầu xóa tài khoản
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white transition hover:bg-red-700">
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Xác nhận xóa tài khoản
                </h3>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-700">
                Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>Xóa vĩnh viễn tất cả dữ liệu cá nhân</li>
                <li>Xóa lịch sử đơn hàng và giao dịch</li>
                <li>Hủy tất cả đơn hàng đang xử lý</li>
                <li>Không thể khôi phục tài khoản sau khi xóa</li>
              </ul>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nhập "<strong>XÓA TÀI KHOẢN</strong>" để xác nhận:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="XÓA TÀI KHOẢN"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 transition outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'XÓA TÀI KHOẢN'}
                className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition ${
                  deleteConfirmation === 'XÓA TÀI KHOẢN'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'cursor-not-allowed bg-gray-400'
                }`}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
