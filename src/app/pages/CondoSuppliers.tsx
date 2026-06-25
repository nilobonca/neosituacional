import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Briefcase, Calendar, Phone, Mail, Building2, DollarSign, ExternalLink } from "lucide-react";

interface Supplier {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  work_offered: string;
  common_services: string;
  average_value: string;
  logo_url: string;
  created_at: string;
}

export function CondoSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suppliers_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar fornecedores:", error);
        alert("Não foi possível carregar a lista de fornecedores.");
      } else {
        setSuppliers(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-gray-900">Rede de Prestadores</h1>
          <p className="text-gray-500">Fornecedores homologados e recomendados pela administração</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Empresa</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-1/3">Serviços e Valores Médios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Carregando prestadores...
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-10 h-10 text-gray-300" />
                      <p>Nenhum prestador homologado disponível no momento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-4">
                        <a 
                          href={supplier.logo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center group relative cursor-pointer"
                          title="Ver logo"
                        >
                          <img 
                            src={supplier.logo_url} 
                            alt={`Logo ${supplier.company_name}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </a>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            {supplier.company_name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            Homologado desde {formatDate(supplier.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-700 flex items-center gap-1.5 mb-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {supplier.phone}
                      </div>
                      <div className="text-sm text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {supplier.email}
                      </div>
                    </td>

                    
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Especialidade</p>
                          <p className="text-sm text-gray-900">{supplier.work_offered}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Principais Serviços</p>
                          <p className="text-sm text-gray-600 leading-relaxed" title={supplier.common_services}>
                            {supplier.common_services}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 flex items-start gap-2 mt-2">
                          <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600">Referência de Valores</p>
                            <p className="text-sm font-medium text-gray-800">{supplier.average_value}</p>
                          </div>
                        </div>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
