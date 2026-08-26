import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router";
import { supabase } from "../../lib/supabase";
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Home, 
  Info, 
  Wrench, 
  Briefcase, 
  Truck, 
  FileText, 
  MessageSquareHeart, 
  PhoneCall, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Users,
  Edit2,
  X,
  GripVertical
} from "lucide-react";
import * as Icons from "lucide-react";
import { ImagePicker } from "../components/ImagePicker";
import { useServices, ServiceItem } from "../hooks/useServices";
import {
  useSiteSettings,
  defaultHomeSettings,
  defaultAboutSettings,
  defaultServicesSettings,
  defaultCareersSettings,
  defaultSuppliersSettings,
  defaultProposalSettings,
  defaultFeedbackSettings,
  HomeBanners,
  AboutSettings,
  ServicesPageSettings,
  CareersSettings,
  SuppliersSettings,
  ProposalSettings,
  FeedbackSettings,
  FooterSettings
} from "../hooks/useSiteSettings";

type ActiveTab = 
  | "home" 
  | "about" 
  | "services" 
  | "careers" 
  | "suppliers" 
  | "proposal" 
  | "feedback" 
  | "contact" 
  | "carousel";

export function AdminSettings() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Detecta se a rota acessada é /admin/services ou se há ?tab=...
  const initialTab: ActiveTab = 
    location.pathname.includes("/admin/services")
      ? "services"
      : (searchParams.get("tab") as ActiveTab) || "home";

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Hook de Serviços (CRUD completo)
  const { 
    services, 
    loading: loadingServices, 
    fetchServices, 
    addService, 
    updateService, 
    deleteService 
  } = useServices();

  const [isEditingService, setIsEditingService] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<ServiceItem> | null>(null);
  const [savingService, setSavingService] = useState(false);

  const availableIcons = [
    "Wallet", "Scale", "Wrench", "MessageSquare", "Users", "Shield", 
    "Building", "Briefcase", "CheckCircle", "FileText", "Home", "Key", "Star"
  ];

  // Estados das páginas
  const [homeSettings, setHomeSettings] = useState<HomeBanners>(defaultHomeSettings);
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(defaultAboutSettings);
  const [servicesSettings, setServicesSettings] = useState<ServicesPageSettings>(defaultServicesSettings);
  const [careersSettings, setCareersSettings] = useState<CareersSettings>(defaultCareersSettings);
  const [suppliersSettings, setSuppliersSettings] = useState<SuppliersSettings>(defaultSuppliersSettings);
  const [proposalSettings, setProposalSettings] = useState<ProposalSettings>(defaultProposalSettings);
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(defaultFeedbackSettings);
  
  // Rodapé e Carrossel
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    address: "",
    phone: "",
    phones: [],
    email: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    showContactInfo: true,
    showAddress: true,
    showEmail: true,
    showPhones: true
  });
  const [carouselItems, setCarouselItems] = useState<{ id: string, image: string, title?: string, link?: string }[]>([]);

  useEffect(() => {
    fetchAllSettings();
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (location.pathname.includes("/admin/services")) {
      setActiveTab("services");
    }
  }, [location.pathname]);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase.from("site_settings").select("*");
      if (fetchErr) throw fetchErr;

      if (data) {
        data.forEach(item => {
          switch (item.key) {
            case "home_banners":
              setHomeSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_about":
              setAboutSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_services":
              setServicesSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_careers":
              setCareersSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_suppliers":
              setSuppliersSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_proposal":
              setProposalSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "page_feedback":
              setFeedbackSettings(prev => ({ ...prev, ...(item.value || {}) }));
              break;
            case "footer":
              if (item.value) {
                setFooterSettings({
                  ...item.value,
                  showContactInfo: item.value.showContactInfo !== false,
                  showAddress: item.value.showAddress !== false,
                  showEmail: item.value.showEmail !== false,
                  showPhones: item.value.showPhones !== false,
                  phones: item.value.phones || (item.value.phone ? [item.value.phone] : [])
                });
              }
              break;
            case "carousel":
              if (item.value?.items) {
                setCarouselItems(item.value.items);
              }
              break;
          }
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações:", err);
      setError(err.message || "Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any, successMessage: string) => {
    setSaving(true);
    setSaveSuccess(null);
    setError(null);
    try {
      const { error: upsertErr } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (upsertErr) throw upsertErr;

      setSaveSuccess(successMessage);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error(`Erro ao salvar ${key}:`, err);
      setError(err.message || `Erro ao salvar ${key}.`);
    } finally {
      setSaving(false);
    }
  };

  // Funções de Gestão de Serviços (CRUD)
  const handleAddNewService = () => {
    setCurrentService({
      title: "",
      description: "",
      icon: "Star",
      features: [""],
      active: true,
      order_index: services.length + 1
    });
    setIsEditingService(true);
  };

  const handleEditService = (service: ServiceItem) => {
    setCurrentService(service);
    setIsEditingService(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;

    setSavingService(true);
    try {
      const cleanFeatures = (currentService.features || []).filter(f => f.trim() !== "");
      const dataToSave = { ...currentService, features: cleanFeatures };

      if (currentService.id) {
        await updateService(currentService.id, dataToSave);
      } else {
        await addService(dataToSave as any);
      }
      setIsEditingService(false);
      setCurrentService(null);
      setSaveSuccess("Serviço salvo com sucesso!");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setError("Erro ao salvar serviço: " + (err.message || err));
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Você tem certeza que quer excluir este serviço permanentemente? Ele sumirá do site imediatamente.")) {
      await deleteService(id);
      setSaveSuccess("Serviço removido com sucesso!");
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleToggleServiceActive = async (service: ServiceItem) => {
    await updateService(service.id, { active: !service.active });
  };

  const addServiceFeature = () => {
    if (currentService) {
      setCurrentService({
        ...currentService,
        features: [...(currentService.features || []), ""]
      });
    }
  };

  const updateServiceFeature = (index: number, value: string) => {
    if (currentService && currentService.features) {
      const newFeatures = [...currentService.features];
      newFeatures[index] = value;
      setCurrentService({ ...currentService, features: newFeatures });
    }
  };

  const removeServiceFeature = (index: number) => {
    if (currentService && currentService.features) {
      setCurrentService({
        ...currentService,
        features: currentService.features.filter((_, i) => i !== index)
      });
    }
  };

  const renderServiceIcon = (iconName: string, className = "h-5 w-5") => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent className={className} />;
  };

  // Funções de Carrossel
  const addCarouselItem = (url: string) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      image: url,
      title: "",
      link: ""
    };
    setCarouselItems([...carouselItems, newItem]);
  };

  const updateCarouselItem = (id: string, field: string, value: string) => {
    setCarouselItems(carouselItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeCarouselItem = (id: string) => {
    setCarouselItems(carouselItems.filter(item => item.id !== id));
  };

  // Funções de Membros da Equipe (Sobre)
  const addTeamMember = () => {
    setAboutSettings({
      ...aboutSettings,
      teamMembers: [
        ...(aboutSettings.teamMembers || []),
        { name: "", role: "", description: "" }
      ]
    });
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const newMembers = [...aboutSettings.teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setAboutSettings({ ...aboutSettings, teamMembers: newMembers });
  };

  const removeTeamMember = (index: number) => {
    const newMembers = aboutSettings.teamMembers.filter((_, i) => i !== index);
    setAboutSettings({ ...aboutSettings, teamMembers: newMembers });
  };

  const tabs = [
    { id: "home", label: "Página Inicial", icon: Home },
    { id: "about", label: "Quem Somos", icon: Info },
    { id: "services", label: "Serviços", icon: Wrench },
    { id: "careers", label: "Trabalhe Conosco", icon: Briefcase },
    { id: "suppliers", label: "Fornecedores", icon: Truck },
    { id: "proposal", label: "Solicitar Proposta", icon: FileText },
    { id: "feedback", label: "Ouvidoria & Feedback", icon: MessageSquareHeart },
    { id: "contact", label: "Contatos & Rodapé", icon: PhoneCall },
    { id: "carousel", label: "Carrossel de Banners", icon: Layers },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10 mb-4" />
        <p className="text-gray-500 font-medium">Carregando painel de textos e configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Gestão Total de Conteúdo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-montserrat tracking-tight">
            Gerenciador de Textos e Conteúdo
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Edite todos os textos, títulos, serviços e banners do site separados por página.
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fadeIn">
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Menu de Abas por Página */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200/80 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ActiveTab);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: PÁGINA INICIAL (HOME) */}
      {activeTab === "home" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos da Página Inicial (Home)</h2>
              <p className="text-xs text-gray-500">Personalize o topo (Hero), chamadas do blog, parceiros e o banner final.</p>
            </div>
            <button
              onClick={() => handleSave("home_banners", homeSettings, "Textos da Página Inicial salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Página Inicial
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Seção 1: Topo / Hero */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                1. Topo da Página (Hero Principal)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título Principal (H1)</label>
                  <input
                    type="text"
                    value={homeSettings.heroTitle}
                    onChange={(e) => setHomeSettings({ ...homeSettings, heroTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo Explicativo</label>
                  <textarea
                    rows={2}
                    value={homeSettings.heroSubtitle}
                    onChange={(e) => setHomeSettings({ ...homeSettings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Botão de Serviços</label>
                  <input
                    type="text"
                    value={homeSettings.heroButtonText || "Conheça nossos serviços"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, heroButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Seção de Blog */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                2. Vitrine de Artigos do Blog
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Seção</label>
                  <input
                    type="text"
                    value={homeSettings.blogSectionTitle || "Blog - Conteúdo Técnico"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Botão "Ver Todos"</label>
                  <input
                    type="text"
                    value={homeSettings.blogButtonText || "Ver todos os artigos"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, blogButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo da Seção</label>
                  <input
                    type="text"
                    value={homeSettings.blogSectionSubtitle || "Artigos e informações técnicas sobre administração condominial, legislação, gestão e boas práticas."}
                    onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Seção de Clientes e Parceiros */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                3. Seção de Clientes e Parceiros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Seção</label>
                  <input
                    type="text"
                    value={homeSettings.clientsSectionTitle || "Nossos Clientes e Parceiros"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, clientsSectionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo</label>
                  <input
                    type="text"
                    value={homeSettings.clientsSectionSubtitle || "Condomínios que confiam em nossa gestão"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, clientsSectionSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Banner Final (CTA) */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                4. Banner Final de Orçamento (CTA)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Chamada</label>
                  <input
                    type="text"
                    value={homeSettings.ctaTitle}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ctaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo da Chamada</label>
                  <textarea
                    rows={2}
                    value={homeSettings.ctaSubtitle}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ctaSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Botão</label>
                  <input
                    type="text"
                    value={homeSettings.ctaButtonText || "Solicitar Orçamento"}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ctaButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: QUEM SOMOS (SOBRE) */}
      {activeTab === "about" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos da Página Quem Somos</h2>
              <p className="text-xs text-gray-500">Altere a história da empresa, métricas de destaque, missão, visão, valores e membros da equipe.</p>
            </div>
            <button
              onClick={() => handleSave("page_about", aboutSettings, "Página Quem Somos salva com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Quem Somos
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Topo */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                1. Cabeçalho da Página
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Página</label>
                  <input
                    type="text"
                    value={aboutSettings.headerTitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, headerTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo de Introdução</label>
                  <textarea
                    rows={2}
                    value={aboutSettings.headerSubtitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, headerSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Estatísticas e Números de Destaque */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                2. Números e Estatísticas de Destaque
              </h3>
              <p className="text-xs text-gray-500">Esses números aparecem em destaque na página Quem Somos.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Condomínios */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
                  <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                    🏢 Condomínios
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Quantidade / Número</label>
                    <input
                      type="text"
                      value={aboutSettings.statsCondos || "150+"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsCondos: e.target.value })}
                      placeholder="Ex: 150+"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Rótulo / Descrição</label>
                    <input
                      type="text"
                      value={aboutSettings.statsCondosLabel || "Condomínios Administrados"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsCondosLabel: e.target.value })}
                      placeholder="Condomínios Administrados"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    />
                  </div>
                </div>

                {/* Unidades */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
                  <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                    🏘️ Unidades
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Quantidade / Número</label>
                    <input
                      type="text"
                      value={aboutSettings.statsUnits || "12.000+"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsUnits: e.target.value })}
                      placeholder="Ex: 12.000+"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Rótulo / Descrição</label>
                    <input
                      type="text"
                      value={aboutSettings.statsUnitsLabel || "Unidades Gerenciadas"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsUnitsLabel: e.target.value })}
                      placeholder="Unidades Gerenciadas"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    />
                  </div>
                </div>

                {/* Colaboradores */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
                  <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                    👥 Colaboradores
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Quantidade / Número</label>
                    <input
                      type="text"
                      value={aboutSettings.statsEmployees || "80+"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsEmployees: e.target.value })}
                      placeholder="Ex: 80+"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Rótulo / Descrição</label>
                    <input
                      type="text"
                      value={aboutSettings.statsEmployeesLabel || "Colaboradores Especialistas"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsEmployeesLabel: e.target.value })}
                      placeholder="Colaboradores Especialistas"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    />
                  </div>
                </div>

                {/* Anos de Experiência */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
                  <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                    ⏳ Experiência
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Quantidade / Número</label>
                    <input
                      type="text"
                      value={aboutSettings.statsExperience || "15+"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsExperience: e.target.value })}
                      placeholder="Ex: 15+"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase">Rótulo / Descrição</label>
                    <input
                      type="text"
                      value={aboutSettings.statsExperienceLabel || "Anos de Experiência"}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, statsExperienceLabel: e.target.value })}
                      placeholder="Anos de Experiência"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* História */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                3. História da Empresa
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Seção</label>
                  <input
                    type="text"
                    value={aboutSettings.historyTitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, historyTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto Completo da História (Separe parágrafos com linha em branco)</label>
                  <textarea
                    rows={6}
                    value={aboutSettings.historyText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, historyText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Missão, Visão e Valores */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                4. Missão, Visão e Valores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Missão</h4>
                  <input
                    type="text"
                    value={aboutSettings.missionTitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, missionTitle: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título (ex: Missão)"
                  />
                  <textarea
                    rows={3}
                    value={aboutSettings.missionText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, missionText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Descrição da missão"
                  />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Visão</h4>
                  <input
                    type="text"
                    value={aboutSettings.visionTitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, visionTitle: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título (ex: Visão)"
                  />
                  <textarea
                    rows={3}
                    value={aboutSettings.visionText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, visionText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Descrição da visão"
                  />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Valores</h4>
                  <input
                    type="text"
                    value={aboutSettings.valuesTitle}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, valuesTitle: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título (ex: Valores)"
                  />
                  <textarea
                    rows={3}
                    value={aboutSettings.valuesText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, valuesText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Descrição dos valores"
                  />
                </div>
              </div>
            </div>

            {/* Equipe */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700">
                  5. Seção Nossa Equipe
                </h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Membro
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Seção de Equipe</label>
                <input
                  type="text"
                  value={aboutSettings.teamTitle}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, teamTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(aboutSettings.teamMembers || []).map((member, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl relative space-y-2.5">
                    <button
                      type="button"
                      onClick={() => removeTeamMember(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded-lg cursor-pointer"
                      title="Remover membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Nome</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(idx, "name", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                        placeholder="Ex: Roberto Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Cargo</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(idx, "role", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-blue-600 bg-white"
                        placeholder="Ex: CEO & Fundador"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Mini Bio / Experiência</label>
                      <textarea
                        rows={2}
                        value={member.description}
                        onChange={(e) => updateTeamMember(idx, "description", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                        placeholder="Ex: Mais de 20 anos de experiência..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: SERVIÇOS (CENTRALIZADA COM CRUD COMPLETO) */}
      {activeTab === "services" && (
        <div className="space-y-8">
          {/* Cabeçalho da Página e Banners */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos Gerais da Página de Serviços</h2>
                <p className="text-xs text-gray-500">Ajuste o cabeçalho e os textos do banner de orçamento final da página.</p>
              </div>
              <button
                onClick={() => handleSave("page_services", servicesSettings, "Textos de Serviços salvos com sucesso!")}
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Textos da Página
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Página</label>
                  <input
                    type="text"
                    value={servicesSettings.headerTitle}
                    onChange={(e) => setServicesSettings({ ...servicesSettings, headerTitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo do Topo</label>
                  <textarea
                    rows={2}
                    value={servicesSettings.headerSubtitle}
                    onChange={(e) => setServicesSettings({ ...servicesSettings, headerSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banner Final */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-700 border-b pb-2">
                  Banner Final de Contato (CTA)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Chamada</label>
                    <input
                      type="text"
                      value={servicesSettings.ctaTitle}
                      onChange={(e) => setServicesSettings({ ...servicesSettings, ctaTitle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={servicesSettings.ctaSubtitle}
                      onChange={(e) => setServicesSettings({ ...servicesSettings, ctaSubtitle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Botão de Orçamento</label>
                    <input
                      type="text"
                      value={servicesSettings.ctaButtonProposalText}
                      onChange={(e) => setServicesSettings({ ...servicesSettings, ctaButtonProposalText: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Botão de Ligação</label>
                    <input
                      type="text"
                      value={servicesSettings.ctaButtonCallText}
                      onChange={(e) => setServicesSettings({ ...servicesSettings, ctaButtonCallText: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gerenciamento de Cards Individuais de Serviços */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-montserrat">Cards de Serviços Oferecidos</h2>
                <p className="text-xs text-gray-500">Adicione, edite, organize e ative os serviços exibidos no site.</p>
              </div>
              {!isEditingService && (
                <button
                  onClick={handleAddNewService}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Novo Serviço
                </button>
              )}
            </div>

            <div className="p-8">
              {isEditingService && currentService ? (
                <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-6 space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-base text-gray-900 font-montserrat">
                      {currentService.id ? "Editar Serviço" : "Criar Novo Serviço"}
                    </h3>
                    <button 
                      onClick={() => { setIsEditingService(false); setCurrentService(null); }} 
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveService} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título do Serviço *</label>
                        <input
                          type="text"
                          required
                          value={currentService.title || ""}
                          onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
                          placeholder="Ex: Gestão Financeira Completa"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Descrição Breve *</label>
                        <textarea
                          required
                          rows={2}
                          value={currentService.description || ""}
                          onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                          placeholder="Descreva o serviço em poucas palavras..."
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Ícone de Destaque</label>
                        <div className="flex flex-wrap gap-2.5">
                          {availableIcons.map(icon => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setCurrentService({ ...currentService, icon })}
                              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                currentService.icon === icon 
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm font-bold' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                              }`}
                              title={icon}
                            >
                              {renderServiceIcon(icon, "h-5 w-5")}
                              <span className="text-[10px]">{icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-semibold text-gray-700 uppercase">Tópicos / Benefícios Inclusos</label>
                        </div>
                        <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-gray-200">
                          {currentService.features?.map((feature, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="text-gray-400">
                                <GripVertical className="h-4 w-4"/>
                              </div>
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateServiceFeature(idx, e.target.value)}
                                placeholder="Ex: Emissão de boletos bancários com código de barras"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeServiceFeature(idx)} 
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                title="Remover tópico"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={addServiceFeature} 
                            className="text-xs text-blue-600 font-semibold hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 mt-2 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5"/> Adicionar Tópico
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => { setIsEditingService(false); setCurrentService(null); }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingService}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {savingService && <Loader2 className="animate-spin h-4 w-4" />}
                        {savingService ? "Salvando..." : "Salvar Serviço"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div 
                      key={service.id} 
                      className={`bg-white rounded-2xl shadow-xs border p-6 flex flex-col transition-all ${
                        !service.active ? 'opacity-60 grayscale-[0.5] border-dashed border-gray-300' : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                          {renderServiceIcon(service.icon)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleToggleServiceActive(service)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                              service.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title={service.active ? "Clique para ocultar do site" : "Clique para exibir no site"}
                          >
                            {service.active ? "Ativo" : "Oculto"}
                          </button>
                          <button 
                            onClick={() => handleEditService(service)} 
                            className="p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Editar serviço"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)} 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir serviço"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-base mb-1.5 text-gray-900 font-montserrat">{service.title}</h3>
                      <p className="text-gray-600 text-xs mb-4 line-clamp-2 flex-grow">{service.description}</p>
                      
                      <div className="border-t pt-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tópicos Inclusos ({service.features?.length || 0})</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {service.features?.slice(0, 3).map((f, i) => (
                            <li key={i} className="line-clamp-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                              {f}
                            </li>
                          ))}
                          {service.features && service.features.length > 3 && (
                            <li className="text-gray-400 italic text-[11px] pl-3">e mais {service.features.length - 3} tópicos...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {services.length === 0 && !loadingServices && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-500 font-medium pb-2 text-sm">Nenhum serviço cadastrado.</p>
                      <button onClick={handleAddNewService} className="text-blue-600 font-semibold hover:underline text-sm cursor-pointer">
                        + Criar o primeiro serviço agora
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: TRABALHE CONOSCO */}
      {activeTab === "careers" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos da Página Trabalhe Conosco</h2>
              <p className="text-xs text-gray-500">Configure o título, instruções e mensagem exibida após o envio do currículo.</p>
            </div>
            <button
              onClick={() => handleSave("page_careers", careersSettings, "Textos de Trabalhe Conosco salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Trabalhe Conosco
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título Principal</label>
                <input
                  type="text"
                  value={careersSettings.headerTitle}
                  onChange={(e) => setCareersSettings({ ...careersSettings, headerTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título do Bloco de Envio</label>
                <input
                  type="text"
                  value={careersSettings.instructionsTitle}
                  onChange={(e) => setCareersSettings({ ...careersSettings, instructionsTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo / Descrição</label>
                <textarea
                  rows={2}
                  value={careersSettings.headerSubtitle}
                  onChange={(e) => setCareersSettings({ ...careersSettings, headerSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Instruções de Upload (Formatos/Tamanho)</label>
                <input
                  type="text"
                  value={careersSettings.instructionsText}
                  onChange={(e) => setCareersSettings({ ...careersSettings, instructionsText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Mensagem de Sucesso</label>
                <input
                  type="text"
                  value={careersSettings.successTitle}
                  onChange={(e) => setCareersSettings({ ...careersSettings, successTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-emerald-700 font-semibold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto de Confirmação de Envio</label>
                <textarea
                  rows={3}
                  value={careersSettings.successMessage}
                  onChange={(e) => setCareersSettings({ ...careersSettings, successMessage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: FORNECEDORES */}
      {activeTab === "suppliers" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos do Cadastro de Fornecedores</h2>
              <p className="text-xs text-gray-500">Defina os termos, orientações e textos da tela de prestadores de serviço.</p>
            </div>
            <button
              onClick={() => handleSave("page_suppliers", suppliersSettings, "Textos de Fornecedores salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Fornecedores
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Página</label>
                <input
                  type="text"
                  value={suppliersSettings.headerTitle}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, headerTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo</label>
                <textarea
                  rows={2}
                  value={suppliersSettings.headerSubtitle}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, headerSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Card Azul Informativo</label>
                <textarea
                  rows={3}
                  value={suppliersSettings.infoBoxText}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, infoBoxText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Texto do Checkbox de Termos e Condições</label>
                <input
                  type="text"
                  value={suppliersSettings.termsCheckboxText}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, termsCheckboxText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título de Sucesso</label>
                <input
                  type="text"
                  value={suppliersSettings.successTitle}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, successTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-emerald-700 font-semibold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Mensagem de Sucesso</label>
                <textarea
                  rows={3}
                  value={suppliersSettings.successMessage}
                  onChange={(e) => setSuppliersSettings({ ...suppliersSettings, successMessage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: SOLICITAR PROPOSTA */}
      {activeTab === "proposal" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos de Solicitação de Proposta</h2>
              <p className="text-xs text-gray-500">Configure o cabeçalho, instruções e confirmação da tela de orçamento.</p>
            </div>
            <button
              onClick={() => handleSave("page_proposal", proposalSettings, "Textos de Proposta salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Proposta
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Página</label>
                <input
                  type="text"
                  value={proposalSettings.headerTitle}
                  onChange={(e) => setProposalSettings({ ...proposalSettings, headerTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo</label>
                <textarea
                  rows={2}
                  value={proposalSettings.headerSubtitle}
                  onChange={(e) => setProposalSettings({ ...proposalSettings, headerSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Aviso do Formulário</label>
                <textarea
                  rows={2}
                  value={proposalSettings.formNotice}
                  onChange={(e) => setProposalSettings({ ...proposalSettings, formNotice: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título de Sucesso</label>
                <input
                  type="text"
                  value={proposalSettings.successTitle}
                  onChange={(e) => setProposalSettings({ ...proposalSettings, successTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-emerald-700 font-semibold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Mensagem de Sucesso</label>
                <textarea
                  rows={3}
                  value={proposalSettings.successMessage}
                  onChange={(e) => setProposalSettings({ ...proposalSettings, successMessage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 7: OUVIDORIA & FEEDBACK */}
      {activeTab === "feedback" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Textos da Página de Ouvidoria & Feedback</h2>
              <p className="text-xs text-gray-500">Configure as chamadas do canal de ouvidoria e depoimentos de clientes.</p>
            </div>
            <button
              onClick={() => handleSave("page_feedback", feedbackSettings, "Textos de Ouvidoria salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Ouvidoria
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Página</label>
                <input
                  type="text"
                  value={feedbackSettings.headerTitle}
                  onChange={(e) => setFeedbackSettings({ ...feedbackSettings, headerTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Subtítulo</label>
                <textarea
                  rows={2}
                  value={feedbackSettings.headerSubtitle}
                  onChange={(e) => setFeedbackSettings({ ...feedbackSettings, headerSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título do Formulário</label>
                <input
                  type="text"
                  value={feedbackSettings.formTitle}
                  onChange={(e) => setFeedbackSettings({ ...feedbackSettings, formTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Título da Seção de Depoimentos</label>
                <input
                  type="text"
                  value={feedbackSettings.testimonialsTitle}
                  onChange={(e) => setFeedbackSettings({ ...feedbackSettings, testimonialsTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Descrição do Formulário</label>
                <input
                  type="text"
                  value={feedbackSettings.formDescription}
                  onChange={(e) => setFeedbackSettings({ ...feedbackSettings, formDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 8: CONTATOS & RODAPÉ */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Informações de Contato e Rodapé</h2>
              <p className="text-xs text-gray-500">Esses dados são refletidos no cabeçalho e em todos os rodapés do site.</p>
            </div>
            <button
              onClick={() => handleSave("footer", footerSettings, "Contatos e Rodapé salvos com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Contatos
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <div>
                <p className="font-bold text-sm text-gray-900">Exibir Bloco de Contatos no Site</p>
                <p className="text-xs text-gray-500">Ativa ou oculta os dados gerais de contato no rodapé.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={footerSettings.showContactInfo} 
                  onChange={e => setFooterSettings({...footerSettings, showContactInfo: e.target.checked})} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Texto abaixo da Logo (Descrição no Rodapé)
                </label>
                <textarea
                  rows={2}
                  value={footerSettings.description ?? "Soluções completas em administração condominial com transparência, eficiência e tecnologia."}
                  onChange={e => setFooterSettings({ ...footerSettings, description: e.target.value })}
                  placeholder="Soluções completas em administração condominial com transparência, eficiência e tecnologia."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase">Endereço Principal</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                    <input 
                      type="checkbox" 
                      checked={footerSettings.showAddress !== false} 
                      onChange={e => setFooterSettings({...footerSettings, showAddress: e.target.checked})} 
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Exibir</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={footerSettings.address} 
                  onChange={e => setFooterSettings({...footerSettings, address: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase">E-mail Comercial</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                    <input 
                      type="checkbox" 
                      checked={footerSettings.showEmail !== false} 
                      onChange={e => setFooterSettings({...footerSettings, showEmail: e.target.checked})} 
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Exibir</span>
                  </label>
                </div>
                <input 
                  type="email" 
                  value={footerSettings.email} 
                  onChange={e => setFooterSettings({...footerSettings, email: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="contato@situacional.com.br"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Telefones & WhatsApp</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={footerSettings.showPhones !== false} 
                        onChange={e => setFooterSettings({...footerSettings, showPhones: e.target.checked})} 
                        className="rounded text-blue-600 focus:ring-blue-500" 
                      />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFooterSettings({...footerSettings, phones: [...(footerSettings.phones || []), ""]})} 
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Telefone
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(footerSettings.phones || []).map((phone, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={e => {
                          const newPhones = [...footerSettings.phones];
                          newPhones[idx] = e.target.value;
                          setFooterSettings({...footerSettings, phones: newPhones});
                        }} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" 
                        placeholder="(11) 99999-9999" 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newPhones = footerSettings.phones.filter((_, i) => i !== idx);
                          setFooterSettings({...footerSettings, phones: newPhones});
                        }} 
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer"
                        title="Remover telefone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-blue-700 mb-3">
                  Redes Sociais
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Instagram (Link completo)</label>
                <input 
                  type="url" 
                  value={footerSettings.instagram} 
                  onChange={e => setFooterSettings({...footerSettings, instagram: e.target.value})} 
                  placeholder="https://instagram.com/..." 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">LinkedIn (Link completo)</label>
                <input 
                  type="url" 
                  value={footerSettings.linkedin} 
                  onChange={e => setFooterSettings({...footerSettings, linkedin: e.target.value})} 
                  placeholder="https://linkedin.com/in/..." 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Facebook (Link completo)</label>
                <input 
                  type="url" 
                  value={footerSettings.facebook} 
                  onChange={e => setFooterSettings({...footerSettings, facebook: e.target.value})} 
                  placeholder="https://facebook.com/..." 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 9: CARROSSEL DE BANNERS */}
      {activeTab === "carousel" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-montserrat">Carrossel de Slides da Home</h2>
              <p className="text-xs text-gray-500">Adicione banners ou capas grandes de postagens.</p>
            </div>
            <button
              onClick={() => handleSave("carousel", { items: carouselItems }, "Carrossel salvo com sucesso!")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Carrossel
            </button>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {carouselItems.map((item, idx) => (
                <div key={item.id} className="border border-gray-200 rounded-2xl p-5 relative bg-gray-50/70 shadow-2xs space-y-3">
                  <button 
                    onClick={() => removeCarouselItem(item.id)} 
                    className="absolute top-3 right-3 p-1.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors cursor-pointer"
                    title="Remover slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-inner">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg font-medium">Slide {idx + 1}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Título Grande no Slide (Opcional)</label>
                    <input 
                      type="text" 
                      value={item.title || ""} 
                      onChange={e => updateCarouselItem(item.id, 'title', e.target.value)} 
                      className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" 
                      placeholder="Texto em destaque" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Link do Botão "Saiba Mais" (Opcional)</label>
                    <input 
                      type="text" 
                      value={item.link || ""} 
                      onChange={e => updateCarouselItem(item.id, 'link', e.target.value)} 
                      className="w-full px-3 py-2 text-sm border rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" 
                      placeholder="/blog/meu-post ou https://..." 
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setShowImagePicker(true)} 
                className="border-2 border-dashed border-gray-300 rounded-2xl h-full min-h-[240px] flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <div className="p-3 bg-gray-100 rounded-2xl mb-2 text-gray-400 group-hover:text-blue-600">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="font-semibold text-sm">Adicionar Novo Slide</span>
                <span className="text-xs text-gray-400 mt-0.5">Clique para escolher do banco de imagens</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePicker && (
        <ImagePicker 
          onClose={() => setShowImagePicker(false)}
          onSelect={({url}) => {
            addCarouselItem(url);
            setShowImagePicker(false);
          }}
        />
      )}
    </div>
  );
}
