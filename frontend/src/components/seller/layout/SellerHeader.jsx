import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useSystemSocketStore } from "../../../stores/useSystemSocketStore";
import { resolveAvatarUrl } from "../../../utils/chatUi.js";

export default function SellerHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const notifUnread = useSystemSocketStore((s) => s.unreadCount);
  const headerAvatarUrl = resolveAvatarUrl(user?.avatar);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
    navigate("/seller/login", { replace: true });
  };

  const menuItems = [
    { name: "Trang chủ", path: "/seller/home" },
    { name: "Sản phẩm", path: "/seller/products" },
    { name: "Khuyến mãi", path: "/seller/coupons" },
    { name: "Đơn hàng", path: "/seller/orders" },
    { name: "Chat", path: "/seller/chat" },
    { name: "Thông báo", path: "/seller/notifications" },
    { name: "Báo cáo", path: "/seller/reports" },
  ];

  const goNotifications = () => {
    navigate("/seller/notifications");
    setMobileNavOpen(false);
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      toast.info(`Tính năng "${item.name}" đang phát triển`);
    }
    setMobileNavOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-2">
        <div className="flex justify-between px-4 text-xs sm:px-6 sm:text-sm">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <span className="truncate font-medium">🏪 Kênh Người Bán</span>
            <button
              type="button"
              onClick={() => navigate("/seller/support")}
              className="min-w-0 truncate text-left font-medium hover:text-orange-200 sm:whitespace-nowrap"
            >
              Trung tâm hỗ trợ
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={goNotifications}
              className="relative hidden cursor-pointer items-center gap-1.5 whitespace-nowrap hover:text-orange-200 md:inline-flex"
            >
              🔔 Thông báo
              {notifUnread > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-white px-1.5 text-center text-[10px] font-bold leading-5 text-red-600">
                  {notifUnread > 99 ? "99+" : notifUnread}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={goNotifications}
              className="relative cursor-pointer p-0.5 hover:text-orange-200 md:hidden"
              aria-label="Thông báo"
            >
              🔔
              {notifUnread > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 min-w-[0.875rem] rounded-full bg-white px-[3px] text-[9px] font-bold leading-3 text-red-600">
                  {notifUnread > 9 ? "9+" : notifUnread}
                </span>
              ) : null}
            </button>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {headerAvatarUrl ? (
                  <img
                    src={headerAvatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/20 text-sm font-bold">
                    {user?.fullname?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
                <span className="max-w-[8rem] truncate sm:max-w-none">
                  {user?.fullname || "Bunny Store"}
                </span>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/seller/profile");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-orange-50 transition"
                  >
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/seller/settings");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-orange-50 transition"
                  >
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Cài đặt</span>
                  </button>

                  <div className="my-1 h-px bg-gray-200"></div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
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
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-8">
          <h1
            className="cursor-pointer shrink-0 text-lg font-bold sm:text-2xl lg:text-3xl"
            onClick={() => navigate("/seller/home")}
          >
            <span className="lg:hidden">EvoMarket</span>
            <span className="hidden lg:inline">EvoMarket Seller</span>
          </h1>
          <nav className="hidden items-center gap-4 xl:gap-6 lg:flex">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleMenuClick(item)}
                className={`shrink-0 pb-1 text-sm transition hover:text-orange-200 ${
                  location.pathname === item.path ? "border-b-2 border-white" : ""
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Đóng menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav
            className="max-h-[min(70vh,420px)] overflow-y-auto border-t border-white/20 bg-gradient-to-br from-orange-600 to-red-600 px-4 py-4 shadow-inner lg:hidden"
          >
            {menuItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleMenuClick(item)}
                className={`flex w-full items-center rounded-lg px-3 py-3 text-left text-base font-medium transition hover:bg-white/10 ${
                  location.pathname === item.path ? "bg-white/15" : ""
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
