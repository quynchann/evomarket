import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";
import "@/stores/useSystemSocketStore.js";
import "@/stores/useChatSocketStore.js";
import App from "./App.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

// Admin imports
import AdminLogin from "./components/admin/auth/Login.jsx";
import Dashboard from "./components/admin/Dashboard.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";
import ProductManager from "./components/admin/ProductManagement.jsx";
import AdminNotification from "./components/admin/Notification.jsx";
import Sale from "./components/admin/Sale.jsx";
import ReviewManagement from "./components/admin/ReviewManagement.jsx";
import Analysis from "./components/admin/Analysis.jsx";
import Setting from "./components/admin/Setting.jsx";

// Customer imports
import { CustomerLogin } from "./components/customer/auth/Login.jsx";
import { CustomerRegister } from "./components/customer/auth/Register.jsx";
import { CustomerLayout } from "./components/customer/layout/CustomerLayout.jsx";
import Homepage from "./components/customer/Home.jsx";
import ProductDetail from "./components/customer/ProductDetail.jsx";
import Profile from "./components/customer/Profile.jsx";
import ChatPage from "./components/customer/ChatPage.jsx";
import CustomerAddress from "./components/customer/CustomerAddress.jsx";
import NotificationSettings from "./components/customer/NotificationSettings.jsx";
import PrivacySettings from "./components/customer/PrivacySettings.jsx";
import PersonalInfo from "./components/customer/PersonalInfo.jsx";
import Cart from "./components/customer/Cart.jsx";
import Checkout from "./components/customer/Checkout.jsx";
import OrderSuccess from "./components/customer/OrderSuccess.jsx";

// Seller imports
import { SellerLogin } from "./components/seller/auth/Login.jsx";
import { SellerRegister } from "./components/seller/auth/Register.jsx";
import { SellerLayout } from "./components/seller/layout/SellerLayout.jsx";
import Home from "./components/seller/Home.jsx";
import ProductManagement from "./components/seller/ProductManagement.jsx";
import OrdersManager from "./components/seller/OrdersManager.jsx";
import SellerChatPage from "./components/seller/ChatPage.jsx";

const queryClient = new QueryClient();

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
          { path: "customer/products/:id", Component: ProductDetail },
        ],
      },

      // Admin protected routes
      {
        element: (
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login" />
        ),
        children: [
          { path: "admin/dashboard", Component: Dashboard },
          { path: "admin/user-management", Component: UserManagement },
          { path: "admin/product-management", Component: ProductManager },
          { path: "admin/notification", Component: AdminNotification },
          { path: "admin/sale", Component: Sale },
          { path: "admin/review", Component: ReviewManagement },
          { path: "admin/analysis", Component: Analysis },
          { path: "admin/setting", Component: Setting },
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
              { path: "customer/address", Component: CustomerAddress },
              { path: "customer/notifications", Component: NotificationSettings },
              { path: "customer/privacy-settings", Component: PrivacySettings },
              { path: "customer/personal-info", Component: PersonalInfo },
              { path: "customer/cart", Component: Cart },
              { path: "customer/checkout", Component: Checkout },
              { path: "customer/order-success/:orderId", Component: OrderSuccess },
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
              { path: "seller/orders", Component: OrdersManager },
              { path: "seller/chat/:conversationId", Component: SellerChatPage },
              { path: "seller/chat", Component: SellerChatPage },
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
