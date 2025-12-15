import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute() {
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  let decoded = null;
  let isAdmin = false;
  let hasError = false;

  
  try {
    user = JSON.parse(userStr);
    
    if (user && user.token) {
      decoded = jwtDecode(user.token);
      isAdmin = decoded.role === "admin";
    }
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    hasError = true;
  }

  if (hasError || !user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}