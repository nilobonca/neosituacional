import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { 
  LayoutDashboard, 
  LogOut,
  Menu,
  X,
  Building2,
  Truck
} from "lucide-react";
import { useState, useEffect } from "react";

export function CondoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/area-cliente/login");
        return;
      }
      const { data: roleData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!roleData || roleData.role !== "sindico") {
        await supabase.auth.signOut();
        navigate("/area-cliente/login");
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/area-cliente/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate("/area-cliente/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Autenticando acesso do condomínio...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: "/area-cliente", icon: <LayoutDashboard size={20} />, label: "Dashboard", exact: true },
    { path: "/area-cliente/fornecedores", icon: <Truck size={20} />, label: "Rede de Prestadores" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-montserrat font-bold text-lg flex items-center gap-2">
          <Building2 size={20} className="text-blue-400" />
          Área do Síndico
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside 
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-white flex-shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto transition-all z-40`}
      >
        <div className="p-6 hidden md:block border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center font-bold border border-blue-500/30">
              <Building2 size={22} />
            </div>
            <div>
              <span className="font-montserrat font-bold text-base block leading-tight">
                Área do
              </span>
              <span className="text-blue-400 text-sm font-semibold tracking-wide">
                SÍNDICO
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-grow">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 mt-4">
            Menu
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-500 hover:text-white hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Painel</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-10">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
