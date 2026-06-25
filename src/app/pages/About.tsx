import { Target, Eye, Award, Users } from "lucide-react";

export function About() {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description: "Oferecer serviços de administração condominial com excelência, transparência e inovação, garantindo a satisfação e tranquilidade dos moradores."
    },
    {
      icon: Eye,
      title: "Visão",
      description: "Ser referência nacional em administração condominial, reconhecida pela qualidade dos serviços e pela transformação digital na gestão de condomínios."
    },
    {
      icon: Award,
      title: "Valores",
      description: "Transparência, ética, profissionalismo, inovação tecnológica, compromisso com resultados e foco no cliente."
    }
  ];

  const team = [
    {
      name: "Roberto Silva",
      role: "CEO & Fundador",
      description: "Mais de 20 anos de experiência em administração condominial"
    },
    {
      name: "Ana Paula Costa",
      role: "Diretora Financeira",
      description: "Especialista em gestão financeira e contabilidade condominial"
    },
    {
      name: "Carlos Henrique",
      role: "Diretor Jurídico",
      description: "Advogado especializado em direito imobiliário e condominial"
    },
    {
      name: "Mariana Santos",
      role: "Diretora de Tecnologia",
      description: "Responsável pela inovação e transformação digital"
    }
  ];

  return (
    <div className="py-16">
      
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Quem Somos
            </h1>
            <p className="text-xl text-blue-100">
              Uma empresa dedicada à excelência em administração condominial,
              com foco em transparência, tecnologia e satisfação dos clientes.
            </p>
          </div>
        </div>
      </section>

      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Nossa História
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Fundada em 2010, a SITUACIONAL nasceu com o propósito de revolucionar
                a administração condominial no Brasil. Começamos atendendo apenas 5 condomínios
                e hoje somos responsáveis pela gestão de mais de 150 empreendimentos em todo o país.
              </p>
              <p>
                Nossa trajetória é marcada pela busca constante por inovação e excelência.
                Investimos continuamente em tecnologia para oferecer aos nossos clientes
                ferramentas modernas de gestão, garantindo transparência total e facilidade
                de comunicação entre síndicos, administradores e moradores.
              </p>
              <p>
                Com uma equipe altamente qualificada e comprometida, nossa missão é proporcionar
                tranquilidade aos síndicos e moradores, cuidando de todos os aspectos
                administrativos, financeiros, jurídicos e operacionais dos condomínios.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nossa Equipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Condomínios</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15.000+</div>
              <div className="text-blue-100">Unidades Gerenciadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Colaboradores</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">16</div>
              <div className="text-blue-100">Anos de Experiência</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
