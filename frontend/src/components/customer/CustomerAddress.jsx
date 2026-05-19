import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/useAuthStore";
import { checkoutApi, checkoutQueryKeys } from "../../services/checkoutApi";
import { toast } from "sonner";
import { Edit2, Trash2, X } from "lucide-react";
import { OpenStreetMapAddressPicker } from "./OpenStreetMapAddressPicker.jsx";

export default function CustomerAddress() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    fullname: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Việt Nam",
    isDefault: false,
  });

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: checkoutQueryKeys.addresses,
    queryFn: async () => {
      const res = await checkoutApi.getAddresses();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const invalidateAddresses = () =>
    queryClient.invalidateQueries({ queryKey: checkoutQueryKeys.addresses });

  const createMutation = useMutation({
    mutationFn: (payload) => checkoutApi.createAddress(payload),
    onSuccess: async () => {
      await invalidateAddresses();
      toast.success("Đã thêm địa chỉ");
      setShowAddressModal(false);
      setEditingAddress(null);
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thêm địa chỉ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => checkoutApi.updateAddress(id, payload),
    onSuccess: async () => {
      await invalidateAddresses();
      toast.success("Đã cập nhật địa chỉ");
      setShowAddressModal(false);
      setEditingAddress(null);
    },
    onError: (err) => {
      toast.error(err.message || "Không thể cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => checkoutApi.deleteAddress(id),
    onSuccess: async () => {
      await invalidateAddresses();
      toast.success("Đã xóa địa chỉ");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xóa");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id) => checkoutApi.setDefaultAddress(id),
    onSuccess: async () => {
      await invalidateAddresses();
      toast.success("Đã đặt địa chỉ mặc định");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể đặt mặc định");
    },
  });

  const mapFormToPayload = () => ({
    label: addressFormData.name.trim(),
    recipientFullname: addressFormData.fullname.trim(),
    recipientPhone: addressFormData.phone.trim(),
    address: addressFormData.address.trim(),
    city: addressFormData.city.trim(),
    state: addressFormData.state.trim(),
    country: addressFormData.country.trim() || "Việt Nam",
    isDefault: addressFormData.isDefault,
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      name: "",
      fullname: user?.fullname || "",
      phone: user?.phone_number || "",
      address: "",
      city: "",
      state: "",
      country: "Việt Nam",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      name: address.label || "",
      fullname: address.recipientFullname || "",
      phone: address.recipientPhone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "Việt Nam",
      isDefault: !!address.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      deleteMutation.mutate(addressId);
    }
  };

  const handleSetDefaultAddress = (addressId) => {
    setDefaultMutation.mutate(addressId);
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = () => {
    if (!addressFormData.name.trim()) {
      toast.error("Vui lòng nhập tên địa chỉ");
      return;
    }
    if (!addressFormData.fullname.trim()) {
      toast.error("Vui lòng nhập họ tên người nhận");
      return;
    }
    if (!addressFormData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!addressFormData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    const payload = mapFormToPayload();
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCancelAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleOsmPlaceResolved = useCallback((parsed) => {
    setAddressFormData((prev) => ({
      ...prev,
      address: parsed.address,
      state: parsed.state,
      city: parsed.city,
      country: parsed.country || prev.country || "Việt Nam",
    }));
  }, []);

  const formatLine = (addr) =>
    [addr.address, addr.state, addr.city, addr.country].filter(Boolean).join(", ");

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Địa chỉ của tôi</h3>
              <button
                type="button"
                onClick={handleAddAddress}
                disabled={createMutation.isPending}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                + Thêm địa chỉ
              </button>
            </div>

            {isLoading && (
              <div className="space-y-3 py-8">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            )}

            {!isLoading && addresses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-600">Chưa có địa chỉ nào</p>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  Thêm địa chỉ
                </button>
              </div>
            ) : (
              !isLoading && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-lg border-2 p-4 transition ${
                        addr.isDefault
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800">{addr.label || "Địa chỉ"}</h4>
                            {addr.isDefault && (
                              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800">{addr.recipientFullname}</p>
                          <p className="text-sm text-gray-600">{addr.recipientPhone}</p>
                          <p className="mt-1 text-sm text-gray-700">{formatLine(addr)}</p>

                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              disabled={setDefaultMutation.isPending}
                              className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(addr)}
                            className="text-gray-500 hover:text-orange-600"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-gray-500 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>
              <button type="button" onClick={handleCancelAddressModal} className="text-gray-500 hover:text-gray-700">
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
                  Họ tên người nhận <span className="text-red-500">*</span>
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

              <OpenStreetMapAddressPicker key={editingAddress?.id ?? "new"} onResolved={handleOsmPlaceResolved} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={addressFormData.address}
                  onChange={handleAddressInputChange}
                  rows={2}
                  className="w-full resize-none rounded-lg border-2 border-gray-300 px-3 py-2 transition outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quận / Huyện</label>
                  <input
                    type="text"
                    name="state"
                    value={addressFormData.state}
                    onChange={handleAddressInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    name="city"
                    value={addressFormData.city}
                    onChange={handleAddressInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quốc gia</label>
                <input
                  type="text"
                  name="country"
                  value={addressFormData.country}
                  onChange={handleAddressInputChange}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
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
                type="button"
                onClick={handleCancelAddressModal}
                className="flex-1 rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 rounded-lg bg-orange-500 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {editingAddress ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
