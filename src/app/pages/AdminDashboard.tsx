import { LayoutDashboard, Users, FileText, ImageIcon, MessageSquare, Settings, Briefcase } from "lucide-react";
import { Link } from "react-router";

export function AdminDashboard() {
  const stats = [
    { title: "Posts no Blog", value: "Gerenciar", icon: <FileText className="text-blue-500" />, link: "/admin/blog" },
    { title: "Carrossel Home", value: "Gerenciar", icon: <ImageIcon className="text-purple-500" />, link: "/admin/carousel" },
    { title: "Clientes & Parceiros", value: "Gerenciar", icon: <Users className="text-green-500" />, link: "/admin/clients" },
    { title: "Depoimentos", value: "Gerenciar", icon: <MessageSquare className="text-orange-500" />, link: "/admin/testimonials" },
    { title: "Serviços", value: "Gerenciar", icon: <Briefcase className="text-indigo-500" />, link: "/admin/services" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Painel de Controle</h1>
        <p className="text-slate-500">
          Bem-vindo à área de administração do Site Situacional. O que você gostaria de gerenciar hoje?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            to={stat.link}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">{stat.title}</h3>
            <span className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {stat.value}
              <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm ml-auto">
                Abrir &rarr;
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Configurações Rápidas</h2>
        </div>
        <p className="text-slate-500 text-sm mb-4 max-w-2xl">
          Nesta área você pode ajustar as informações globais do site, como os telefones de contato, endereço e e-mail que aparecem no rodapé de todas as páginas.
        </p>
        <Link 
          to="/admin/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
        >
          Editar Rodapé (Footer)
        </Link>
      </div>
    </div>
  );
}
