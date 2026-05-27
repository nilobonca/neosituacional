import { 
  FileText, 
  ImageIcon, 
  Users, 
  MessageSquare, 
  Briefcase, 
  Settings, 
  FileSignature, 
  Truck,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";

export function AdminDashboard() {
  const sections = [
    {
      title: "Comercial & Atendimento",
      description: "Gerencie as solicitações recebidas pelo site",
      items: [
        { title: "Propostas de Condomínios", description: "Orçamentos solicitados via formulário", icon: <FileSignature className="text-blue-500" size={24} />, link: "/admin/proposals", bgColor: "bg-blue-50" },
        { title: "Currículos Recebidos", description: "Candidatos para vagas e banco de talentos", icon: <Briefcase className="text-indigo-500" size={24} />, link: "/admin/careers", bgColor: "bg-indigo-50" },
        { title: "Rede de Fornecedores", description: "Prestadores de serviço e parcerias", icon: <Truck className="text-emerald-500" size={24} />, link: "/admin/suppliers", bgColor: "bg-emerald-50" },
      ]
    },
    {
      title: "Conteúdo do Site",
      description: "Atualize os textos, imagens e seções da página principal",
      items: [
        { title: "Artigos do Blog", description: "Conteúdo técnico e notícias", icon: <FileText className="text-orange-500" size={24} />, link: "/admin/blog", bgColor: "bg-orange-50" },
        { title: "Carrossel Home", description: "Banners de destaque da página inicial", icon: <ImageIcon className="text-purple-500" size={24} />, link: "/admin/carousel", bgColor: "bg-purple-50" },
        { title: "Clientes & Parceiros", description: "Logos exibidas na vitrine de clientes", icon: <Users className="text-pink-500" size={24} />, link: "/admin/clients", bgColor: "bg-pink-50" },
        { title: "Depoimentos", description: "Feedbacks em destaque", icon: <MessageSquare className="text-yellow-500" size={24} />, link: "/admin/testimonials", bgColor: "bg-yellow-50" },
        { title: "Nossos Serviços", description: "Página de serviços oferecidos", icon: <Briefcase className="text-teal-500" size={24} />, link: "/admin/services", bgColor: "bg-teal-50" },
      ]
    },
    {
      title: "Sistema",
      description: "Ajustes globais e informações gerais do sistema",
      items: [
        { title: "Configurações Gerais", description: "Rodapé, contatos e informações básicas", icon: <Settings className="text-slate-500" size={24} />, link: "/admin/settings", bgColor: "bg-slate-100" },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Geral</h1>
        <p className="text-slate-500 text-lg">
          Bem-vindo ao painel de administração da Situacional. Selecione uma das opções abaixo para gerenciar.
        </p>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
            <p className="text-slate-500 text-sm">{section.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, i) => (
              <Link 
                key={i} 
                to={item.link}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-start gap-4 group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${item.bgColor}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-snug">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">
                    Acessar <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
