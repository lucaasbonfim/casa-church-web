import axios from "axios";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.jsx";
import Events from "./containers/Events.jsx";
import Event from "./containers/Event.jsx";
import Login from "./containers/Login.jsx";
import Register from "./containers/Register.jsx";
import ForgotPassword from "./containers/ForgotPassword.jsx";
import ResetPassword from "./containers/ResetPassword.jsx";
import Contacts from "./containers/Contacts.jsx";
import Social from "./containers/Social.jsx";
import ChurchHouses from "./containers/ChurchHouses.jsx";
import Devotional from "./containers/Devotional.jsx";
import AdminDashboard from "./containers/admin/AdminDashboard";
import AdminEvents from "./containers/admin/AdminEvents";
import AdminSermons from "./containers/admin/AdminSermons";
import AdminChurchHouses from "./containers/admin/AdminChurchHouses.jsx";
import AdminDevotionals from "./containers/admin/AdminDevotionals.jsx";
import AdminHomeContent from "./containers/admin/AdminHomeContent.jsx";
import AdminPageContent from "./containers/admin/AdminPageContent.jsx";
import AdminContacts from "./containers/admin/AdminContacts.jsx";
import AdminLessons from "./containers/admin/AdminLessons.jsx";
import AdminPosts from "./containers/admin/AdminPosts.jsx";
import AdminUsers from "./containers/admin/AdminUsers.jsx";
import AdminActivities from "./containers/admin/AdminActivities.jsx";
import Sermons from "./containers/Sermons.jsx";
import Lessons from "./containers/Lessons.jsx";
import Lesson from "./containers/Lesson.jsx";
import About from "./containers/About.jsx";
import Profile from "./containers/Profile.jsx";
import Donations from "./containers/Donations.jsx";
import Gallery from "./containers/Gallery.jsx";
import EmailConfirmation from "./containers/EmailConfirmation.jsx";
import UnderConstruction from "./containers/UnderConstruction";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ToastProvider from "./components/ToastProvider.jsx";
import AdminRoute from "./components/AdminRoute";
import SiteLayout from "./components/SiteLayout.jsx";
import { clearStoredUser, getStoredToken } from "./utils/authStorage";

function syncAxiosAuthorizationHeader() {
  const token = getStoredToken();

  if (token) {
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export default function App() {
  syncAxiosAuthorizationHeader();

  useEffect(() => {
    const responseInterceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          clearStoredUser();
          delete axios.defaults.headers.common["Authorization"];
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/evento/:id" element={<Event />} />
          <Route path="/contatos" element={<Contacts />} />
          <Route path="/cis" element={<ChurchHouses />} />
          <Route path="/devocional" element={<Devotional />} />
          <Route path="/social" element={<Social />} />
          <Route path="/sermoes" element={<Sermons />} />
          <Route path="/sermons/:sermonId" element={<Lessons />} />
          <Route
            path="/sermons/:sermonId/aulas/:lessonId"
            element={<Lesson />}
          />
          <Route path="/sobre" element={<About />} />
          <Route path="/doacoes" element={<Donations />} />
          <Route path="/oferta" element={<Donations />} />
          <Route path="/ofertas" element={<Donations />} />
          <Route path="/galeria" element={<Gallery />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<Profile />} />
        </Route>
        <Route path="/confirmar-email" element={<EmailConfirmation />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inicio" element={<AdminHomeContent />} />
          <Route path="/admin/paginas" element={<AdminPageContent />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/admin/devocionais" element={<AdminDevotionals />} />
          <Route path="/admin/sermoes" element={<AdminSermons />} />
          <Route path="/admin/cis" element={<AdminChurchHouses />} />
          <Route path="/admin/contatos" element={<AdminContacts />} />
          <Route path="/admin/licoes" element={<AdminLessons />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/atividades" element={<AdminActivities />} />
          <Route
            path="/admin/doacoes"
            element={<AdminPageContent initialSlug="donations" />}
          />
          <Route
            path="/admin/*"
            element={
              <UnderConstruction
                title="Area administrativa"
                description="Esta funcionalidade administrativa ainda esta em desenvolvimento."
              />
            }
          />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Register />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
        </Route>

        <Route
          path="*"
          element={<div className="p-6 text-white">Pagina nao encontrada</div>}
        />
      </Routes>
      <ToastProvider />
    </>
  );
}
