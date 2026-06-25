import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { ImagePicker } from "../components/ImagePicker";

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [footerSettings, setFooterSettings] = useState({
    address: "",
    phone: "",
    phones: [] as string[],
    email: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    showContactInfo: true
  });
  const [carouselItems, setCarouselItems] = useState<{ id: string, image: string, title?: string, link?: string }[]>([]);
  const [homeBanners, setHomeBanners] = useState({
    heroTitle: "",
    heroSubtitle: "",
    ctaTitle: "",
    ctaSubtitle: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;

      if (data) {
        const footerInfo = data.find(d => d.key === "footer");
        if (footerInfo && footerInfo.value) {
          setFooterSettings({
            ...footerInfo.value,
            showContactInfo: footerInfo.value.showContactInfo !== false,
            phones: footerInfo.value.phones || (footerInfo.value.phone ? [footerInfo.value.phone] : [])
          });
        }

        const carouselInfo = data.find(d => d.key === "carousel");
        if (carouselInfo && carouselInfo.value?.items) {
          setCarouselItems(carouselInfo.value.items);
        }

        const bannersInfo = data.find(d => d.key === "home_banners");
        if (bannersInfo && bannersInfo.value) {
          setHomeBanners(bannersInfo.value);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "footer", value: footerSettings, updated_at: new Date().toISOString() });
      if (error) throw error;
      alert("Rodapé salvo com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar rodapé: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCarousel = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "carousel", value: { items: carouselItems }, updated_at: new Date().toISOString() });
      if (error) throw error;
      alert("Carrossel salvo com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar carrossel: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "home_banners", value: homeBanners, updated_at: new Date().toISOString() });
      if (error) throw error;
      alert("Banners salvos com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar banners: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-10">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Configurações Gerais</h1>
        <p className="text-gray-500">Ajuste os textos do rodapé e imagens do carrossel principal</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">1. Carrossel da Home</h2>
          <p className="text-sm text-gray-500">Adicione banners ou capas grandes de postagens.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {carouselItems.map((item, idx) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 relative bg-gray-50">
                <button onClick={() => removeCarouselItem(item.id)} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="h-4 w-4"/></button>
                <div className="flex flex-col gap-3">
                  <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    <img src={item.image} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Slide {idx + 1}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Título Grande Principal (Opcional)</label>
                    <input type="text" value={item.title} onChange={e => updateCarouselItem(item.id, 'title', e.target.value)} className="w-full px-3 py-1.5 text-sm border rounded" placeholder="Texto que aparece na frente da foto" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Link do Botão "Saiba Mais" (Opcional)</label>
                    <input type="text" value={item.link} onChange={e => updateCarouselItem(item.id, 'link', e.target.value)} className="w-full px-3 py-1.5 text-sm border rounded font-mono" placeholder="Ex: /blog/xyz ou https://..." />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setShowImagePicker(true)} className="border-2 border-dashed border-gray-300 rounded-lg h-full min-h-[220px] flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <ImageIcon className="h-8 w-8 mb-2" />
              <span className="font-medium">Adicionar Slide</span>
            </button>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSaveCarousel} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center font-medium">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Salvar Carrossel
            </button>
          </div>
        </div>
      </div>


      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">2. Informações de Contato (Rodapé e Header)</h2>
            <p className="text-sm text-gray-500">Mude esses valores para atualizar todo o site.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Exibir Contatos no Site</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={footerSettings.showContactInfo} onChange={e => setFooterSettings({...footerSettings, showContactInfo: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveFooter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Endereço Principal</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={footerSettings.showAddress !== false} onChange={e => setFooterSettings({...footerSettings, showAddress: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>Exibir</span>
                  </label>
                </div>
                <input type="text" value={footerSettings.address} onChange={e => setFooterSettings({...footerSettings, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              <div className="md:row-span-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700">Telefones / WhatsApp</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" checked={footerSettings.showPhones !== false} onChange={e => setFooterSettings({...footerSettings, showPhones: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <button type="button" onClick={() => setFooterSettings({...footerSettings, phones: [...(footerSettings.phones || []), ""]})} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Adicionar</button>
                </div>
                <div className="space-y-2">
                  {(footerSettings.phones || []).map((phone, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" value={phone} onChange={e => {
                        const newPhones = [...footerSettings.phones];
                        newPhones[idx] = e.target.value;
                        setFooterSettings({...footerSettings, phones: newPhones});
                      }} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" placeholder="(00) 00000-0000" />
                      <button type="button" onClick={() => {
                        const newPhones = footerSettings.phones.filter((_, i) => i !== idx);
                        setFooterSettings({...footerSettings, phones: newPhones});
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-100">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {(!footerSettings.phones || footerSettings.phones.length === 0) && (
                    <p className="text-sm text-gray-500 italic py-2">Nenhum telefone cadastrado.</p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">E-mail Comercial</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={footerSettings.showEmail !== false} onChange={e => setFooterSettings({...footerSettings, showEmail: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>Exibir</span>
                  </label>
                </div>
                <input type="email" value={footerSettings.email} onChange={e => setFooterSettings({...footerSettings, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              
              <div className="md:col-span-2 pt-4 border-t">
                <h3 className="font-semibold text-gray-800 mb-3">Redes Sociais</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook (Link completo)</label>
                <input type="url" value={footerSettings.facebook} onChange={e => setFooterSettings({...footerSettings, facebook: e.target.value})} placeholder="https://facebook.com/..." className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Link completo)</label>
                <input type="url" value={footerSettings.instagram} onChange={e => setFooterSettings({...footerSettings, instagram: e.target.value})} placeholder="https://instagram.com/..." className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (Link completo)</label>
                <input type="url" value={footerSettings.linkedin} onChange={e => setFooterSettings({...footerSettings, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-2">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center font-medium">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Salvar Contatos
              </button>
            </div>
          </form>
        </div>
      </div>

      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">3. Banners da Página Inicial</h2>
          <p className="text-sm text-gray-500">Mude os textos de chamada do topo e do final da Home.</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveBanners} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2 pt-2">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Topo do Site (Hero)</h3>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal (Maior)</label>
                <input type="text" value={homeBanners.heroTitle} onChange={e => setHomeBanners({...homeBanners, heroTitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Menor)</label>
                <textarea rows={2} value={homeBanners.heroSubtitle} onChange={e => setHomeBanners({...homeBanners, heroSubtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              
              <div className="md:col-span-2 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Final do Site (Solicitar orçamento)</h3>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do CTA (Maior)</label>
                <input type="text" value={homeBanners.ctaTitle} onChange={e => setHomeBanners({...homeBanners, ctaTitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo do CTA (Menor)</label>
                <textarea rows={2} value={homeBanners.ctaSubtitle} onChange={e => setHomeBanners({...homeBanners, ctaSubtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600" />
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-2">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center font-medium">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Salvar Banners
              </button>
            </div>
          </form>
        </div>
      </div>

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
