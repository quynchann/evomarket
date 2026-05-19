import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { authApi } from "../../services/authApi.js";
import { resolveAvatarUrl } from "../../utils/chatUi.js";
import { Camera, X, Eye, EyeOff } from "lucide-react";

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

export default function SellerProfile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    shop_name: user?.shop_name ?? "",
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
      shop_name: user.shop_name ?? "",
      email: user.email ?? "",
      phone: user.phone_number ?? "",
      birthday: birthdayToInputValue(user.birthday),
      gender: user.gender ?? "",
      avatar: user.avatar ?? null,
    }));
  }, [user]);

  const avatarDisplayUrl = resolveAvatarUrl(formData.avatar);

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
        shop_name: formData.shop_name.trim() || null,
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
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
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
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelAvatar = () => {
    setShowAvatarModal(false);
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      toast.success(res?.data?.message || "Đổi mật khẩu thành công");
      closePasswordModal();
    } catch (err) {
      toast.error(err?.message || "Không thể đổi mật khẩu");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="min-h-full px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-800">
                  Hồ sơ cá nhân
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý thông tin tài khoản người bán
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-red-100">
                <span className="text-xl" aria-hidden>
                  🏪
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-6 text-lg font-semibold text-gray-800">
              Ảnh đại diện
            </h3>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative group mx-auto sm:mx-0">
                <div className="h-32 w-32 rounded-full border-4 border-orange-100 bg-linear-to-br from-orange-100 to-red-100 overflow-hidden shadow-lg">
                  {avatarDisplayUrl ? (
                    <img
                      src={avatarDisplayUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-orange-500">
                      {user?.fullname?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                </div>
                <button
                  type="button"
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
              <div className="flex-1 text-center sm:text-left">
                <h4 className="mb-2 text-lg font-semibold text-gray-800">
                  {user?.fullname || "Người bán"}
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  Ảnh đại diện giúp tài khoản của bạn dễ nhận diện hơn
                </p>
                <button
                  type="button"
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

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông tin cá nhân
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
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
                        shop_name: user.shop_name ?? "",
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
                  Tên cửa hàng
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    placeholder="VD: Bunny Store (để trống = hiển thị họ tên)"
                    maxLength={120}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500"
                  />
                ) : (
                  <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                    {formData.shop_name.trim()
                      ? formData.shop_name.trim()
                      : formData.fullname || "—"}
                    {!formData.shop_name.trim() && (
                      <span className="ml-2 text-xs text-gray-500">
                        (mặc định theo họ tên)
                      </span>
                    )}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Khách hàng thấy tên này trên trang sản phẩm, giỏ và thanh toán.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="rounded-lg bg-gray-50 px-4 py-2 text-gray-800">
                  {formData.email}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Email không thể thay đổi
                </p>
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

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Bảo mật tài khoản
            </h3>
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
                    <p className="text-sm text-gray-500">
                      Cập nhật mật khẩu định kỳ
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Xác nhận ảnh đại diện
              </h3>
              <button
                type="button"
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
                type="button"
                onClick={handleCancelAvatar}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
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
                    autoComplete="current-password"
                    className="w-full rounded-lg border-2 border-gray-300 py-2 pl-3 pr-10 outline-none transition focus:border-orange-500"
                    placeholder="••••••••"
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
              Sau khi đổi mật khẩu, các phiên đăng nhập khác sẽ cần đăng nhập
              lại khi hết hạn phiên hiện tại.
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
