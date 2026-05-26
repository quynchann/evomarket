import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import background from "../../../assets/background.png";
import logo from "../../../assets/logo.png";
import icon from "../../../assets/icon.png";

export const SellerRegister = () => {
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
        role: "seller",
      });
    },
    onSuccess: () => {
      navigate("/seller/signin");
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
      {/* Cột trái - giống giao diện customer/seller */}
      <div className="hidden flex-col items-center justify-center p-12 text-white md:flex md:w-6/12 lg:w-1/2">
        <div className="flex flex-col items-center space-y-6 text-center">
          <img
            src={icon}
            alt="Phát triển kinh doanh"
            className="mb-6 w-full max-w-lg object-contain md:max-w-xl"
          />
          <h1 className="text-3xl leading-tight font-extrabold md:text-4xl lg:text-5xl">
            Phát triển kinh doanh với EvoMarket ngay hôm nay!
          </h1>
          <p className="max-w-lg text-lg opacity-90 md:text-xl">
            Tham gia ngay để mở rộng kênh bán, tăng doanh số và tiếp cận khách
            hàng.
          </p>
        </div>
      </div>

      {/* Cột phải - form */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 md:w-7/12 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:max-w-lg sm:p-8 md:p-10">
          <div className="mb-6 text-center">
            <img
              src={logo}
              alt="EvoMarket"
              className="mx-auto mb-3 h-20 w-auto object-contain"
            />
            <h2 className="text-xl font-bold text-gray-800">
              Đăng ký người bán
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Tạo tài khoản để bắt đầu bán hàng trên EvoMarket.
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Nhập địa chỉ email"
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9a9 9 0 0114.9-7.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2 2l20 20"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Phải chứa ít nhất 8 ký tự và ký tự đặc biệt
                  </p>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
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
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9a9 9 0 0114.9-7.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2 2l20 20"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
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
                  <div className="flex items-start space-x-2 pt-1">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      onBlur={field.handleBlur}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="agree"
                      className="cursor-pointer text-sm text-gray-700 select-none"
                    >
                      Tôi đồng ý với{" "}
                      <Link
                        to="#"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Điều khoản dịch vụ
                      </Link>{" "}
                      và{" "}
                      <Link
                        to="#"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Chính sách bảo mật
                      </Link>
                      .
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

          <p className="mt-4 text-center text-sm text-gray-700">
            Đã có tài khoản?{" "}
            <Link
              to="/seller/signin"
              className="font-medium text-blue-600 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
