import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Menu, X } from "lucide-react";
import Avatar from "./Avatar";
import Dropdown from "./Dropdown";
import LogoName from "../assets/logo-name.png";
import {
  AUTH_EVENT_NAME,
  clearStoredUser,
  getStoredUser,
  hasValidStoredSession,
} from "../utils/authStorage";

export default function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser() || {});
  const userName = user?.name || "Usuario";
  const isAuthenticated = Boolean(user?.token) && hasValidStoredSession();

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser() || {});

    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_EVENT_NAME, syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_EVENT_NAME, syncUser);
    };
  }, []);

  let isAdmin = false;
  try {
    if (isAuthenticated) {
      const decoded = jwtDecode(user.token);
      isAdmin = decoded.role === "admin";
    }
  } catch (error) {
    console.error("Erro ao verificar role:", error);
  }

  function logout() {
    clearStoredUser();
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  }

  const menuItems = [
    {
      label: "Perfil",
      icon: "User",
      onSelect: () => navigate("/perfil"),
    },
    ...(isAdmin
      ? [
          { type: "separator" },
          {
            label: "Painel Admin",
            icon: "Shield",
            className: "text-purple-500 hover:bg-purple-500/10",
            onSelect: () => navigate("/admin/dashboard"),
          },
        ]
      : []),
    { type: "separator" },
    {
      label: "Sair",
      icon: "LogOut",
      className: "text-red-600 hover:bg-red-200/10",
      onSelect: logout,
    },
  ];

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="border-b border-white/10 bg-[#0f1115] text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" onClick={closeMobile}>
          <img
            src={LogoName}
            alt="Logo Casa Church"
            width={120}
            draggable={false}
            className="select-none"
          />
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          <Link to="/" className="text-white/80 hover:text-white">
            Inicio
          </Link>
          <Link to="/sobre" className="text-white/80 hover:text-white">
            Sobre Nos
          </Link>
          <Link to="/social" className="text-white/80 hover:text-white">
            Social
          </Link>
          <Link to="/cis" className="text-white/80 hover:text-white">
            CIs
          </Link>
          <Link to="/devocional" className="text-white/80 hover:text-white">
            Devocional
          </Link>
          <Link to="/sermoes" className="text-white/80 hover:text-white">
            Sermoes
          </Link>
          <Link to="/eventos" className="text-white/80 hover:text-white">
            Eventos
          </Link>
          <Link to="/doacoes" className="text-white/80 hover:text-white">
            Ofertas
          </Link>
          <Link to="/contatos" className="text-white/80 hover:text-white">
            Contatos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {isAuthenticated ? (
            <Dropdown items={menuItems} align="end">
              <Avatar
                name={userName}
                src={user?.profileImage}
                size="sm"
                className="cursor-pointer"
              />
            </Dropdown>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black transition hover:bg-gray-100"
              onClick={closeMobile}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-[#0f1115] border-t border-white/10">
          <div className="flex flex-col px-4 py-4 gap-4 text-sm">
            <Link to="/" onClick={closeMobile}>
              Inicio
            </Link>
            <Link to="/sobre" onClick={closeMobile}>
              Sobre Nos
            </Link>
            <Link to="/social" onClick={closeMobile}>
              Social
            </Link>
            <Link to="/cis" onClick={closeMobile}>
              CIs
            </Link>
            <Link to="/devocional" onClick={closeMobile}>
              Devocional
            </Link>
            <Link to="/sermoes" onClick={closeMobile}>
              Sermoes
            </Link>
            <Link to="/eventos" onClick={closeMobile}>
              Eventos
            </Link>
            <Link to="/doacoes" onClick={closeMobile}>
              Ofertas
            </Link>
            <Link to="/contatos" onClick={closeMobile}>
              Contatos
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
