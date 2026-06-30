import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { authApi } from "../../services/authApi.js";
import { resolveAvatarUrl } from "../../utils/chatUi.js";
import {
  User,
  Package,
  CreditCard,
  Heart,
  Settings,
  Bell,
  Camera,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { sampleProducts } from "../../constants/productImages.js";

function ProductThumb({ image, className = "h-16 w-16" }) {
  if (typeof image === "string" && image.startsWith("http")) {
    return (
      <img
        src={image}
        alt=""
        className={`${className} rounded-lg object-cover bg-white shadow`}
      />
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center rounded-lg bg-white text-2xl shadow`}
    >
      {image}
    </div>
  );
}

function birthdayToInputValue(v) {
  if (v == null || v === "") return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return "";
}

function formatBirthdayDisplay(v) {
  const inp = birthdayToInputValue(v);
  if (!inp) return "—";
  const [y, m, d] = inp.split("-").map(Number);
  if (!y || !m || !d) return "—";
  try {
    return new Date(y, m - 1, d).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phone_number ?? "",
    birthday: birthdayToInputValue(user?.birthday),
    gender: user?.gender ?? "",
    avatar: user?.avatar || null,
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    cur: false,
    neu: false,
    conf: false,
  });

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullname: user.fullname ?? "",
      email: user.email ?? "",
      phone: user.phone_number ?? "",
      birthday: birthdayToInputValue(user.birthday),
      gender: user.gender ?? "",
      avatar: user.avatar ?? null,
    }));
  }, [user]);

  const avatarDisplayUrl = resolveAvatarUrl(formData.avatar);

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "payment", label: "Thanh toán", icon: CreditCard },
    { id: "wishlist", label: "Yêu thích", icon: Heart },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  const orders = [
    {
      id: "#EVO001234",
      items: [
        {
          name: sampleProducts.glassesSun.name,
          image: sampleProducts.glassesSun.image,
          quantity: 1,
        },
      ],
      total: "350.000₫",
      date: "15/12/2024",
      status: "Đã giao",
      statusColor: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "#EVO001235",
      items: [
        {
          name: sampleProducts.hatCap.name,
          image: sampleProducts.hatCap.image,
          quantity: 2,
        },
      ],
      total: "300.000₫",
      date: "18/12/2024",
      status: "Đang giao",
      statusColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "#EVO001236",
      items: [
        {
          name: sampleProducts.earringStud.name,
          image: sampleProducts.earringStud.image,
          quantity: 1,
        },
      ],
      total: "280.000₫",
      date: "20/12/2024",
      status: "Chờ xác nhận",
      statusColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  ];

  const wishlist = [
    {
      id: 1,
      name: sampleProducts.earringStud.name,
      price: sampleProducts.earringStud.price,
      image: sampleProducts.earringStud.image,
      stock: true,
    },
    {
      id: 2,
      name: sampleProducts.glassesBlueLight.name,
      price: sampleProducts.glassesBlueLight.price,
      image: sampleProducts.glassesBlueLight.image,
      stock: true,
    },
    {
      id: 3,
      name: sampleProducts.hatBucket.name,
      price: sampleProducts.hatBucket.price,
      image: sampleProducts.hatBucket.image,
      stock: false,
    },
    {
      id: 4,
      name: sampleProducts.glassesVintage.name,
      price: sampleProducts.glassesVintage.price,
      image: sampleProducts.glassesVintage.image,
      stock: true,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const name = formData.fullname.trim();
    if (!name) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    try {
      setProfileSaving(true);
      const res = await authApi.updateProfile({
        fullname: name,
        phone_number: formData.phone.trim() || null,
        birthday: formData.birthday.trim() || null,
        gender: formData.gender.trim() || null,
      });
      const updated = res.data?.user;
      if (updated) setUser(updated);
      toast.success("Đã cập nhật thông tin cá nhân");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.message || "Không thể lưu thông tin");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
        return;
      }

      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setShowAvatarModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatarFile) return;

    try {
      setAvatarUploading(true);
      const res = await authApi.uploadAvatar(selectedAvatarFile);
      const updated = res.data?.user;
      if (updated) {
        setUser(updated);
        setFormData((prev) => ({ ...prev, avatar: updated.avatar ?? null }));
      }
      setShowAvatarModal(false);
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      console.error("Upload avatar failed:", error);
      toast.error(
        error?.message || "Có lỗi xảy ra khi cập nhật avatar"
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelAvatar = () => {
    setShowAvatarModal(false);
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPwdForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPwd({ cur: false, neu: false, conf: false });
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwdForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đủ các trường");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }
    try {
      setPasswordSaving(true);
      const res = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(
        res?.data?.message || "Đổi mật khẩu thành công"
      );
      closePasswordModal();
    } catch (err) {
      toast.error(err?.message || "Không thể đổi mật khẩu");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-6 text-lg font-semibold text-gray-800">Ảnh đại diện</h3>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full border-4 border-orange-100 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden shadow-lg">
                    {avatarDisplayUrl ? (
                      <img 
                        src={avatarDisplayUrl} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-orange-500">
                        {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600 group-hover:scale-110"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">
                    {user?.fullname || "Người dùng"}
                  </h4>
                  <p className="mb-3 text-sm text-gray-600">
                    Ảnh đại diện giúp tài khoản của bạn dễ nhận diện hơn
                  </p>
                  <button
                    onClick={handleAvatarClick}
                    className="rounded-lg border-2 border-orange-500 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                  >
                    Thay đổi ảnh đại diện
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Định dạng: JPEG, PNG, GIF, WebP. Kích thước tối đa: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          setIsEditing(false);
                          return;
                        }
                        setFormData((prev) => ({
                          ...prev,
                          fullname: user.fullname ?? "",
                          email: user.email ?? "",
                          phone: user.phone_number ?? "",
                          birthday: birthdayToInputValue(user.birthday),
                          gender: user.gender ?? "",
                          avatar: user.avatar ?? null,
                        }));
                        setIsEditing(false);
                      }}
                      disabled={profileSaving}
                      className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={profileSaving}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
                    >
                      {profileSaving ? "Đang lưu…" : "Lưu"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500"
                    />
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                      {formData.fullname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                    {formData.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 0901234567"
                      autoComplete="tel"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500"
                    />
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                      {formData.phone.trim() ? formData.phone : "—"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ngày sinh
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500"
                    />
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                      {formatBirthdayDisplay(formData.birthday)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500"
                    >
                      <option value="">Chưa chọn</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                      {formData.gender?.trim() ? formData.gender : "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Bảo mật tài khoản</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      🔑
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Đổi mật khẩu</p>
                      <p className="text-sm text-gray-500">Cập nhật mật khẩu định kỳ</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Đơn hàng của tôi</h3>
                <select className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-orange-500">
                  <option>Tất cả đơn hàng</option>
                  <option>Chờ xác nhận</option>
                  <option>Đang giao</option>
                  <option>Đã giao</option>
                  <option>Đã hủy</option>
                </select>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border-2 border-gray-200 p-4 transition hover:border-orange-300 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          {order.id}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{order.date}</span>
                    </div>

                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                        <ProductThumb image={item.image} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">{order.total}</p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 flex justify-end gap-2">
                      <button className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        Chi tiết
                      </button>
                      {order.status === "Đã giao" && (
                        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
                          Đánh giá
                        </button>
                      )}
                      {order.status === "Đang giao" && (
                        <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
                          Theo dõi
                        </button>
                      )}
                      {order.status === "Chờ xác nhận" && (
                        <button className="rounded-lg border-2 border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-6 text-lg font-semibold text-gray-800">Phương thức thanh toán</h3>
              
              <div className="space-y-4">
                {/* Thẻ tín dụng */}
                <div className="rounded-xl border-2 border-gray-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Thẻ tín dụng / Ghi nợ</h4>
                    <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                      + Thêm thẻ
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Chưa có thẻ nào được liên kết</p>
                </div>

                {/* COD */}
                <div className="rounded-xl border-2 border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      💵
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-600">Luôn khả dụng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "wishlist":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Danh sách yêu thích ({wishlist.length})
                </h3>
                <button className="text-sm font-medium text-red-600 hover:text-red-700">
                  Xóa tất cả
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-gray-200 p-4 transition hover:border-orange-300 hover:shadow-lg"
                  >
                    <div className="relative mb-4">
                      <ProductThumb
                        image={item.image}
                        className="h-32 w-full rounded-xl"
                      />
                      <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow transition hover:bg-red-50">
                        ❤️
                      </button>
                      {!item.stock && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
                          <span className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="mb-2 text-sm font-medium text-gray-800 line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="mb-3 text-lg font-bold text-orange-600">{item.price}</p>
                    <button
                      disabled={!item.stock}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition ${
                        item.stock
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {item.stock ? "Thêm vào giỏ" : "Hết hàng"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-6 text-lg font-semibold text-gray-800">Thông báo</h3>
              
              <div className="space-y-3">
                {[
                  {
                    type: "order",
                    title: "Đơn hàng #EVO001235 đang được giao",
                    desc: "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển",
                    time: "2 giờ trước",
                    read: false,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    type: "promotion",
                    title: "Giảm giá 50% cho lần mua tiếp theo",
                    desc: "Sử dụng mã EVOMARKET50 để nhận ưu đãi",
                    time: "1 ngày trước",
                    read: false,
                    color: "bg-orange-100 text-orange-600",
                  },
                  {
                    type: "review",
                    title: "Đánh giá sản phẩm để nhận xu",
                    desc: "Đánh giá đơn hàng #EVO001234 để nhận 50 xu Evo",
                    time: "2 ngày trước",
                    read: true,
                    color: "bg-green-100 text-green-600",
                  },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-4 transition hover:shadow-lg ${
                      notif.read ? "border-gray-200 bg-white" : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notif.color}`}>
                        {notif.type === "order" ? "📦" : notif.type === "promotion" ? "🎁" : "⭐"}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-gray-800">{notif.title}</h4>
                        <p className="mb-2 text-sm text-gray-600">{notif.desc}</p>
                        <p className="text-xs text-gray-500">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="h-3 w-3 shrink-0 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-6 text-lg font-semibold text-gray-800">Cài đặt</h3>
              
              <div className="space-y-6">
                {/* Ngôn ngữ */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ngôn ngữ
                  </label>
                  <select className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500 md:w-1/2">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>

                {/* Thông báo */}
                <div>
                  <h4 className="mb-3 font-semibold text-gray-800">Thông báo</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Thông báo đơn hàng", enabled: true },
                      { label: "Thông báo khuyến mãi", enabled: true },
                      { label: "Thông báo qua email", enabled: false },
                      { label: "Thông báo qua SMS", enabled: false },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                        <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                        <button
                          className={`relative h-6 w-12 rounded-full transition ${
                            setting.enabled ? "bg-orange-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              setting.enabled ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quyền riêng tư */}
                <div>
                  <h4 className="mb-3 font-semibold text-gray-800">Quyền riêng tư</h4>
                  <div className="space-y-3">
                    <button className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50">
                      <span className="text-sm font-medium text-gray-700">Lịch sử mua hàng</span>
                      <span className="text-xs text-gray-500">Chỉ mình tôi</span>
                    </button>
                    <button className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50">
                      <span className="text-sm font-medium text-gray-700">Danh sách yêu thích</span>
                      <span className="text-xs text-gray-500">Công khai</span>
                    </button>
                  </div>
                </div>

                {/* Nguy hiểm */}
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                  <h4 className="mb-3 font-semibold text-red-800">Vùng nguy hiểm</h4>
                  <button className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 md:w-auto md:px-6">
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        {/* Content */}
        <div>{renderContent()}</div>
      </main>

      {/* Avatar Preview Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Xác nhận ảnh đại diện
              </h3>
              <button
                onClick={handleCancelAvatar}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-orange-200 shadow-lg">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>

            <p className="mb-6 text-center text-sm text-gray-600">
              Bạn có muốn sử dụng ảnh này làm ảnh đại diện?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelAvatar}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={avatarUploading}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {avatarUploading ? "Đang tải lên…" : "Lưu ảnh"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Đổi mật khẩu
              </h3>
              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordSaving}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPwd.cur ? "text" : "password"}
                    value={pwdForm.currentPassword}
                    onChange={handlePasswordFieldChange}
                    autoComplete="off"
                    className="w-full rounded-lg border-2 border-gray-300 py-2 pl-3 pr-10 outline-none transition focus:border-orange-500"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, cur: !s.cur }))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    aria-label={showPwd.cur ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd.cur ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showPwd.neu ? "text" : "password"}
                    value={pwdForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    autoComplete="new-password"
                    className="w-full rounded-lg border-2 border-gray-300 py-2 pl-3 pr-10 outline-none transition focus:border-orange-500"
                    placeholder="Tối thiểu 8 ký tự"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, neu: !s.neu }))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    aria-label={showPwd.neu ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd.neu ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showPwd.conf ? "text" : "password"}
                    value={pwdForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    autoComplete="new-password"
                    className="w-full rounded-lg border-2 border-gray-300 py-2 pl-3 pr-10 outline-none transition focus:border-orange-500"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, conf: !s.conf }))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    aria-label={showPwd.conf ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd.conf ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Sau khi đổi mật khẩu, các phiên đăng nhập khác sẽ cần đăng nhập lại khi hết hạn phiên hiện tại.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordSaving}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleChangePasswordSubmit}
                disabled={passwordSaving}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {passwordSaving ? "Đang cập nhật…" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
