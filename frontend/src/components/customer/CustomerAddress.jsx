import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { Edit2, Trash2, Plus, X } from 'lucide-react'

export default function CustomerAddress() {
  const { user } = useAuthStore()

  // Address management states
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    fullname: '',
    phone: '',
    address: '',
    isDefault: false,
  })

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Địa chỉ nhà riêng',
      fullname: user?.fullname || 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Đường ABC, Phường 1, Quận Bình Thạnh, TP.HCM',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Địa chỉ công ty',
      fullname: user?.fullname || 'Nguyễn Văn A',
      phone: '0987654321',
      address: '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      isDefault: false,
    },
  ])

  // Address management functions
  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressFormData({
      name: '',
      fullname: user?.fullname || '',
      phone: '',
      address: '',
      isDefault: addresses.length === 0,
    })
    setShowAddressModal(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setAddressFormData({
      name: address.name,
      fullname: address.fullname,
      phone: address.phone,
      address: address.address,
      isDefault: address.isDefault,
    })
    setShowAddressModal(true)
  }

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      const deletedAddress = addresses.find((a) => a.id === addressId)
      const newAddresses = addresses.filter((a) => a.id !== addressId)

      // If deleted address was default, set first address as default
      if (deletedAddress?.isDefault && newAddresses.length > 0) {
        newAddresses[0].isDefault = true
      }

      setAddresses(newAddresses)
    }
  }

  const handleSetDefaultAddress = (addressId) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    )
  }

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSaveAddress = () => {
    // Validation
    if (!addressFormData.name.trim()) {
      alert('Vui lòng nhập tên địa chỉ')
      return
    }
    if (!addressFormData.fullname.trim()) {
      alert('Vui lòng nhập họ tên người nhận')
      return
    }
    if (!addressFormData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại')
      return
    }
    if (!addressFormData.address.trim()) {
      alert('Vui lòng nhập địa chỉ chi tiết')
      return
    }

    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((addr) => {
          if (addr.id === editingAddress.id) {
            return { ...addr, ...addressFormData }
          }
          // If setting this as default, unset others
          if (addressFormData.isDefault && addr.isDefault) {
            return { ...addr, isDefault: false }
          }
          return addr
        }),
      )
    } else {
      // Add new address
      const newAddress = {
        id: Math.max(...addresses.map((a) => a.id), 0) + 1,
        ...addressFormData,
      }

      // If new address is default, unset others
      if (addressFormData.isDefault) {
        setAddresses([
          ...addresses.map((a) => ({ ...a, isDefault: false })),
          newAddress,
        ])
      } else {
        setAddresses([...addresses, newAddress])
      }
    }

    setShowAddressModal(false)
    setEditingAddress(null)
  }

  const handleCancelAddressModal = () => {
    setShowAddressModal(false)
    setEditingAddress(null)
  }

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Địa chỉ của tôi
              </h3>
              <button
                onClick={handleAddAddress}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
                + Thêm địa chỉ
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-600">Chưa có địa chỉ nào</p>
                <button
                  onClick={handleAddAddress}
                  className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
                  Thêm địa chỉ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-lg border-2 p-4 transition ${
                      addr.isDefault
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {addr.name}
                          </h4>
                          {addr.isDefault && (
                            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          {addr.fullname}
                        </p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {addr.address}
                        </p>

                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700">
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="text-gray-500 hover:text-orange-600"
                          title="Chỉnh sửa">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-gray-500 hover:text-red-600"
                          title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Add/Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'}
              </h3>
              <button
                onClick={handleCancelAddressModal}
                className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tên địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={addressFormData.name}
                  onChange={handleAddressInputChange}
                  placeholder="VD: Nhà riêng, Công ty..."
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 transition outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={addressFormData.fullname}
                  onChange={handleAddressInputChange}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 transition outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={addressFormData.phone}
                  onChange={handleAddressInputChange}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 transition outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={addressFormData.address}
                  onChange={handleAddressInputChange}
                  rows={3}
                  className="w-full resize-none rounded-lg border-2 border-gray-300 px-3 py-2 transition outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={handleAddressInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleCancelAddressModal}
                className="flex-1 rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={handleSaveAddress}
                className="flex-1 rounded-lg bg-orange-500 py-2 font-medium text-white hover:bg-orange-600">
                {editingAddress ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
