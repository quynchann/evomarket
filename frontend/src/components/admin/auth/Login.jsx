import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import { toast } from "sonner";

const defaultConfig = {
  background_color: "#FFF7ED",
  surface_color: "#FFFFFF",
  text_color: "#111827",
  primary_action_color: "#F97316",
  secondary_action_color: "#FB923C",
  font_family: "system-ui, -apple-system, sans-serif",
  font_size: 16,
  page_title: "Admin Đăng nhập",
  welcome_text: "Chào mừng quay trở lại",
  subtitle_text: "Đăng nhập vào tài khoản quản trị của bạn",
  email_label: "Địa chỉ Email",
  password_label: "Mật khẩu",
  remember_label: "Ghi nhớ đăng nhập",
  login_button: "Đăng nhập",
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [config] = useState(defaultConfig);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await login({
        email: values.email,
        password: values.password,
      });
      
      const userRole = response?.data?.user?.role;
      
      if (userRole !== 'admin') {
        toast.error('Tài khoản không hợp lệ');
        throw new Error('Tài khoản không hợp lệ');
      }
      
      return response;
    },
    onSuccess: () => {
      toast.success("Đăng nhập thành công!");
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      console.log(error); //console error
    }
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: `linear-gradient(to bottom right, ${config.background_color}, white, ${config.background_color})`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 shadow-lg">
            <svg
              className="h-9 w-9 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1
            className="mb-2 text-3xl font-bold"
            style={{
              fontFamily: config.font_family,
              fontSize: `${config.font_size * 1.875}px`,
              color: config.text_color,
            }}
          >
            {config.page_title}
          </h1>
          <p
            className="font-medium text-gray-600"
            style={{
              fontFamily: config.font_family,
              fontSize: `${config.font_size}px`,
            }}
          >
            {config.welcome_text}
          </p>
          <p
            className="text-sm text-gray-500"
            style={{
              fontFamily: config.font_family,
              fontSize: `${config.font_size * 0.875}px`,
            }}
          >
            {config.subtitle_text}
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl"
          style={{ fontFamily: config.font_family }}
        >
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            {/* Email Field */}
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
                    className="mb-2 block text-sm font-semibold text-gray-700"
                    style={{
                      fontSize: `${config.font_size * 0.875}px`,
                      color: config.text_color,
                    }}
                  >
                    {config.email_label}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`block w-full rounded-xl border py-3 pr-4 pl-12 transition-colors focus:ring-0 focus:outline-none ${
                        field.state.meta.errors.length
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-orange-500"
                      }`}
                      placeholder="admin@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.length}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password Field */}
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
                    className="mb-2 block text-sm font-semibold text-gray-700"
                    style={{
                      fontSize: `${config.font_size * 0.875}px`,
                      color: config.text_color,
                    }}
                  >
                    {config.password_label}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className={`block w-full rounded-xl border py-3 pr-12 pl-12 transition-colors focus:ring-0 focus:outline-none ${
                        field.state.meta.errors.length
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-orange-500"
                      }`}
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.length}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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

            {/* Remember Checkbox */}
            <form.Field name="remember">
              {(field) => (
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block cursor-pointer text-sm text-gray-700"
                    style={{ fontSize: `${config.font_size * 0.875}px` }}
                  >
                    {config.remember_label}
                  </label>
                </div>
              )}
            </form.Field>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full transform rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, ${config.primary_action_color}, ${config.secondary_action_color})`,
                fontFamily: config.font_family,
                fontSize: `${config.font_size}px`,
              }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Đang xử lý..." : config.login_button}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-start space-x-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-xs leading-relaxed text-gray-500">
                Kết nối của bạn được bảo mật. Không chia sẻ thông tin đăng nhập
                với bất kỳ ai.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 E-Commerce Admin. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </div>
  );
}
