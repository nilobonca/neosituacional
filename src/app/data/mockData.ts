// Mock data para o site de administração condominial

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Feedback {
  id: number;
  name: string;
  condominium: string;
  text: string;
  rating: number;
  date: string;
}

export interface Client {
  id: number;
  name: string;
  logo: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Como Reduzir Custos na Administração Condominial",
    excerpt: "Descubra estratégias eficientes para otimizar os gastos do seu condomínio sem comprometer a qualidade dos serviços.",
    content: "A gestão eficiente de custos é fundamental para manter a saúde financeira do condomínio. Neste artigo, exploramos técnicas comprovadas de redução de despesas.",
    image: "https://images.unsplash.com/photo-1605371165845-3db7814a74ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGNvbmRvbWluaXVtfGVufDF8fHx8MTc3MjYyNTc0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-28",
    author: "Maria Silva",
    category: "Gestão Financeira"
  },
  {
    id: 2,
    title: "Legislação Condominial: Direitos e Deveres dos Condôminos",
    excerpt: "Entenda o que diz a lei sobre as responsabilidades e direitos de cada morador dentro do condomínio.",
    content: "Conhecer a legislação é essencial para uma convivência harmoniosa. Veja os principais pontos do Código Civil.",
    image: "https://images.unsplash.com/photo-1758310999515-645097b709db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wZXJ0eSUyMG1hbmFnZW1lbnQlMjBwcm9mZXNzaW9uYWwlMjBvZmZpY2V8ZW58MXx8fHwxNzcyNjI2NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-25",
    author: "João Santos",
    category: "Legislação"
  },
  {
    id: 3,
    title: "Manutenção Preventiva: Evite Problemas Maiores",
    excerpt: "A manutenção preventiva é a chave para evitar gastos emergenciais e manter a infraestrutura do condomínio em ordem.",
    content: "Um plano de manutenção preventiva bem estruturado pode economizar até 40% em reparos emergenciais.",
    image: "https://images.unsplash.com/photo-1762427354566-2b6902a9fd06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBtYW5hZ2VtZW50JTIwY2FsY3VsYXRvciUyMGRlc2t8ZW58MXx8fHwxNzcyNjU2OTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-20",
    author: "Carlos Pereira",
    category: "Manutenção"
  },
  {
    id: 4,
    title: "Gestão de Assembleias Condominiais: Boas Práticas",
    excerpt: "Aprenda como organizar assembleias eficientes, democráticas e produtivas para seu condomínio.",
    content: "Assembleias bem organizadas são fundamentais para a tomada de decisões importantes no condomínio.",
    image: "https://images.unsplash.com/photo-1758519288905-38b7b00c1023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBhcnRuZXJzJTIwaGFuZHNoYWtlJTIwY29ycG9yYXRlfGVufDF8fHx8MTc3MjY1Njk4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-15",
    author: "Ana Costa",
    category: "Gestão"
  },
  {
    id: 5,
    title: "Tecnologia na Administração Condominial",
    excerpt: "Como ferramentas digitais podem transformar a gestão do seu condomínio e facilitar a comunicação.",
    content: "A digitalização da gestão condominial traz eficiência, transparência e praticidade para síndicos e moradores.",
    image: "https://images.unsplash.com/photo-1605371165845-3db7814a74ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGNvbmRvbWluaXVtfGVufDF8fHx8MTc3MjYyNTc0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-10",
    author: "Ricardo Alves",
    category: "Tecnologia"
  },
  {
    id: 6,
    title: "Segurança Condominial: Medidas Essenciais",
    excerpt: "Conheça as principais medidas de segurança que todo condomínio deve implementar.",
    content: "A segurança dos moradores deve ser prioridade. Veja quais medidas são indispensáveis.",
    image: "https://images.unsplash.com/photo-1758310999515-645097b709db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wZXJ0eSUyMG1hbmFnZW1lbnQlMjBwcm9mZXNzaW9uYWwlMjBvZmZpY2V8ZW58MXx8fHwxNzcyNjI2NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2026-02-05",
    author: "Fernanda Lima",
    category: "Segurança"
  }
];

