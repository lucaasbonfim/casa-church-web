import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  let isAuthenticated = false;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      isAuthenticated = Boolean(user?.token);
    }
  } catch {
    isAuthenticated = false;
  }

  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
