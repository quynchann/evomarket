import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function SellerHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    { name: "Đơn hàng", path: "/seller/orders" },
    { name: "Chat", path: "/seller/chat" },
    { name: "Marketing", path: null },
    { name: "Tài chính", path: null },
    { name: "Dữ liệu", path: null },
  ];

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      toast.info(`Tính năng "${item.name}" đang phát triển`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-2">
        <div className="flex justify-between px-6 text-sm">
          <div className="flex space-x-4">
            <span>🏪 Kênh Người Bán</span>
            <span>Trung tâm hỗ trợ</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="cursor-pointer hover:text-orange-200">
              🔔 Thông báo
            </span>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32"
                  alt="avatar"
                  className="h-8 w-8 rounded-full border-2 border-white"
                />
                <span>{user?.fullname || "Bunny Store"}</span>
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
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold cursor-pointer" onClick={() => navigate("/seller/home")}>
            EvoMarket Seller
          </h1>
          <nav className="flex space-x-6">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleMenuClick(item)}
                className={`pb-1 hover:text-orange-200 transition ${
                  location.pathname === item.path ? "border-b-2 border-white" : ""
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <button 
          onClick={() => navigate("/seller/products")}
          className="rounded-xl bg-white px-4 py-2 font-medium text-orange-500 shadow hover:bg-orange-50 transition"
        >
          + Thêm sản phẩm
        </button>
      </div>
    </header>
  );
}