export const services: Service[] = [
  {
    id: 1,
    title: "Gestão Financeira",
    description: "Administração completa das finanças do condomínio com transparência e eficiência.",
    icon: "Wallet",
    features: [
      "Controle de receitas e despesas",
      "Emissão de boletos",
      "Relatórios financeiros mensais",
      "Planejamento orçamentário"
    ]
  },
  {
    id: 2,
    title: "Assessoria Jurídica",
    description: "Suporte legal especializado para todas as questões condominiais.",
    icon: "Scale",
    features: [
      "Consultoria jurídica permanente",
      "Elaboração de contratos",
      "Representação em assembleias",
      "Cobrança judicial"
    ]
  },
  {
    id: 3,
    title: "Manutenção e Obras",
    description: "Gestão de manutenções preventivas e corretivas com equipe especializada.",
    icon: "Wrench",
    features: [
      "Manutenção preventiva programada",
      "Gestão de obras e reformas",
      "Controle de prestadores de serviço",
      "Inspeções técnicas regulares"
    ]
  },
  {
    id: 4,
    title: "Comunicação e Portal",
    description: "Plataforma digital para facilitar a comunicação entre administração e moradores.",
    icon: "MessageSquare",
    features: [
      "Portal do condômino",
      "Aplicativo mobile",
      "Avisos e comunicados digitais",
      "Reserva de áreas comuns online"
    ]
  },
  {
    id: 5,
    title: "Gestão de Pessoas",
    description: "Administração completa de funcionários e prestadores de serviço.",
    icon: "Users",
    features: [
      "Gestão de folha de pagamento",
      "Controle de ponto eletrônico",
      "Recrutamento e seleção",
      "Treinamentos periódicos"
    ]
  },
  {
    id: 6,
    title: "Segurança e Controle",
    description: "Sistemas e protocolos de segurança para proteção do condomínio.",
    icon: "Shield",
    features: [
      "Gestão de controle de acesso",
      "Monitoramento de CFTV",
      "Protocolos de emergência",
      "Vistorias de segurança"
    ]
  }
];

export const feedbacks: Feedback[] = [
  {
    id: 1,
    name: "Roberto Martins",
    condominium: "Residencial Porto Seguro",
    text: "Excelente serviço! A gestão financeira ficou muito mais transparente e organizada. Recomendo fortemente.",
    rating: 5,
    date: "2026-03-01"
  },
  {
    id: 2,
    name: "Juliana Oliveira",
    condominium: "Condomínio Vista Verde",
    text: "Equipe muito profissional e atenciosa. Resolveram todos os problemas administrativos que tínhamos há anos.",
    rating: 5,
    date: "2026-02-28"
  },
  {
    id: 3,
    name: "Paulo Henrique",
    condominium: "Edifício Cidade Jardim",
    text: "O portal do condômino facilitou muito nossa vida. Agora consigo acompanhar tudo pelo celular.",
    rating: 5,
    date: "2026-02-25"
  },
  {
    id: 4,
    name: "Mariana Costa",
    condominium: "Residencial Harmonia",
    text: "Profissionais competentes e sempre disponíveis. A comunicação melhorou muito desde que contratamos.",
    rating: 4,
    date: "2026-02-20"
  },
  {
    id: 5,
    name: "Eduardo Santos",
    condominium: "Condomínio Bela Vista",
    text: "Ótimo custo-benefício. A gestão de manutenção preventiva já nos economizou muito dinheiro.",
    rating: 5,
    date: "2026-02-15"
  },
  {
    id: 6,
    name: "Carla Fernandes",
    condominium: "Residencial Parque das Flores",
    text: "Serviço de qualidade com transparência total. As assembleias ficaram muito mais organizadas.",
    rating: 5,
    date: "2026-02-10"
  }
];

export const clients: Client[] = [
  { id: 1, name: "Residencial Porto Seguro", logo: "🏢" },
  { id: 2, name: "Condomínio Vista Verde", logo: "🌳" },
  { id: 3, name: "Edifício Cidade Jardim", logo: "🏛️" },
  { id: 4, name: "Residencial Harmonia", logo: "🎵" },
  { id: 5, name: "Condomínio Bela Vista", logo: "🌅" },
  { id: 6, name: "Residencial Parque das Flores", logo: "🌺" },
  { id: 7, name: "Edifício Horizonte", logo: "🌄" },
  { id: 8, name: "Condomínio Solar", logo: "☀️" }
];
