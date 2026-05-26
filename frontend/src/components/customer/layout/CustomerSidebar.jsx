import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  ShoppingCart,
  User,
  MessageSquare,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import logoEvo from '../../../assets/logo-evo.png'
import { useSidebar } from '@/components/ui/sidebar'
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

export function CustomerSidebar({ cartCount = 0 }) {
  const location = useLocation()
  const { open, isMobile } = useSidebar()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const unreadCount = useSystemSocketStore((s) => s.unreadCount)

  const profileSubmenus = [
    { title: 'Hồ Sơ', url: '/customer/profile' },
    { title: 'Ví thanh toán', url: '/customer/bank' },
    { title: 'Địa Chỉ', url: '/customer/address' },
    { title: 'Cài Đặt Thông Báo', url: '/customer/notification-settings' },
    { title: 'Những Thiết Lập Riêng Tư', url: '/customer/privacy-settings' },
  ]

  const menuItems = [
    {
      title: 'Trang chủ',
      icon: Home,
      url: '/customer/homepage',
    },
    {
      title: 'Giỏ hàng',
      icon: ShoppingCart,
      url: '/customer/cart',
      badge: cartCount,
    },
    {
      title: 'Tài khoản của tôi',
      icon: User,
      url: '/customer/profile',
      hasSubmenu: true,
    },
    {
      title: 'Đơn hàng',
      icon: Package,
      url: '/customer/orders',
    },
    {
      title: 'Thông báo',
      icon: Bell,
      url: '/customer/notifications',
      badge: unreadCount > 0 ? unreadCount : 0,
    },
    {
      title: 'Chat',
      icon: MessageSquare,
      url: '/customer/chat',
    },
  ]

  return (
    <Sidebar
      collapsible={isMobile ? 'offcanvas' : 'icon'}
      className="h-full border-r-0">
      <SidebarHeader className="flex h-20 items-center justify-center border-b border-white/20 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600">
        {open ? (
          <div className="flex items-center gap-3 px-4">
            <img
              src={logoEvo}
              alt="EvoMarket Logo"
              className="h-10 w-10 flex-shrink-0 object-contain"
            />
            <h1 className="text-xl font-bold whitespace-nowrap text-white">
              <span className="text-orange-200">Evo</span>
              <span className="text-white">Market</span>
            </h1>
          </div>
        ) : (
          <img
            src={logoEvo}
            alt="EvoMarket Logo"
            className="h-9 w-9 object-contain"
          />
        )}
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-orange-500 via-orange-600 to-red-600">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-6">
              {menuItems.map((item) => {
                const isActive =
                  item.url === '/customer/orders'
                    ? location.pathname.startsWith('/customer/orders')
                    : location.pathname === item.url
                const isProfileSection =
                  item.hasSubmenu &&
                  profileSubmenus.some((sub) => location.pathname === sub.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.hasSubmenu ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => setIsProfileOpen(!isProfileOpen)}
                          isActive={isActive || isProfileSection}
                          tooltip={item.title}
                          className={`group relative cursor-pointer transition-all duration-200 group-data-[collapsible=icon]:!justify-center ${
                            isActive || isProfileSection
                              ? 'bg-white font-semibold text-orange-600 shadow-md'
                              : 'text-white hover:bg-white/20'
                          } `}>
                          <item.icon className="h-5 w-5" strokeWidth={2} />
                          <span className="flex-1 text-sm">{item.title}</span>
                          {open &&
                            (isProfileOpen ? (
                              <ChevronUp className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            ))}
                        </SidebarMenuButton>

                        {isProfileOpen && open && (
                          <div className="mt-1 ml-4 space-y-1 border-l-2 border-white/30 pl-2">
                            {profileSubmenus.map((submenu) => {
                              const isSubmenuActive =
                                location.pathname === submenu.url
                              return (
                                <Link
                                  key={submenu.title}
                                  to={submenu.url}
                                  className={`block rounded-md px-3 py-2 text-xs transition-all duration-200 ${
                                    isSubmenuActive
                                      ? 'bg-white font-semibold text-orange-600 shadow-sm'
                                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                                  } `}>
                                  {submenu.title}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`group relative transition-all duration-200 group-data-[collapsible=icon]:!justify-center ${
                          isActive
                            ? 'bg-white font-semibold text-orange-600 shadow-md'
                            : 'text-white hover:bg-white/20'
                        } `}>
                        <Link
                          to={item.url}
                          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={2}
                          />
                          <span className="text-sm group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {item.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-top-1 group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:text-[10px]">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
