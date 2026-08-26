import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useServices } from "../hooks/useServices";
import { useSiteSettings, ServicesPageSettings, defaultServicesSettings } from "../hooks/useSiteSettings";

export function Services() {
  const { services, loading, fetchServices } = useServices();
  const { fetchServicesSettings, fetchFooterSettings } = useSiteSettings();
  const [pageSettings, setPageSettings] = useState<ServicesPageSettings>(defaultServicesSettings);
  const [phone, setPhone] = useState<string>("1134567890");

  useEffect(() => {
    fetchServices(true);
    
    const loadSettings = async () => {
      const [servicesData, footerData] = await Promise.all([
        fetchServicesSettings(),
        fetchFooterSettings()
      ]);
      if (servicesData) {
        setPageSettings(servicesData);
      }
      if (footerData?.phones && footerData.phones.length > 0) {
        setPhone(footerData.phones[0].replace(/\D/g, ''));
      } else if (footerData?.phone) {
        setPhone(footerData.phone.replace(/\D/g, ''));
      }
    };
    loadSettings();
  }, [fetchServices, fetchServicesSettings, fetchFooterSettings]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-montserrat">
            {pageSettings.headerTitle || "Nossos Serviços"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {pageSettings.headerSubtitle || defaultServicesSettings.headerSubtitle}
          </p>
        </div>

        {/* Grid de Serviços Dinâmicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && services.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-500">Carregando serviços disponíveis...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 italic">
              Nenhum serviço cadastrado no momento.
            </div>
          ) : (
            services.map((service) => {
              const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col"
                >
                  <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-montserrat">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mt-auto border-t pt-4">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        {/* Banner CTA Final */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4 font-montserrat">
            {pageSettings.ctaTitle || "Interessado em nossos serviços?"}
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {pageSettings.ctaSubtitle || defaultServicesSettings.ctaSubtitle}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/proposta"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-500 hover:text-white transition-colors shadow-md"
            >
              {pageSettings.ctaButtonProposalText || "Solicitar Orçamento"}
            </a>
            <a
              href={`tel:${phone}`}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors shadow-md"
            >
              {pageSettings.ctaButtonCallText || "Ligar Agora"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
