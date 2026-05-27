import { Building2, Truck, FileText } from "lucide-react";
import { Link } from "react-router";

export function CondoDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-gray-900">Visão Geral</h1>
          <p className="text-gray-500">Bem-vindo ao painel do seu condomínio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Fornecedores */}
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

        {/* Card 2: Em Breve */}
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
    </div>
  );
}
