import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import background from "../../../assets/background.png";
import logo from "../../../assets/logo.png";
import counter from "../../../assets/counter.png";
import { toast } from "sonner";

export const SellerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await login({
        email: values.email,
        password: values.password,
      });
      
      const userRole = response?.data?.user?.role;
      
      if (userRole !== 'seller') {
        toast.error('Tài khoản không hợp lệ');
        throw new Error('Tài khoản không hợp lệ');
      }
      
      return response;
    },
    onSuccess: () => {
      toast.success("Đăng nhập thành công!");
      navigate("/seller/home");
    },
    onError: (error) => {
      console.log(error); //console error
    }
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <div
      className="flex min-h-screen items-stretch bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {/* Cột trái - hiện từ md trở lên */}
      <div className="hidden flex-col items-center justify-center p-12 text-white md:flex md:w-6/12 lg:w-1/2">
        <div className="flex flex-col items-center space-y-6 text-center">
          <img
            src={counter}
            alt="EvoMarket"
            className="mb-3 w-3/4 max-w-md object-contain md:w-4/5 md:max-w-lg lg:w-3/4 lg:max-w-xl"
          />
          <h4 className="text-4xl leading-tight font-extrabold md:text-6xl lg:text-7xl">
            EvoMarket - Kênh Người bán
          </h4>
          <p className="max-w-lg text-lg opacity-95 md:text-xl lg:text-2xl">
            Quản lý shop của bạn một cách hiệu quả hơn trên EvoMarket
          </p>
        </div>
      </div>

      {/* Cột phải */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 md:w-7/12 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:max-w-lg sm:p-8 md:p-10">
          {/* Logo nhỏ */}
          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="EvoMarket"
              className="mx-auto mb-3 h-20 md:h-20 lg:h-20"
            />
            <h2 className="text-xl font-bold text-gray-800 md:text-3xl">
              EvoMarket
            </h2>
            <p className="text-xs text-gray-600 sm:text-sm">
              Bán hàng thông minh, bứt phá doanh thu.
            </p>
          </div>

          {/* Tiêu đề */}
          <h3 className="mb-2 text-center text-lg font-bold text-gray-900 sm:text-xl">
            Đăng nhập người bán
          </h3>
          <p className="mb-6 text-center text-xs text-gray-600 sm:text-sm">
            Chào mừng bạn trở lại! Đăng nhập để tiếp tục bán hàng.
          </p>

          {/* Form */}
          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
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
                  <input
                    type="email"
                    name="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Email"
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Mật khẩu"
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
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2 2l20 20"
                          ></path>
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
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
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

            {/* Ghi nhớ + Quên mật khẩu */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Ghi nhớ tài khoản
              </label>
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 px-3 py-2 font-semibold text-white shadow-lg transition duration-200 hover:from-teal-500 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:py-3"
            >
              {loginMutation.isPending ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          {/* Hoặc đăng nhập bằng */}
          <div className="mt-6 sm:mt-8">
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center">
                <div className="h-px flex-1 bg-gray-300"></div>
                <span className="mx-3 text-xs text-gray-600 sm:text-sm">
                  Hoặc đăng nhập bằng
                </span>
                <div className="h-px flex-1 bg-gray-300"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:px-4 sm:py-3"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                />
                Google
              </button>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:py-3 sm:text-sm"
              >
                <svg
                  className="mr-2 h-4 w-4 text-blue-600 sm:h-5 sm:w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Link đăng ký */}
          <div className="mt-4 text-center text-xs text-gray-700 sm:text-sm">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/seller/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
