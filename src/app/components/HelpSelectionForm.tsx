import { useNavigate } from "react-router";
import { 
  Calculator, 
  Briefcase, 
  Building, 
  Wrench,
  ChevronRight
} from "lucide-react";

interface Option {
  id: string;
  label: string;
  route: string;
  icon: React.ReactNode;
}

interface HelpSelectionFormProps {
  compact?: boolean;
}

export function HelpSelectionForm({ compact = false }: HelpSelectionFormProps) {
  const navigate = useNavigate();

  const options: Option[] = [
    {
      id: "proposta",
      label: "Quero uma proposta para meu condomínio",
      route: "/proposta",
      icon: <Calculator className="h-5 w-5" />
    },
    {
      id: "carreiras",
      label: "Quero trabalhar na Situacional",
      route: "/carreiras",
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: "cliente",
      label: "Já sou cliente da Situacional",
      route: "https://situacional.superlogica.net/clients/areadocondomino",
      icon: <Building className="h-5 w-5" />
    },
    {
      id: "fornecedor",
      label: "Sou prestador de serviços / fornecedor",
      route: "/fornecedores",
      icon: <Wrench className="h-5 w-5" />
    }
  ];

  const handleNavigate = (route: string) => {
    if (route.startsWith("http")) {
      window.open(route, "_blank", "noopener,noreferrer");
    } else {
      navigate(route);
    }
  };

  return (
    <div className={`w-full ${compact ? "max-w-md mx-auto p-4" : "max-w-xl mx-auto px-4 py-8"}`}>
      <div className={`text-center ${compact ? "mb-5" : "mb-8"}`}>
        <h2 className={`font-montserrat font-normal text-gray-900 tracking-tight
          ${compact ? "text-xl text-left border-b pb-3 border-gray-100 flex items-center gap-2" : "text-3xl"}
        `}>
          {compact && <span className="inline-block w-2.5 h-6 bg-[#235487] rounded-sm"></span>}
          O que você procura?
        </h2>
        {!compact && (
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            Escolha uma das opções abaixo para ser direcionado instantaneamente ao canal correto.
          </p>
        )}
      </div>

      <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleNavigate(option.route)}
            className={`w-full flex items-center justify-between ${compact ? "px-3 py-2.5" : "p-4"} bg-white border border-gray-200 hover:border-[#235487]/50 rounded-xl transition-all duration-200 outline-none text-left group shadow-sm hover:shadow-md
              focus-visible:ring-2 focus-visible:ring-[#235487] focus-visible:border-[#235487]
            `}
          >
            <div className="flex items-center gap-3.5">
              <div className={`${compact ? "p-1.5" : "p-2"} bg-gray-50 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-[#235487] transition-colors duration-200`}>
                {option.icon}
              </div>
              <span className={`font-semibold ${compact ? "text-[13px]" : "text-sm"} text-gray-700 group-hover:text-gray-900 transition-colors duration-200`}>
                {option.label}
              </span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#235487] group-hover:translate-x-1 transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
}
