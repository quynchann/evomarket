import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleBeforeUnload = () => {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated) {
        sessionStorage.setItem("loggedOut", "true");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const protectedPaths = [
      "/customer/homepage",
      "/customer/categories",
      "/customer/profile",
      "/customer/chat",
      "/customer/bank",
      "/customer/address",
      "/customer/notifications",
      "/customer/notification-settings",
      "/customer/privacy-settings",
      "/customer/personal-info",
      "/customer/cart",
      "/customer/checkout",
      "/customer/order-success",
      "/customer/orders",
      "/customer/support",
      "/seller/home",
      "/seller/products",
      "/seller/coupons",
      "/seller/orders",
      "/seller/chat",
      "/seller/support",
      "/admin/dashboard",
      "/admin/user-management",
      "/admin/product-management",
      "/admin/chat",
    ];

    const isProtectedPath = protectedPaths.some((path) =>
      location.pathname.startsWith(path),
    );

    if (isProtectedPath && !isAuthenticated) {
      if (location.pathname.startsWith("/admin/")) {
        navigate("/admin/login", { replace: true });
      } else if (location.pathname.startsWith("/seller/")) {
        navigate("/seller/login", { replace: true });
      } else if (location.pathname.startsWith("/customer/")) {
        navigate("/customer/login", { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, navigate]);

  return (
    <>
      <Outlet />
    </>
  );
}

export default App;
