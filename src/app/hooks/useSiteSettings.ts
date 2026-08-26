import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface FooterSettings {
  description?: string; // Texto abaixo da logo no rodapé
  address: string;
  phone?: string;
  phones?: string[];
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  showContactInfo?: boolean;
  showAddress?: boolean;
  showEmail?: boolean;
  showPhones?: boolean;
}

export interface HomeBanners {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText?: string;
  blogSectionTitle?: string;
  blogSectionSubtitle?: string;
  blogButtonText?: string;
  clientsSectionTitle?: string;
  clientsSectionSubtitle?: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText?: string;
}

export interface AboutSettings {
  headerTitle: string;
  headerSubtitle: string;
  // Métricas e Números de Destaque
  statsCondos: string;
  statsCondosLabel: string;
  statsUnits: string;
  statsUnitsLabel: string;
  statsEmployees: string;
  statsEmployeesLabel: string;
  statsExperience: string;
  statsExperienceLabel: string;

  historyTitle: string;
  historyText: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
  teamTitle: string;
  teamMembers: {
    name: string;
    role: string;
    description: string;
  }[];
}

export interface ServicesPageSettings {
  headerTitle: string;
  headerSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonProposalText: string;
  ctaButtonCallText: string;
}

export interface CareersSettings {
  headerTitle: string;
  headerSubtitle: string;
  instructionsTitle: string;
  instructionsText: string;
  successTitle: string;
  successMessage: string;
}

export interface SuppliersSettings {
  headerTitle: string;
  headerSubtitle: string;
  infoBoxText: string;
  termsCheckboxText: string;
  successTitle: string;
  successMessage: string;
}

export interface ProposalSettings {
  headerTitle: string;
  headerSubtitle: string;
  formNotice: string;
  successTitle: string;
  successMessage: string;
}

export interface FeedbackSettings {
  headerTitle: string;
  headerSubtitle: string;
  formTitle: string;
  formDescription: string;
  testimonialsTitle: string;
}

export const defaultFooterSettings: FooterSettings = {
  description: "Soluções completas em administração condominial com transparência, eficiência e tecnologia.",
  address: "Av. Paulista, 1000 - São Paulo, SP",
  phones: ["(11) 3456-7890"],
  email: "contato@situacional.com.br",
  facebook: "",
  instagram: "",
  linkedin: "",
  showContactInfo: true,
  showAddress: true,
  showEmail: true,
  showPhones: true
};

export const defaultAboutSettings: AboutSettings = {
  headerTitle: "Quem Somos",
  headerSubtitle: "Uma empresa dedicada à excelência em administração condominial, com foco em transparência, tecnologia e satisfação dos clientes.",
  // Métricas padrão
  statsCondos: "150+",
  statsCondosLabel: "Condomínios Administrados",
  statsUnits: "12.000+",
  statsUnitsLabel: "Unidades Gerenciadas",
  statsEmployees: "80+",
  statsEmployeesLabel: "Colaboradores Especialistas",
  statsExperience: "15+",
  statsExperienceLabel: "Anos de Experiência",

  historyTitle: "Nossa História",
  historyText: "Fundada em 2010, a SITUACIONAL nasceu com o propósito de revolucionar a administração condominial no Brasil. Começamos atendendo apenas 5 condomínios e hoje somos responsáveis pela gestão de mais de 150 empreendimentos em todo o país.\n\nNossa trajetória é marcada pela busca constante por inovação e excelência. Investimos continuamente em tecnologia para oferecer aos nossos clientes ferramentas modernas de gestão, garantindo transparência total e facilidade de comunicação entre síndicos, administradores e moradores.\n\nCom uma equipe altamente qualificada e comprometida, nossa missão é proporcionar tranquilidade aos síndicos e moradores, cuidando de todos os aspectos administrativos, financeiros, jurídicos e operacionais dos condomínios.",
  missionTitle: "Missão",
  missionText: "Oferecer serviços de administração condominial com excelência, transparência e inovação, garantindo a satisfação e tranquilidade dos moradores.",
  visionTitle: "Visão",
  visionText: "Ser referência nacional em administração condominial, reconhecida pela qualidade dos serviços e pela transformação digital na gestão de condomínios.",
  valuesTitle: "Valores",
  valuesText: "Transparência, ética, profissionalismo, inovação tecnológica, compromisso com resultados e foco no cliente.",
  teamTitle: "Nossa Equipe",
  teamMembers: [
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
  ]
};

export const defaultHomeSettings: HomeBanners = {
  heroTitle: "Administração Condominial Profissional e Transparente",
  heroSubtitle: "Soluções completas em gestão condominial com tecnologia, eficiência e foco total na satisfação dos moradores.",
  heroButtonText: "Conheça nossos serviços",
  blogSectionTitle: "Blog - Conteúdo Técnico",
  blogSectionSubtitle: "Artigos e informações técnicas sobre administração condominial, legislação, gestão e boas práticas.",
  blogButtonText: "Ver todos os artigos",
  clientsSectionTitle: "Nossos Clientes e Parceiros",
  clientsSectionSubtitle: "Condomínios que confiam em nossa gestão",
  ctaTitle: "Pronto para uma gestão condominial de excelência?",
  ctaSubtitle: "Entre em contato conosco e descubra como podemos transformar a administração do seu condomínio.",
  ctaButtonText: "Solicitar Orçamento"
};

