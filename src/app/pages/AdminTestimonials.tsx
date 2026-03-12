import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Edit2, Loader2, User } from "lucide-react";
import { ImagePicker } from "../components/ImagePicker";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  show_on_home: boolean;
  created_at: string;
}

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [form, setForm] = useState<Partial<Testimonial>>({ name: "", role: "", content: "", avatar_url: "", show_on_home: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) {
      alert("Preencha nome e conteúdo.");
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        const { error } = await supabase.from("testimonials").update(form).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert([form]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apagar depoimento permanentemente?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const toggleHome = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("testimonials").update({ show_on_home: !current }).eq("id", id);
      if (error) throw error;
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, show_on_home: !current } : t));
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const openNewForm = () => {
    setForm({ name: "", role: "", content: "", avatar_url: "", show_on_home: true });
    setIsModalOpen(true);
  };

  const openEditForm = (t: Testimonial) => {
    setForm(t);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depoimentos / Feedbacks</h1>
          <p className="text-gray-500">Avalanche de clientes e parceiros para exibir no site</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Depoimento
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      ) : loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              Nenhum depoimento cadastrado.
            </div>
          ) : testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col relative shadow-sm">
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => openEditForm(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4"/></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4"/></button>
              </div>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                {t.avatar_url ? (
                  <img src={t.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{t.name}</h3>
                  <p className="text-xs text-gray-500">{t.role || "Cliente"}</p>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm italic mb-6 flex-1">"{t.content}"</p>
              
              <div className="pt-4 border-t flex justify-between items-center text-sm">
                <span className="text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`${t.show_on_home ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Visível na Home</span>
                  <input type="checkbox" checked={t.show_on_home} onChange={() => toggleHome(t.id, t.show_on_home)} className="rounded text-blue-600" />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{form.id ? "Editar" : "Novo"} Depoimento</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600 outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Cargo / Empresa (Opcional)</label>
                  <input type="text" value={form.role || ""} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600 outline-none" placeholder="Ex: Síndico, ou Diretor da Empresa X" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Depoimento *</label>
                <textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-600 outline-none resize-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Foto do Perfil (Avatar)</label>
                <div className="flex items-center gap-4">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} className="h-12 w-12 rounded-full object-cover border" />
                  ) : <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center"><User className="text-gray-400 h-6 w-6" /></div>}
                  <button type="button" onClick={() => setShowImagePicker(true)} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Escolher / Enviar Foto
                  </button>
                  {form.avatar_url && (
                    <button type="button" onClick={() => setForm({...form, avatar_url: ""})} className="text-red-500 text-sm hover:underline">Remover</button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center">
                  {saving && <Loader2 className="animate-spin h-4 w-4" />} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImagePicker && (
        <ImagePicker 
          onClose={() => setShowImagePicker(false)}
          onSelect={({url}) => {
            setForm({...form, avatar_url: url});
            setShowImagePicker(false);
          }}
        />
      )}
    </div>
  );
}
