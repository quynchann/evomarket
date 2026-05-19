import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

const CUSTOM_CLASSES = {
  gradientOrange: 'bg-gradient-to-br from-orange-600 to-orange-400',
  notificationDot:
    'w-2 h-2 bg-red-500 rounded-full ring-2 ring-white absolute top-1.5 right-1.5',
}

const NAV = [
  { icon: '📊', label: 'Tổng quan', path: '/admin/dashboard' },
  { icon: '🛒', label: 'Đơn hàng', path: '/admin/orders' },
  { icon: '👥', label: 'Người dùng', path: '/admin/user-management' },
  { icon: '📦', label: 'Sản phẩm', path: '/admin/product-management' },
  { icon: '⭐', label: 'Đánh giá', path: '/admin/review' },
  { icon: '🎁', label: 'Mã giảm giá sàn', path: '/admin/sale' },
  { icon: '🔔', label: 'Thông báo', path: '/admin/notification' },
  { icon: '💬', label: 'Chat', path: '/admin/chat' },
]

function navActive(pathname, path) {
  if (path === '/admin/chat') return pathname.startsWith('/admin/chat')
  return pathname === path || pathname.startsWith(`${path}/`)
}

function NavItem({ icon, label, active, onClick }) {
  const baseClasses =
    'flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition duration-200 ease-in-out border-l-4 border-transparent cursor-pointer'
  const hoverClasses = 'hover:bg-orange-50 hover:border-orange-500'
  const activeClasses = active
    ? 'bg-orange-100/50 border-orange-600 font-semibold'
    : ''
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${activeClasses} w-full text-left`}
      style={
        active
          ? {
              backgroundColor: 'rgba(249, 115, 22, 0.12)',
              borderColor: '#f97316',
            }
          : {}
      }>
      <span className="text-xl">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <aside className="fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className={`${CUSTOM_CLASSES.gradientOrange} flex h-20 shrink-0 items-center px-6`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-2xl">
              🛍️
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">EvoMarket</h1>
              <p className="text-xs text-orange-100">Quản trị</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={navActive(pathname, item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-50"
              onClick={() => setMenuOpen(!menuOpen)}>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white ${CUSTOM_CLASSES.gradientOrange}`}>
                {(user?.fullname || 'A').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {user?.fullname || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Đăng xuất</p>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-2 right-2 z-50 mb-2 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
