import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import background from "../../../assets/background.png";
import logoEvo from "../../../assets/logo-evo.png";
import icon from "../../../assets/icon.png";
import { Eye, EyeOff } from "lucide-react";

export const CustomerRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (values) => {
      return await register({
        email: values.email,
        password: values.password,
        fullname: values.fullName,
        role: "buyer",
      });
    },
    onSuccess: () => {
      navigate("/customer/login");
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync(value);
    },
  });

  return (
    <div
      className="flex min-h-screen items-stretch bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Cột trái - hình + thông điệp */}
      <div className="hidden flex-col items-center justify-center p-10 text-white md:flex md:w-6/12 lg:w-1/2">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img
            src={icon}
            alt="EvoMarket"
            className="mb-4 w-full max-w-sm object-contain md:max-w-md"
          />
          <h1 className="text-2xl leading-tight font-extrabold md:text-3xl lg:text-4xl">
            Trải nghiệm mua sắm thông minh cùng EvoMarket
          </h1>
          <p className="mt-1 max-w-md text-base opacity-90 md:text-lg">
            Đăng ký người mua để truy cập ưu đãi, quản lý đơn hàng và lưu sản
            phẩm yêu thích.
          </p>
        </div>
      </div>

      {/* Cột phải - form đăng ký người mua */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 md:w-7/12 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:max-w-lg sm:p-8 md:p-10">
          <div className="mb-6 text-center">
            <img
              src={logoEvo}
              alt="EvoMarket"
              className="mx-auto mb-3 h-20 w-auto object-contain"
            />
            <h2 className="text-xl font-bold text-gray-800">
              <span className="text-orange-500">Evo</span>
              <span className="text-gray-800">Market</span> - Đăng ký người mua
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Tạo tài khoản để bắt đầu mua sắm trên EvoMarket.
            </p>
          </div>

          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            {/* Họ và tên */}
            <form.Field
              name="fullName"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === "") {
                    return "Họ và tên là bắt buộc";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Nhập họ và tên"
                    aria-invalid={!!field.state.meta.errors.length}
                    className={`w-full rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 sm:px-4 sm:py-3 ${
                      field.state.meta.errors.length
                        ? "border border-red-500 focus:ring-red-200"
                        : "border border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === "") {
                    return "Email là bắt buộc";
                  }
                  if (!/^\S+@\S+\.\S+$/.test(value)) {
                    return "Email không hợp lệ";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="example@email.com"
                    aria-invalid={!!field.state.meta.errors.length}
                    className={`w-full rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 sm:px-4 sm:py-3 ${
                      field.state.meta.errors.length
                        ? "border border-red-500 focus:ring-red-200"
                        : "border border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Mật khẩu */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === "") {
                    return "Mật khẩu là bắt buộc";
                  }
                  if (value.length < 8) {
                    return "Mật khẩu phải có ít nhất 8 ký tự";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Tối thiểu 8 ký tự"
                      aria-invalid={!!field.state.meta.errors.length}
                      className={`w-full rounded-lg px-3 py-2 pr-10 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 sm:px-4 sm:py-3 ${
                        field.state.meta.errors.length
                          ? "border border-red-500 focus:ring-red-200"
                          : "border border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="22" y1="2" x2="2" y2="22" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Xác nhận mật khẩu */}
            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue("password");
                  if (!value || value.trim() === "") {
                    return "Xác nhận mật khẩu là bắt buộc";
                  }
                  if (password !== value) {
                    return "Mật khẩu xác nhận không khớp";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Nhập lại mật khẩu"
                      aria-invalid={!!field.state.meta.errors.length}
                      className={`w-full rounded-lg px-3 py-2 pr-10 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 sm:px-4 sm:py-3 ${
                        field.state.meta.errors.length
                          ? "border border-red-500 focus:ring-red-200"
                          : "border border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirm ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="22" y1="2" x2="2" y2="22" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Điều khoản */}
            <form.Field
              name="terms"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return "Bạn phải đồng ý với điều khoản để tiếp tục";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      onBlur={field.handleBlur}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                      Tôi đồng ý với{" "}
                      <Link
                        to="#"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Điều khoản sử dụng
                      </Link>{" "}
                      và{" "}
                      <Link
                        to="#"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Chính sách bảo mật
                      </Link>
                    </label>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 px-3 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-teal-500 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:px-4"
            >
              {registerMutation.isPending ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?
              <Link
                to="/customer/login"
                className="ml-1 inline-block font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="mx-3 text-xs text-gray-500">
                Hoặc đăng ký bằng
              </span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm transition duration-200 hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.64 30.47 0 24 0 14.73 0 6.76 5.26 2.83 12.94l7.98 6.2C12.48 13.08 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.98 24.55c0-1.62-.15-3.18-.43-4.68H24v8.84h13c-.56 2.9-2.27 5.35-4.83 7.02l7.46 5.79C43.89 37.54 46.98 31.54 46.98 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.81 28.93a14.5 14.5 0 0 1-.77-4.43c0-1.54.28-3.02.77-4.43v-8.84H2.83A23.91 23.91 0 0 0 0 24.5c0 3.83.92 7.46 2.83 10.77l7.98-6.34z"
                  />
                  <path
                    fill="#4285F4"
                    d="M24 48c6.48 0 11.93-2.13 15.9-5.84l-7.46-5.79c-2.05 1.38-4.71 2.18-8.44 2.18-6.26 0-11.52-3.58-13.19-8.84l-7.98 6.34C6.76 42.74 14.73 48 24 48z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-500 transition duration-200 hover:bg-gray-50"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
