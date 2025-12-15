import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function ProtectedRoute() {
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

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
