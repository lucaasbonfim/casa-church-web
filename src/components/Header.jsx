import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// components
import Avatar from "./Avatar";
import Dropdown from "./Dropdown";

// assets
import LogoName from "../assets/logo-name.png";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user.name;
  const navigate = useNavigate();

  // Verifica se o usuário é admin
  let isAdmin = false;
  try {
    if (user && user.token) {
      const decoded = jwtDecode(user.token);
      isAdmin = decoded.role === "admin";
    }
  } catch (error) {
    console.error("Erro ao verificar role:", error);
  }

  function logout() {
    try {
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    } catch {
      navigate("/login");
    }
  }

  const menuItems = [
    {
      label: "Perfil",
      icon: "User",
      onSelect: () => navigate("/perfil"),
    },
    // Adiciona item Admin se for admin
    ...(isAdmin ? [
      {
        type: "separator",
      },
      {
        label: "Painel Admin",
        icon: "Shield",
        className: "text-purple-500 hover:bg-purple-500/10",
        onSelect: () => navigate("/admin/dashboard"),
      },
    ] : []),
    {
      type: "separator",
    },
    {
      label: "Sair",
      icon: "LogOut",
      className: "text-red-600 hover:bg-red-200/10",
      onSelect: logout,
    },
  ];

  return (
    <header className="min-h-16 border-b border-white/10 bg-[#0f1115] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wide">
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
            Início
          </Link>
          <Link to="/sobre" className="text-white/80 hover:text-white">
            Sobre Nós
          </Link>
          <Link to="/social" className="text-white/80 hover:text-white">
            Social
          </Link>
          <Link to="/sermoes" className="text-white/80 hover:text-white">
            Sermões
          </Link>
          <Link to="/eventos" className="text-white/80 hover:text-white">
            Eventos
          </Link>
          <Link to="/contatos" className="text-white/80 hover:text-white">
            Contatos
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Dropdown items={menuItems} align="end">
            <Avatar name={userName} size="sm" className="cursor-pointer" />
          </Dropdown>
        </div>
      </div>
    </header>
  );
}