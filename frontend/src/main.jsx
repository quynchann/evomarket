import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient.js'
import { Toaster } from 'sonner'
import './index.css'
import '@/stores/useSystemSocketStore.js'
import '@/stores/useChatSocketStore.js'
import App from './App.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'

// Admin
import AdminLogin from './components/admin/auth/Login.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminOverview from './components/admin/AdminOverview.jsx'
import AdminOrdersPage from './components/admin/AdminOrdersPage.jsx'
import AdminUsersPage from './components/admin/AdminUsersPage.jsx'
import AdminProductsPage from './components/admin/AdminProductsPage.jsx'
import AdminReviewsPage from './components/admin/AdminReviewsPage.jsx'
import AdminCouponsPage from './components/admin/AdminCouponsPage.jsx'
import AdminNotifyPage from './components/admin/AdminNotifyPage.jsx'
import AdminChatPage from './components/admin/AdminChatPage.jsx'

// Customer
import { CustomerLogin } from './components/customer/auth/Login.jsx'
import { CustomerRegister } from './components/customer/auth/Register.jsx'
import { CustomerLayout } from './components/customer/layout/CustomerLayout.jsx'
import Homepage from './components/customer/Home.jsx'
import CategoryProducts from './components/customer/CategoryProducts.jsx'
import AllProducts from './components/customer/AllProducts.jsx'
import ProductDetail from './components/customer/ProductDetail.jsx'
import ARTryOnScreen from './components/customer/ARTryOnScreen.jsx'
import ShopProfile from './components/customer/ShopProfile.jsx'
import Profile from './components/customer/Profile.jsx'
import ChatPage from './components/customer/ChatPage.jsx'
import CustomerAddress from './components/customer/CustomerAddress.jsx'
import NotificationSettings from './components/customer/NotificationSettings.jsx'
import SystemNotifications from './components/customer/SystemNotifications.jsx'
import PrivacySettings from './components/customer/PrivacySettings.jsx'
import Cart from './components/customer/Cart.jsx'
import Checkout from './components/customer/Checkout.jsx'
import OrderSuccess from './components/customer/OrderSuccess.jsx'
import BuyerOrders from './components/customer/BuyerOrders.jsx'
import BuyerOrderDetail from './components/customer/BuyerOrderDetail.jsx'
import PaymentWallet from './components/customer/PaymentWallet.jsx'
import CustomerSupport from './components/customer/CustomerSupport.jsx'
import SearchProducts from './components/customer/SearchProducts.jsx'

// Seller
import { SellerLogin } from './components/seller/auth/Login.jsx'
import { SellerRegister } from './components/seller/auth/Register.jsx'
import { SellerLayout } from './components/seller/layout/SellerLayout.jsx'
import Home from './components/seller/Home.jsx'
import ProductManagement from './components/seller/ProductManagement.jsx'
import ProductForm from './components/seller/ProductForm.jsx'
import OrdersManager from './components/seller/OrdersManager.jsx'
import SellerChatPage from './components/seller/ChatPage.jsx'
import SellerProfile from './components/seller/SellerProfile.jsx'
import SellerSettings from './components/seller/SellerSettings.jsx'
import SellerCouponManagement from './components/seller/SellerCouponManagement.jsx'
import SellerNotifications from './components/seller/SellerNotifications.jsx'
import SellerReports from './components/seller/SellerReports.jsx'
import SellerSupport from './components/seller/SellerSupport.jsx'

const customerPublicRoutes = {
  path: 'customer',
  element: <CustomerLayout />,
  children: [
    { path: 'homepage', Component: Homepage },
    { path: 'search', Component: SearchProducts },
    { path: 'products', Component: AllProducts },
    { path: 'categories/:categoryId', Component: CategoryProducts },
    { path: 'products/:id', Component: ProductDetail },
    { path: 'shops/:sellerId', Component: ShopProfile },
  ],
}

const customerProtectedRoutes = {
  path: 'customer',
  element: (
    <ProtectedRoute allowedRoles={['buyer']} redirectTo="/customer/login" />
  ),
  children: [
    {
      element: <CustomerLayout />,
      children: [
        { path: 'profile', Component: Profile },
        { path: 'chat', Component: ChatPage },
        { path: 'chat/:conversationId', Component: ChatPage },
        { path: 'bank', Component: PaymentWallet },
        { path: 'address', Component: CustomerAddress },
        { path: 'notifications', Component: SystemNotifications },
        {
          path: 'notification-settings',
          Component: NotificationSettings,
        },
        { path: 'privacy-settings', Component: PrivacySettings },
        { path: 'cart', Component: Cart },
        { path: 'checkout', Component: Checkout },
        { path: 'order-success/:orderId', Component: OrderSuccess },
        { path: 'orders', Component: BuyerOrders },
        { path: 'orders/:orderId', Component: BuyerOrderDetail },
        { path: 'support', Component: CustomerSupport },
      ],
    },
  ],
}

const adminRoutes = {
  path: 'admin',
  element: (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login" />
  ),
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', Component: AdminOverview },
        { path: 'orders', Component: AdminOrdersPage },
        { path: 'user-management', Component: AdminUsersPage },
        { path: 'product-management', Component: AdminProductsPage },
        { path: 'review', Component: AdminReviewsPage },
        { path: 'sale', Component: AdminCouponsPage },
        { path: 'notification', Component: AdminNotifyPage },
        {
          path: 'analysis',
          element: <Navigate to="/admin/dashboard" replace />,
        },
        { path: 'chat', Component: AdminChatPage },
        { path: 'chat/:conversationId', Component: AdminChatPage },
      ],
    },
  ],
}

const sellerRoutes = {
  path: 'seller',
  element: (
    <ProtectedRoute allowedRoles={['seller']} redirectTo="/seller/login" />
  ),
  children: [
    {
      element: <SellerLayout />,
      children: [
        { path: 'home', Component: Home },
        { path: 'products', Component: ProductManagement },
        { path: 'products/new', Component: ProductForm },
        { path: 'products/:id/edit', Component: ProductForm },
        { path: 'coupons', Component: SellerCouponManagement },
        { path: 'orders', Component: OrdersManager },
        { path: 'chat', Component: SellerChatPage },
        { path: 'chat/:conversationId', Component: SellerChatPage },
        { path: 'profile', Component: SellerProfile },
        { path: 'settings', Component: SellerSettings },
        { path: 'notifications', Component: SellerNotifications },
        { path: 'reports', Component: SellerReports },
        { path: 'support', Component: SellerSupport },
      ],
    },
  ],
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      // Public routes
      { index: true, element: <Navigate to="/customer/login" replace /> },

      { path: 'admin/login', Component: AdminLogin },
      { path: 'customer/login', Component: CustomerLogin },
      { path: 'customer/register', Component: CustomerRegister },
      { path: 'seller/login', Component: SellerLogin },
      { path: 'seller/signup', Component: SellerRegister },

      // AR Try-On screen (without layout for fullscreen experience)
      customerPublicRoutes,
      { path: 'products/:id/try-on', Component: ARTryOnScreen },

      adminRoutes,
      customerProtectedRoutes,
      sellerRoutes,
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  </StrictMode>,
)
