import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  clearStoredUser,
  getStoredUser,
  hasValidStoredSession,
} from "../utils/authStorage";
import {
  canAccessAdminArea,
  getAdminModuleByPath,
  getFirstAllowedAdminPath,
  hasAdminModuleAccess,
} from "../utils/adminPermissions";

export default function AdminRoute() {
  const location = useLocation();

  if (!hasValidStoredSession()) {
    clearStoredUser();
    return <Navigate to="/login" replace />;
  }

  const storedUser = getStoredUser();
  let user = storedUser;

  if (storedUser?.token && !storedUser?.role) {
    try {
      const decoded = jwtDecode(storedUser.token);
      user = {
        ...storedUser,
        role: decoded?.role,
        adminModules: Array.isArray(decoded?.adminModules)
          ? decoded.adminModules
          : storedUser?.adminModules,
      };
    } catch {
      user = storedUser;
    }
  }

  if (!user || !canAccessAdminArea(user)) {
    return <Navigate to="/" replace />;
  }

  const moduleKey = getAdminModuleByPath(location.pathname);
  if (moduleKey && !hasAdminModuleAccess(user, moduleKey)) {
    return <Navigate to={getFirstAllowedAdminPath(user)} replace />;
  }

  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    return <Navigate to={getFirstAllowedAdminPath(user)} replace />;
  }

  return <Outlet />;
}
