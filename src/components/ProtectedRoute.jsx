import { Navigate, Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import { clearStoredUser, hasValidStoredSession } from "../utils/authStorage";

export default function ProtectedRoute() {
  const isAuthenticated = hasValidStoredSession();

  if (!isAuthenticated) {
    clearStoredUser();
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
