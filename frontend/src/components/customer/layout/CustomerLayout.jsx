import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { cartApi, cartQueryKeys } from '../../../services/cartApi'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { CustomerSidebar } from './CustomerSidebar'
import { CustomerHeader } from './CustomerHeader'

export function CustomerLayout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: cartPayload } = useQuery({
    queryKey: cartQueryKeys.cart,
    queryFn: async () => {
      const res = await cartApi.getCart()
      return res.data
    },
    enabled: user?.role === 'buyer',
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const cartCount = cartPayload?.summary?.totalQuantity ?? 0

  useEffect(() => {
    const preventBack = () => {
      if (!useAuthStore.getState().isAuthenticated) {
        navigate('/customer/login', { replace: true })
      }
    }

    window.addEventListener('popstate', preventBack)

    return () => {
      window.removeEventListener('popstate', preventBack)
    }
  }, [navigate])

  return (
    <SidebarProvider className="h-dvh bg-linear-to-br from-orange-50 via-white to-red-50">
      <CustomerSidebar cartCount={cartCount} />
      <SidebarInset>
        <CustomerHeader cartCount={cartCount} />
        <main className="h-svh w-full flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
