import axios from "axios";
import { Routes, Route } from "react-router-dom";

// containers
import Home from "./containers/Home.jsx";
import Events from "./containers/Events.jsx";
import Event from "./containers/Event.jsx";
import Login from "./containers/Login.jsx";
import Register from "./containers/Register.jsx";
import Contacts from "./containers/Contacts.jsx";
import Social from "./containers/Social.jsx"
import AdminDashboard from "./containers/admin/AdminDashboard";
import AdminEvents from "./containers/admin/AdminEvents";
import AdminSermons from "./containers/admin/AdminSermons";
import Sermons from "./containers/Sermons.jsx";
import Lessons from "./containers/Lessons.jsx";
import Lesson from "./containers/Lesson.jsx";
import About from "./containers/About.jsx";
import Profile from "./containers/Profile.jsx"
import UnderConstruction from "./containers/UnderConstruction";

// components
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ToastProvider from "./components/ToastProvider.jsx";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  try {
    const raw = localStorage.getItem("user");
    const token = raw ? JSON.parse(raw)?.token : null;
    axios.defaults.headers.common["Authorization"] = token ?? "";
  } catch {
    axios.defaults.headers.common["Authorization"] = "";
  }

  const getStoredToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    return user?.token || null;
  };

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  setAuthHeader(getStoredToken());

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/evento/:id" element={<Event />} />
          <Route path="/contatos" element={<Contacts />} />
          <Route path="/social" element={<Social />} />
          <Route path="/sermoes" element={<Sermons />} />
          <Route path="/sermons/:sermonId" element={<Lessons />} />
          <Route path="/sermons/:sermonId/aulas/:lessonId" element={<Lesson />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/admin/sermoes" element={<AdminSermons />} />
          <Route path="/admin/*" element={ <UnderConstruction
            title="Área administrativa"
            description="Esta funcionalidade administrativa ainda está em desenvolvimento."/>} 
          />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Register />} />
        </Route>
        <Route
          path="*"
          element={<div className="p-6 text-white">Página não encontrada</div>}
        />
      </Routes>
      <ToastProvider />
    </>
  );
}
