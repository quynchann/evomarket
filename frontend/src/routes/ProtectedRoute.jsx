import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function ProtectedRoute({ allowedRoles, redirectTo = "/auth/login" }) {
  const { isAuthenticated, user } = useAuthStore();
  const [hasShownError, setHasShownError] = useState(false);
  const navigate = useNavigate();

  const role = user?.role;

  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    if (isAuthenticated) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', preventBack);
    }

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (isAuthenticated && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      if (!role || !allowedRoles.includes(role)) {
        if (!hasShownError) {
          toast.error("Bạn không có quyền truy cập trang này!");
          setHasShownError(true);
        }
      }
    }
  }, [isAuthenticated, role, allowedRoles, hasShownError, navigate, redirectTo]);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      if (role === 'buyer') {
        return <Navigate to="/customer/homepage" replace />;
      } else if (role === 'seller') {
        return <Navigate to="/seller/home" replace />;
      } else if (role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
}
