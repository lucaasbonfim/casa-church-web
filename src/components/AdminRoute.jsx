import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  clearStoredUser,
  getStoredUser,
  hasValidStoredSession,
} from "../utils/authStorage";

export default function AdminRoute() {
  if (!hasValidStoredSession()) {
    clearStoredUser();
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();

  try {
    const decoded = jwtDecode(user.token);
    const isAdmin = decoded.role === "admin";

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    clearStoredUser();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
