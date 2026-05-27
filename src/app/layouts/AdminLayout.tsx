import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import logo from "../../graphics/logo.svg";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  Briefcase,
  FileSignature,
  Truck,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Verificação de Autenticação (Guardião)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Verifica se é admin
      const { data: roleData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!roleData || roleData.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login");
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Listener para mudanças de auth (ex: logout em outra aba)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard", exact: true },
    { path: "/admin/careers", icon: <Briefcase size={20} />, label: "Currículos" },
    { path: "/admin/proposals", icon: <FileSignature size={20} />, label: "Propostas" },
    { path: "/admin/suppliers", icon: <Truck size={20} />, label: "Fornecedores" },
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
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-6 w-auto bg-white rounded p-0.5" />
          <span className="font-montserrat font-bold text-lg">SITUACIONAL Admin</span>
        </Link>
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
          <Link to="/admin" className="flex items-center gap-2" title="Ir para o Dashboard">
            <img src={logo} alt="SITUACIONAL Logo" className="h-8 w-auto bg-white rounded p-1" />
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

        <div className="p-4 border-t border-slate-800 mt-auto flex flex-col gap-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Globe size={20} />
            <span className="font-medium">Acessar o Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Painel</span>
          </button>
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
