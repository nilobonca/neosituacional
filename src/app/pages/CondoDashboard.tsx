import { useState, useEffect } from "react";
import { Truck, FileText, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";

export function CondoDashboard() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (err) {
      console.error("Erro ao buscar feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-gray-900">Visão Geral</h1>
          <p className="text-gray-500">Bem-vindo ao painel do seu condomínio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-montserrat">Rede de Prestadores</h3>
              <p className="text-sm text-gray-500">Fornecedores homologados</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Acesse nossa lista oficial de prestadores de serviços validados e aprovados pela administração central.
          </p>
          <Link 
            to="/area-cliente/fornecedores"
            className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            Acessar lista completa →
          </Link>
        </div>

        
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 border-dashed">
          <div className="flex items-center gap-4 mb-4 opacity-50">
            <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-montserrat">Documentos</h3>
              <p className="text-sm text-gray-500">Atas e comunicados</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium italic">
            Em breve você poderá acessar os documentos do seu condomínio por aqui.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold font-montserrat text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" /> 
          Feedbacks do Condomínio
        </h2>

        {loadingFeedbacks ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
            Nenhum feedback recebido ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {f.avatar_url ? (
                    <img src={f.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{f.name}</p>
                    <p className="text-sm text-gray-500">{new Date(f.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic flex-1">"{f.content}"</p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-gray-500">
                  <span className="text-yellow-500 font-medium">Avaliação 5/5 ⭐</span>
                  {f.show_on_home ? (
                    <span className="text-green-600 font-medium">Público no Site</span>
                  ) : (
                    <span className="text-orange-500 font-medium">Em Análise pelo Admin</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
