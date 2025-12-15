import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Book, 
  GraduationCap,
  MessageSquare,
  Users,
  MapPin,
  Mail,
  DollarSign,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import LogoName from "../assets/logo-name.png";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/eventos", icon: Calendar, label: "Eventos" },
    { path: "/admin/sermoes", icon: Book, label: "Sermões" },
    { path: "/admin/licoes", icon: GraduationCap, label: "Lições" },
    { path: "/admin/posts", icon: MessageSquare, label: "Posts" },
    { path: "/admin/usuarios", icon: Users, label: "Usuários" },
    { path: "/admin/locais", icon: MapPin, label: "Locais" },
    { path: "/admin/contatos", icon: Mail, label: "Mensagens" },
    { path: "/admin/doacoes", icon: DollarSign, label: "Doações" },
  ];

  function logout() {
    try {
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    } catch {
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white/5 border-r border-white/10 transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-0 lg:w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {isSidebarOpen && (
            <Link to="/" className="flex items-center">
              <img 
                src={LogoName} 
                alt="Logo Casa Church" 
                width={100} 
                className="select-none hover:opacity-80 transition-opacity" 
              />
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon size={20} className="shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Mobile */}
        <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#0f1115]">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <Link to="/">
            <img 
              src={LogoName} 
              alt="Logo Casa Church" 
              width={100} 
              className="select-none hover:opacity-80 transition-opacity" 
            />
          </Link>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}