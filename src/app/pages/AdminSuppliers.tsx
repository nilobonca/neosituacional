import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Briefcase, Calendar, Phone, Mail, Building2, DollarSign, CheckCircle2, XCircle, Info, ExternalLink, UserPlus } from "lucide-react";

interface Supplier {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  website?: string;
  work_offered: string;
  common_services: string;
  average_value: string;
  compete_budgets: boolean;
  logo_url: string;
  status: string;
  created_at: string;
}

export function AdminSuppliers() {
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

  const toggleAcceptStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'accepted' ? 'new' : 'accepted';
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    try {
      const { error } = await supabase
        .from("suppliers_applications")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) {
        setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: currentStatus } : s));
        console.error("Erro ao atualizar status:", error);
        alert("Não foi possível atualizar o status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToPartners = async (supplier: Supplier) => {
    if (!supplier.logo_url) {
      alert("Este fornecedor não possui uma logo cadastrada. A logo é obrigatória para a área de Parceiros.");
      return;
    }
    
    if (!window.confirm(`Deseja adicionar a empresa "${supplier.company_name}" à área de Clientes & Parceiros?`)) return;
    
    try {
      const { error } = await supabase.from("clients").insert([{
        name: supplier.company_name,
        logo_url: supplier.logo_url,
        website_url: supplier.website || "",
        active: true
      }]);
      
      if (error) throw error;
      alert("Empresa adicionada com sucesso aos Clientes & Parceiros!");
    } catch (err: any) {
      console.error("Erro ao adicionar parceiro:", err);
      alert("Erro ao adicionar parceiro: " + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-gray-900">Fornecedores</h1>
          <p className="text-gray-500">Empresas e prestadores de serviço cadastrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Empresa</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-1/3">Serviços e Valores</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Disputa de Orçamentos</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data e Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Carregando fornecedores...
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-10 h-10 text-gray-300" />
                      <p>Nenhum fornecedor cadastrado ainda.</p>
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
                          title="Clique para ampliar a logo"
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
                          {supplier.status === 'accepted' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Aceito na Lista
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Novo Lead / Pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-700 flex items-center gap-1.5 mb-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {supplier.phone}
                      </div>
                      <div className="text-sm text-gray-700 flex items-center gap-1.5 mb-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {supplier.email}
                      </div>
                      {supplier.website && (
                        <div className="text-sm text-gray-700 flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate max-w-[200px] inline-block" title={supplier.website}>
                            Site da Empresa
                          </a>
                        </div>
                      )}
                    </td>

                    
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Trabalho Oferecido</p>
                          <p className="text-sm text-gray-900">{supplier.work_offered}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Serviços Mais Comuns</p>
                          <p className="text-sm text-gray-600 line-clamp-2" title={supplier.common_services}>
                            {supplier.common_services}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100 flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-green-800">Valor Médio</p>
                            <p className="text-sm font-medium text-green-700">{supplier.average_value}</p>
                          </div>
                        </div>
                      </div>
                    </td>

                    
                    <td className="px-6 py-4 align-top text-center">
                      <div className="flex justify-center items-center h-full">
                        {supplier.compete_budgets ? (
                          <div className="flex flex-col items-center gap-1 text-green-600" title="Aceitou disputar orçamentos">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-xs font-semibold">Aceitou</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400" title="Não tem interesse em disputar">
                            <XCircle className="w-6 h-6" />
                            <span className="text-xs">Não aceitou</span>
                          </div>
                        )}
                      </div>
                    </td>

                    
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(supplier.created_at)}
                        </div>
                        
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              id={`accept-${supplier.id}`}
                              checked={supplier.status === 'accepted'}
                              onChange={() => toggleAcceptStatus(supplier.id, supplier.status)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label 
                              htmlFor={`accept-${supplier.id}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                            >
                              Aceito na Lista
                            </label>
                          </div>
                          
                          <button
                            onClick={() => addToPartners(supplier)}
                            className="flex items-center justify-center gap-1.5 w-full bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm"
                            title="Adicionar à aba de Clientes e Parceiros do site"
                          >
                            <UserPlus className="w-4 h-4" />
                            Tornar Parceiro
                          </button>
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
