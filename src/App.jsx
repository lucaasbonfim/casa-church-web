import axios from "axios";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.jsx";
import Events from "./containers/Events.jsx";
import Event from "./containers/Event.jsx";
import Login from "./containers/Login.jsx";
import Register from "./containers/Register.jsx";
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
import Sermons from "./containers/Sermons.jsx";
import Lessons from "./containers/Lessons.jsx";
import Lesson from "./containers/Lesson.jsx";
import About from "./containers/About.jsx";
import Profile from "./containers/Profile.jsx";
import UnderConstruction from "./containers/UnderConstruction";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ToastProvider from "./components/ToastProvider.jsx";
import AdminRoute from "./components/AdminRoute";
import {
  clearStoredUser,
  getStoredToken,
} from "./utils/authStorage";

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
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
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
          <Route path="/perfil" element={<Profile />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inicio" element={<AdminHomeContent />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/admin/devocionais" element={<AdminDevotionals />} />
          <Route path="/admin/sermoes" element={<AdminSermons />} />
          <Route path="/admin/cis" element={<AdminChurchHouses />} />
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
