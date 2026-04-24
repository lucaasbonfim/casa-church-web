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
  Activity,
  MapPin,
  Mail,
  DollarSign,
  FileText,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import LogoName from "../assets/logo-name.png";
import {
  getStoredUser,
  clearStoredUser,
} from "../utils/authStorage";
import { hasAdminModuleAccess } from "../utils/adminPermissions";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = getStoredUser();

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      module: "dashboard",
    },
    {
      path: "/admin/inicio",
      icon: House,
      label: "Pagina inicial",
      module: "home_content",
    },
    {
      path: "/admin/paginas",
      icon: FileText,
      label: "Paginas",
      module: "page_content",
    },
    { path: "/admin/eventos", icon: Calendar, label: "Eventos", module: "events" },
    {
      path: "/admin/devocionais",
      icon: BookOpenText,
      label: "Devocionais",
      module: "devotionals",
    },
    { path: "/admin/sermoes", icon: Book, label: "Sermoes", module: "sermons" },
    {
      path: "/admin/licoes",
      icon: GraduationCap,
      label: "Licoes",
      module: "lessons",
    },
    { path: "/admin/posts", icon: MessageSquare, label: "Posts", module: "posts" },
    { path: "/admin/usuarios", icon: Users, label: "Usuarios", module: "users" },
    {
      path: "/admin/atividades",
      icon: Activity,
      label: "Atividades",
      module: "activities",
    },
    {
      path: "/admin/cis",
      icon: MapPin,
      label: "CIs",
      module: "church_houses",
    },
    {
      path: "/admin/contatos",
      icon: Mail,
      label: "Mensagens",
      module: "contacts",
    },
    {
      path: "/admin/doacoes",
      icon: DollarSign,
      label: "Doacoes",
      module: "donations",
    },
  ].filter((item) => hasAdminModuleAccess(currentUser, item.module));

  function logout() {
    clearStoredUser();
    delete axios.defaults.headers.common.Authorization;
    navigate("/login");
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-[#13161c] transition-transform duration-300 lg:sticky ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/" onClick={closeSidebar}>
            <img
              src={LogoName}
              alt="Logo Casa Church"
              width={100}
              className="select-none transition-opacity hover:opacity-80"
            />
          </Link>
          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          />
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
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

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="flex h-16 items-center border-b border-white/10 bg-[#0f1115] px-4 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}
    </div>
  );
}
