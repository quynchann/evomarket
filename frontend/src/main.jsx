import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient.js";
import { Toaster } from "sonner";
import "./index.css";
import "@/stores/useSystemSocketStore.js";
import "@/stores/useChatSocketStore.js";
import App from "./App.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

// Admin imports
import AdminLogin from "./components/admin/auth/Login.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminOverview from "./components/admin/AdminOverview.jsx";
import AdminOrdersPage from "./components/admin/AdminOrdersPage.jsx";
import AdminUsersPage from "./components/admin/AdminUsersPage.jsx";
import AdminProductsPage from "./components/admin/AdminProductsPage.jsx";
import AdminReviewsPage from "./components/admin/AdminReviewsPage.jsx";
import AdminCouponsPage from "./components/admin/AdminCouponsPage.jsx";
import AdminNotifyPage from "./components/admin/AdminNotifyPage.jsx";
import AdminChatPage from "./components/admin/AdminChatPage.jsx";

// Customer imports
import { CustomerLogin } from "./components/customer/auth/Login.jsx";
import { CustomerRegister } from "./components/customer/auth/Register.jsx";
import { CustomerLayout } from "./components/customer/layout/CustomerLayout.jsx";
import Homepage from "./components/customer/Home.jsx";
import CategoryProducts from "./components/customer/CategoryProducts.jsx";
import ProductDetail from "./components/customer/ProductDetail.jsx";
import ARTryOnScreen from "./components/customer/ARTryOnScreen.jsx";
import ShopProfile from "./components/customer/ShopProfile.jsx";
import Profile from "./components/customer/Profile.jsx";
import ChatPage from "./components/customer/ChatPage.jsx";
import CustomerAddress from "./components/customer/CustomerAddress.jsx";
import NotificationSettings from "./components/customer/NotificationSettings.jsx";
import SystemNotifications from "./components/customer/SystemNotifications.jsx";
import PrivacySettings from "./components/customer/PrivacySettings.jsx";
import Cart from "./components/customer/Cart.jsx";
import Checkout from "./components/customer/Checkout.jsx";
import OrderSuccess from "./components/customer/OrderSuccess.jsx";
import BuyerOrders from "./components/customer/BuyerOrders.jsx";
import BuyerOrderDetail from "./components/customer/BuyerOrderDetail.jsx";
import PaymentWallet from "./components/customer/PaymentWallet.jsx";

// Seller imports
import { SellerLogin } from "./components/seller/auth/Login.jsx";
import { SellerRegister } from "./components/seller/auth/Register.jsx";
import { SellerLayout } from "./components/seller/layout/SellerLayout.jsx";
import Home from "./components/seller/Home.jsx";
import ProductManagement from "./components/seller/ProductManagement.jsx";
import ProductForm from "./components/seller/ProductForm.jsx";
import OrdersManager from "./components/seller/OrdersManager.jsx";
import SellerChatPage from "./components/seller/ChatPage.jsx";
import SellerProfile from "./components/seller/SellerProfile.jsx";
import SellerSettings from "./components/seller/SellerSettings.jsx";
import SellerCouponManagement from "./components/seller/SellerCouponManagement.jsx";
import SellerNotifications from "./components/seller/SellerNotifications.jsx";
import SellerReports from "./components/seller/SellerReports.jsx";
import SellerSupport from "./components/seller/SellerSupport.jsx";
import CustomerSupport from "./components/customer/CustomerSupport.jsx";
import SearchProducts from "./components/customer/SearchProducts.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      // Public routes
      { path: "admin/login", Component: AdminLogin },
      { path: "customer/login", Component: CustomerLogin },
      { path: "customer/register", Component: CustomerRegister },
      { path: "seller/login", Component: SellerLogin },
      { path: "seller/signup", Component: SellerRegister },

      // Customer routes with layout
      {
        element: <CustomerLayout />,
        children: [
          { path: "customer/homepage", Component: Homepage },
          { path: "customer/search", Component: SearchProducts },
          {
            path: "customer/categories/:categoryId",
            Component: CategoryProducts,
          },
          { path: "customer/products/:id", Component: ProductDetail },
          { path: "customer/shops/:sellerId", Component: ShopProfile },
        ],
      },

      // AR Try-On screen (without layout for fullscreen experience)
      { path: "products/:id/try-on", Component: ARTryOnScreen },

      // Admin: /admin/* — layout chung; chat chỉ đổi khung, giữ ChatShell
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login" />
        ),
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", Component: AdminOverview },
              { path: "orders", Component: AdminOrdersPage },
              { path: "user-management", Component: AdminUsersPage },
              { path: "product-management", Component: AdminProductsPage },
              { path: "review", Component: AdminReviewsPage },
              { path: "sale", Component: AdminCouponsPage },
              { path: "notification", Component: AdminNotifyPage },
              {
                path: "analysis",
                element: <Navigate to="/admin/dashboard" replace />,
              },
              { path: "chat/:conversationId", Component: AdminChatPage },
              { path: "chat", Component: AdminChatPage },
            ],
          },
        ],
      },

      // Customer protected routes with layout
      {
        element: (
          <ProtectedRoute
            allowedRoles={["buyer"]}
            redirectTo="/customer/login"
          />
        ),
        children: [
          {
            element: <CustomerLayout />,
            children: [
              { path: "customer/profile", Component: Profile },
              { path: "customer/chat/:conversationId", Component: ChatPage },
              { path: "customer/chat", Component: ChatPage },
              { path: "customer/bank", Component: PaymentWallet },
              { path: "customer/address", Component: CustomerAddress },
              { path: "customer/notifications", Component: SystemNotifications },
              {
                path: "customer/notification-settings",
                Component: NotificationSettings,
              },
              { path: "customer/privacy-settings", Component: PrivacySettings },
              { path: "customer/cart", Component: Cart },
              { path: "customer/checkout", Component: Checkout },
              { path: "customer/order-success/:orderId", Component: OrderSuccess },
              { path: "customer/orders", Component: BuyerOrders },
              { path: "customer/orders/:orderId", Component: BuyerOrderDetail },
              { path: "customer/support", Component: CustomerSupport },
            ],
          },
        ],
      },

      // Seller protected routes
      {
        element: (
          <ProtectedRoute
            allowedRoles={["seller"]}
            redirectTo="/seller/login"
          />
        ),
        children: [
          {
            element: <SellerLayout />,
            children: [
              { path: "seller/home", Component: Home },
              { path: "seller/products", Component: ProductManagement },
              { path: "seller/products/new", Component: ProductForm },
              { path: "seller/products/:id/edit", Component: ProductForm },
              { path: "seller/coupons", Component: SellerCouponManagement },
              { path: "seller/orders", Component: OrdersManager },
              { path: "seller/chat/:conversationId", Component: SellerChatPage },
              { path: "seller/chat", Component: SellerChatPage },
              { path: "seller/profile", Component: SellerProfile },
              { path: "seller/settings", Component: SellerSettings },
              { path: "seller/notifications", Component: SellerNotifications },
              { path: "seller/reports", Component: SellerReports },
              { path: "seller/support", Component: SellerSupport },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  </StrictMode>,
);