export const defaultServicesSettings: ServicesPageSettings = {
  headerTitle: "Nossos Serviços",
  headerSubtitle: "Soluções completas e personalizadas para a administração do seu condomínio",
  ctaTitle: "Interessado em nossos serviços?",
  ctaSubtitle: "Entre em contato conosco e solicite um orçamento personalizado para seu condomínio",
  ctaButtonProposalText: "Solicitar Orçamento",
  ctaButtonCallText: "Ligar Agora"
};

export const defaultCareersSettings: CareersSettings = {
  headerTitle: "Trabalhe Conosco",
  headerSubtitle: "Venha fazer parte da nossa equipe! Envie seu currículo e cadastre-se para nossas oportunidades.",
  instructionsTitle: "Envio de Currículo",
  instructionsText: "Preencha seus dados abaixo e anexe seu currículo em formato PDF (máx. 5MB).",
  successTitle: "Candidatura Enviada!",
  successMessage: "Recebemos seu currículo com sucesso! Nossa equipe do departamento de RH analisará suas informações e entrará em contato assim que surgir uma oportunidade alinhada ao seu perfil."
};

export const defaultSuppliersSettings: SuppliersSettings = {
  headerTitle: "Cadastro de Prestador de Serviços",
  headerSubtitle: "Faça parte da nossa rede credenciada de fornecedores e preste serviços aos condomínios administrados.",
  infoBoxText: "Ao se cadastrar na Rede de Prestadores da Situacional, sua empresa terá acesso a solicitações de orçamentos e serviços demandados diariamente por dezenas de condomínios da nossa carteira.",
  termsCheckboxText: "Concordo em disputar orçamentos de serviços com outros fornecedores credenciados.",
  successTitle: "Cadastro Realizado com Sucesso!",
  successMessage: "Sua inscrição como prestador de serviços foi recebida. Nossa equipe fará a validação cadastral e seus dados ficarão disponíveis no catálogo exclusivo dos nossos síndicos."
};

export const defaultProposalSettings: ProposalSettings = {
  headerTitle: "Solicitar Proposta Comercial",
  headerSubtitle: "Receba um orçamento detalhado e sob medida para a administração do seu condomínio.",
  formNotice: "Preencha as informações do condomínio para gerarmos uma estimativa precisa de honorários e soluções personalizadas.",
  successTitle: "Proposta Solicitada com Sucesso!",
  successMessage: "Recebemos os dados do seu condomínio! Nosso time comercial elaborará uma proposta personalizada e entrará em contato em até 24 horas úteis."
};

export const defaultFeedbackSettings: FeedbackSettings = {
  headerTitle: "Canal de Ouvidoria & Feedback",
  headerSubtitle: "Sua opinião é fundamental para aprimorarmos continuamente a qualidade dos nossos serviços.",
  formTitle: "Envie sua Mensagem",
  formDescription: "Seja um elogio, sugestão, dúvida ou reclamação, estamos prontos para ouvir você.",
  testimonialsTitle: "O que dizem sobre nossa gestão"
};

export function useSiteSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSetting = useCallback(async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .single();

      if (error) {
        if (error.code === "PGRST116") return defaultValue;
        throw error;
      }

      return { ...defaultValue, ...(data?.value || {}) };
    } catch (err: any) {
      console.error(`Erro ao carregar configuração '${key}':`, err);
      return defaultValue;
    }
  }, []);

  const saveSetting = async (key: string, value: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error(`Erro ao salvar configuração '${key}':`, err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchFooterSettings = useCallback(async (): Promise<FooterSettings | null> => {
    return fetchSetting<FooterSettings>("footer", defaultFooterSettings);
  }, [fetchSetting]);

  const fetchHomeBanners = useCallback(async (): Promise<HomeBanners> => {
    return fetchSetting<HomeBanners>("home_banners", defaultHomeSettings);
  }, [fetchSetting]);

  const fetchAboutSettings = useCallback(async (): Promise<AboutSettings> => {
    return fetchSetting<AboutSettings>("page_about", defaultAboutSettings);
  }, [fetchSetting]);

  const fetchServicesSettings = useCallback(async (): Promise<ServicesPageSettings> => {
    return fetchSetting<ServicesPageSettings>("page_services", defaultServicesSettings);
  }, [fetchSetting]);

  const fetchCareersSettings = useCallback(async (): Promise<CareersSettings> => {
    return fetchSetting<CareersSettings>("page_careers", defaultCareersSettings);
  }, [fetchSetting]);

  const fetchSuppliersSettings = useCallback(async (): Promise<SuppliersSettings> => {
    return fetchSetting<SuppliersSettings>("page_suppliers", defaultSuppliersSettings);
  }, [fetchSetting]);

  const fetchProposalSettings = useCallback(async (): Promise<ProposalSettings> => {
    return fetchSetting<ProposalSettings>("page_proposal", defaultProposalSettings);
  }, [fetchSetting]);

  const fetchFeedbackSettings = useCallback(async (): Promise<FeedbackSettings> => {
    return fetchSetting<FeedbackSettings>("page_feedback", defaultFeedbackSettings);
  }, [fetchSetting]);

  return {
    loading,
    error,
    saveSetting,
    fetchSetting,
    fetchFooterSettings,
    fetchHomeBanners,
    fetchAboutSettings,
    fetchServicesSettings,
    fetchCareersSettings,
    fetchSuppliersSettings,
    fetchProposalSettings,
    fetchFeedbackSettings
  };
}
