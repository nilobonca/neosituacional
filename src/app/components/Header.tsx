import { Link, useLocation } from "react-router";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/blog", label: "Blog" },
    { path: "/servicos", label: "Serviços" },
    { path: "/quem-somos", label: "Quem Somos" },
    { path: "/contatos", label: "Contatos" },
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
            <img src="/src/graphics/logo.svg" alt="SITUACIONAL Logo" className="h-10 w-auto" />
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
                className={`text-sm transition-colors ${isActive(link.path)
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/area-cliente"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Área do Cliente
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
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
                  className={`text-sm transition-colors ${isActive(link.path)
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/area-cliente"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors text-center"
              >
                Área do Cliente
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
