import { useEffect } from "react";
import * as Icons from "lucide-react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useServices } from "../hooks/useServices";

export function Services() {
  const { services, loading, fetchServices } = useServices();

  useEffect(() => {
    fetchServices(true); // true = activeOnly
  }, [fetchServices]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos Serviços
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Soluções completas e personalizadas para a administração do seu condomínio
          </p>
        </div>

        {/* Services Grid */}
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
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Interessado em nossos serviços?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Entre em contato conosco e solicite um orçamento personalizado para seu condomínio
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contatos"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Solicitar Orçamento
            </a>
            <a
              href="tel:1134567890"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Ligar Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
