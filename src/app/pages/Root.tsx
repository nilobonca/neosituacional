import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function Root() {
  const location = useLocation();

  // Garante que o scroll vá para o topo instantaneamente ao mudar de página
  useEffect(() => {
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
    </div>
  );
}

