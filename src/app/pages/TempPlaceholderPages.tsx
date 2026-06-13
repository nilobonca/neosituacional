import { Link } from "react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function TempPlaceholderPage({ title, description, icon }: PlaceholderProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
            {icon}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-4 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            Página Temporária / Protótipo
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-8 max-w-sm">{description}</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Esta página serve como um placeholder temporário de navegação para a rota correspondente e será substituída pelo desenvolvimento final.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border.2 border-gray-200 text-sm font-semibold text-gray-700  bg-white hover:bg-blue-500 hover:text-white rounded-lg transition-colors border"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
