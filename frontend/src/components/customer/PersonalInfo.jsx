import { useState } from 'react'
import { IdCard, Shield } from 'lucide-react'

export default function PersonalInfo() {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    address: '',
  })

  const maxAddressLength = 200

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'address' && value.length > maxAddressLength) {
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên')
      return
    }
    
    if (!formData.idNumber.trim()) {
      alert('Vui lòng nhập số CCCD')
      return
    }
    
    if (!formData.address.trim()) {
      alert('Vui lòng nhập địa chỉ')
      return
    }
    
    // TODO: Call API to save personal info
    console.log('Saving personal info:', formData)
    alert('Đã lưu thông tin cá nhân thành công!')
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
                  Thông tin cá nhân
                </h2>
                <p className="text-sm text-gray-600">
                  Quản lý thông tin cá nhân và CCCD của bạn
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                <IdCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Form thông tin CCCD */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Thông tin cá nhân
            </h3>

            <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 shrink-0 text-blue-600" />
                <div className="text-sm text-gray-700">
                  <p>
                    Bạn vui lòng nhập chính xác thông tin CCCD để đơn hàng được thông quan 
                    theo quy định từ ngày 9/7. Thông tin sẽ được bảo mật theo Chính sách 
                    Bảo mật EvoMarket
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Họ và tên */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="w-full text-right text-sm font-medium text-gray-700 sm:w-32">
                  Họ và tên
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Họ và tên đầy đủ trên CCCD"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Số CCCD */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="w-full text-right text-sm font-medium text-gray-700 sm:w-32">
                  Số CCCD
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder="Số định danh cá nhân trên CCCD"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <label className="w-full text-right text-sm font-medium text-gray-700 sm:w-32 sm:pt-2">
                  Địa chỉ
                </label>
                <div className="flex-1">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ Nơi thường trú trên CCCD"
                    rows={4}
                    className="w-full resize-none rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500"
                  />
                  <div className="mt-1 text-right text-xs text-gray-500">
                    {formData.address.length}/{maxAddressLength}
                  </div>
                </div>
              </div>

              {/* Nút xác nhận */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-400 px-12 py-2.5 font-medium text-white transition hover:bg-orange-500"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>

          {/* Thông tin hướng dẫn */}
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
            <h4 className="mb-3 font-semibold text-orange-900">
              Lưu ý khi nhập thông tin CCCD
            </h4>
            <ul className="space-y-2 text-sm text-orange-800">
              <li className="flex gap-2">
                <span>•</span>
                <span>Vui lòng nhập chính xác họ tên như trên CCCD/CMND</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Số CCCD gồm 12 chữ số (CMND cũ gồm 9 hoặc 12 chữ số)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Địa chỉ thường trú phải khớp với thông tin trên CCCD</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Thông tin này chỉ được sử dụng để thông quan đơn hàng và được bảo mật tuyệt đối</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
