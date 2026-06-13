import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../../graphics/logo.svg";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/blog", label: "Blog" },
    { path: "/servicos", label: "Serviços" },
    { path: "/quem-somos", label: "Quem Somos" },
    { path: "/feedback", label: "Feedbacks" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SITUACIONAL Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl text-situational-blue font-montserrat">
              SITUACIONAL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm px-3 py-2 rounded-md transition-colors ${isActive(link.path)
                  ? "text-blue-600 font-medium bg-blue-50"
                  : "text-gray-600 hover:bg-blue-500 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            


            <Link
              to="/area-cliente/login"
              className="bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-blue-500 hover:text-white font-medium transition-colors"
            >
              Login Síndico
            </Link>
            <a
              href="https://situacional.superlogica.net/clients/areadocondomino"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-blue-600 font-medium transition-colors"
            >
              Área do Cliente
            </a>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">

            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm px-4 py-3 rounded-lg transition-colors ${isActive(link.path)
                    ? "text-blue-600 font-medium bg-blue-50"
                    : "text-gray-600 hover:bg-blue-500 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/area-cliente/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-blue-500 hover:text-white font-medium transition-colors text-center"
              >
                Login Síndico
              </Link>
              <a
                href="https://situacional.superlogica.net/clients/areadocondomino"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-blue-600 font-medium transition-colors text-center"
              >
                Área do Cliente
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
