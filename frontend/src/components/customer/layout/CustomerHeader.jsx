import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import { notificationApi } from "../../../services/notificationApi";
import { resolveAvatarUrl } from "../../../utils/chatUi.js";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, Bell } from "lucide-react";

export function CustomerHeader({ cartCount = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const headerAvatarUrl = resolveAvatarUrl(user?.avatar);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.unreadCount(),
    enabled: user?.role === "buyer",
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.data?.count ?? 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/customer/login", { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-3 border-b bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-8 text-white shadow-lg">
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/20 -ml-1" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center rounded-xl bg-white px-5 py-2.5 shadow-lg transition-all focus-within:ring-2 focus-within:ring-orange-300">
            <button type="submit" className="flex items-center">
              <svg className="h-5 w-5 text-gray-400 hover:text-orange-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="ml-3 w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </form>

          {/* Thông báo */}
          {user?.role === "buyer" && (
            <button
              type="button"
              onClick={() => navigate("/customer/notifications")}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 transition hover:bg-white/30 hover:scale-105"
              aria-label={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ""}`}
            >
              <Bell className="h-6 w-6" />
              {/* Badge số lượng thông báo chưa đọc */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Giỏ hàng */}
          {user?.role === "buyer" && (
            <button
              type="button"
              onClick={() => navigate("/customer/cart")}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 transition hover:bg-white/30 hover:scale-105"
              aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ""}`}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 rounded-lg bg-white/20 px-4 py-2.5 transition hover:bg-white/30"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="hidden font-medium text-sm lg:inline-block">
                {user?.fullname || "Người dùng"}
              </span>
              {headerAvatarUrl ? (
                <img
                  src={headerAvatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-md"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/30 text-sm font-bold shadow-md">
                  {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 animate-fade-in rounded-xl border border-gray-100 bg-white py-2 shadow-2xl z-50">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullname || "Người dùng"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || "user@email.com"}</p>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/customer/profile");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-orange-50"
                >
                  <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/customer/orders");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-orange-50"
                >
                  <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Đơn hàng của tôi</span>
                </button>

                <div className="my-2 h-px bg-gray-100"></div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
