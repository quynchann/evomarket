import { useEffect, useMemo } from 'react'
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

  /** Tổng số lượng sản phẩm (cộng dồn); fallback từ items nếu summary lệch cache */
  const cartCount = useMemo(() => {
    const q = cartPayload?.summary?.totalQuantity
    if (typeof q === 'number' && Number.isFinite(q)) return q
    const items = cartPayload?.items ?? []
    return items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
  }, [cartPayload])

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
