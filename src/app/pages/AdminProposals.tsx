import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FileText, Calendar, Building2, Phone, Mail, FileSignature, ExternalLink } from "lucide-react";

interface CommercialProposal {
  id: string;
  document: string;
  condominium_name: string;
  representative_name: string;
  email: string;
  phone: string;
  blocks: number;
  apartments: number;
  houses: number;
  employees: number;
  files_urls: string[] | string;
  status: string;
  created_at: string;
}

export function AdminProposals() {
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("commercial_proposals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar propostas:", error);
        alert("Não foi possível carregar as propostas.");
      } else {
        setProposals(data || []);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const parseUrls = (urlsData: string[] | string): string[] => {
    if (!urlsData) return [];
    if (Array.isArray(urlsData)) return urlsData;
    try {
      return JSON.parse(urlsData);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-gray-900">Propostas Comerciais</h1>
          <p className="text-gray-500">Solicitações de cotação enviadas por condomínios</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Condomínio</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estrutura</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Balancetes</th>
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
                      Carregando solicitações...
                    </div>
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileSignature className="w-10 h-10 text-gray-300" />
                      <p>Nenhuma solicitação de proposta recebida ainda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                proposals.map((prop) => {
                  const urls = parseUrls(prop.files_urls);
                  return (
                    <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {prop.condominium_name}
                        </div>
                        <div className="text-sm text-gray-500 pl-6">
                          Doc: {prop.document}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900 mb-1">{prop.representative_name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {prop.email}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {prop.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 border border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1">
                          <div><span className="text-gray-500">Blocos:</span> <strong>{prop.blocks}</strong></div>
                          <div><span className="text-gray-500">Aptos:</span> <strong>{prop.apartments}</strong></div>
                          <div><span className="text-gray-500">Casas:</span> <strong>{prop.houses}</strong></div>
                          <div><span className="text-gray-500">Func:</span> <strong>{prop.employees}</strong></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(prop.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right align-top">
                        <div className="flex flex-col items-end gap-2">
                          {urls.length > 0 ? (
                            urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                title={`Ver balancete ${idx + 1}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Balancete {idx + 1}
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sem anexos</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
