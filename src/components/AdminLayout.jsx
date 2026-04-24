import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  House,
  Calendar,
  Book,
  BookOpenText,
  GraduationCap,
  MessageSquare,
  Users,
  MapPin,
  Mail,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import LogoName from "../assets/logo-name.png";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile-first: fechado por padrão
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/inicio", icon: House, label: "Pagina inicial" },
    { path: "/admin/paginas", icon: FileText, label: "Paginas" },
    { path: "/admin/eventos", icon: Calendar, label: "Eventos" },
    { path: "/admin/devocionais", icon: BookOpenText, label: "Devocionais" },
    { path: "/admin/sermoes", icon: Book, label: "Sermões" },
    { path: "/admin/licoes", icon: GraduationCap, label: "Lições" },
    { path: "/admin/posts", icon: MessageSquare, label: "Posts" },
    { path: "/admin/usuarios", icon: Users, label: "Usuários" },
    { path: "/admin/cis", icon: MapPin, label: "CIs" },
    { path: "/admin/contatos", icon: Mail, label: "Mensagens" },
    { path: "/admin/doacoes", icon: DollarSign, label: "Doações" },
  ];

  function logout() {
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64
        bg-[#13161c] border-r border-white/10
        z-50 transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/" onClick={closeSidebar}>
            <img
              src={LogoName}
              alt="Logo Casa Church"
              width={100}
              className="select-none hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Fechar no mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          ></button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-white text-black"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
            text-white/70 hover:bg-red-500/20 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-auto">
        {/* Header Mobile */}
        <div className="lg:hidden h-16 flex items-center px-4 border-b border-white/10 bg-[#0f1115]">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
