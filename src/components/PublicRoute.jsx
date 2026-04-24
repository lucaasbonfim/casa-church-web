import { Navigate, Outlet } from "react-router-dom";
import { hasValidStoredSession } from "../utils/authStorage";

export default function PublicRoute() {
  if (hasValidStoredSession()) return <Navigate to="/" replace />;
  return <Outlet />;
}
