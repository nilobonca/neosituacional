import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function Root() {
  const location = useLocation();  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow overflow-x-hidden relative">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>
      <Footer />
      
      <a 
        href="http://oficinadojuan.com.br/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center"
      >
        <div className="absolute right-full mr-3 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-700">Produzido e Desenvolvido por Juan Rego</span>
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-100 rotate-45"></div>
        </div>
        <div className="bg-white p-1 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform duration-300">
          <img src="/juan-logo.png" alt="Juan Rego Logo" className="h-10 w-10 rounded-full object-cover" />
        </div>
      </a>
    </div>
  );
}

