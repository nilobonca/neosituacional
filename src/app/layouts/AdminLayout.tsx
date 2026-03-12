import { Link, Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings,
  Image as ImageIcon,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard", exact: true },
    { path: "/admin/blog", icon: <FileText size={20} />, label: "Blog" },
    { path: "/admin/carousel", icon: <ImageIcon size={20} />, label: "Carrossel" },
    { path: "/admin/clients", icon: <Users size={20} />, label: "Clientes & Parceiros" },
    { path: "/admin/testimonials", icon: <MessageSquare size={20} />, label: "Depoimentos" },
    { path: "/admin/settings", icon: <Settings size={20} />, label: "Configurações" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header (replaces sidebar on small screens) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-montserrat font-bold text-lg">SITUACIONAL Admin</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-white flex-shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto transition-all z-40`}
      >
        <div className="p-6 hidden md:block border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2" title="Voltar ao site público">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">
              S
            </div>
            <span className="font-montserrat font-bold text-lg tracking-wider">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-2 flex-grow">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 mt-4">
            Menu Principal
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Painel</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-10">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
