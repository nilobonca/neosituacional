import { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router";
import { useSiteSettings, FooterSettings } from "../hooks/useSiteSettings";
import { useServices } from "../hooks/useServices";
import logo from "../../graphics/logo.svg";

export function Footer() {
  const { fetchFooterSettings } = useSiteSettings();
  const { services, fetchServices } = useServices();
  const [settings, setSettings] = useState<FooterSettings>({
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 3456-7890",
    email: "contato@condoadmin.com.br",
    facebook: "",
    instagram: "",
    linkedin: ""
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await fetchFooterSettings();
      if (data) {        setSettings(prev => ({ ...prev, ...data }));
      }
    }
    loadSettings();
  }, [fetchFooterSettings]);

  useEffect(() => {
    fetchServices(true);
  }, [fetchServices]);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="inline-block">
                <img src={logo} alt="SITUACIONAL Logo" className="h-10 w-auto brightness-0 invert" />
              </Link>
              <span className="font-bold text-xl text-white font-montserrat">
                SITUACIONAL
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings.description || "Soluções completas em administração condominial com transparência, eficiência e tecnologia."}
            </p>
            <div className="flex gap-4 mt-6">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-500 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-blue-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-sm hover:text-blue-500 transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/quem-somos" className="text-sm hover:text-blue-500 transition-colors">
                  Quem Somos
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-white font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm">
              {services.slice(0, 4).map(service => (
                <li key={service.id}>
                  <Link to="/servicos" className="hover:text-blue-500 transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
              {services.length === 0 && (
                <li className="text-gray-500 italic font-mono text-xs">...</li>
              )}
            </ul>
          </div>

          
          {settings.showContactInfo !== false && (
            <div>
              <h3 className="text-white font-semibold mb-4">Contato</h3>
              <ul className="space-y-3">
                {settings.showPhones !== false && (settings.phones && settings.phones.length > 0 ? (
                  settings.phones.map((phone, idx) => (
                    phone.trim() && (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{phone}</span>
                      </li>
                    )
                  ))
                ) : (
                  settings.phone && (
                    <li className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{settings.phone}</span>
                    </li>
                  )
                ))}
                {settings.showEmail !== false && settings.email && (
                  <li className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <a href={`mailto:${settings.email}`} className="hover:text-blue-500 transition-colors">
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.showAddress !== false && settings.address && (
                  <li className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
          <p>&copy; 2026 SITUACIONAL. Todos os direitos reservados.</p>
          <a href="http://oficinadojuan.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Feito por Juan Rego">
            <span className="text-sm">Feito por Juan Rego</span>
            <img src="/juan-logo.png" alt="Juan Rego Logo" className="h-7 w-7 rounded-full object-cover border border-gray-600" />
          </a>
        </div>
      </div>
    </footer>
  );
}
