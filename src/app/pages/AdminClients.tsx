import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon } from "lucide-react";
import { ImagePicker } from "../components/ImagePicker";

interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  active: boolean;
  created_at: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({ name: "", logo_url: "", website_url: "", active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.logo_url) {
      alert("Preencha nome e adicione a logo.");
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        // Atualiza
        const { error } = await supabase.from("clients").update(form).eq("id", form.id);
        if (error) throw error;
      } else {
        // Insere
        const { error } = await supabase.from("clients").insert([form]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja apagar o cliente "${name}"?`)) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      setClients(clients.filter(c => c.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("clients").update({ active: !current }).eq("id", id);
      if (error) throw error;
      setClients(clients.map(c => c.id === id ? { ...c, active: !current } : c));
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const openNewForm = () => {
    setForm({ name: "", logo_url: "", website_url: "", active: true });
    setIsModalOpen(true);
  };

  const openEditForm = (client: Client) => {
    setForm(client);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes & Parceiros</h1>
          <p className="text-gray-500">Gerencie as logos que aparecem na home</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      ) : loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Logo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</td></tr>
              ) : clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img src={client.logo_url} alt={client.name} className="h-10 w-auto max-w-[120px] object-contain bg-white rounded border border-gray-200 p-1" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(client.id, client.active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${client.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {client.active ? "Visível" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    <button onClick={() => openEditForm(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(client.id, client.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{form.id ? "Editar Cliente" : "Novo Cliente"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente / Empresa</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site / Link do Parceiro (Opcional)</label>
                <input 
                  type="url" 
                  value={form.website_url || ""} 
                  onChange={e => setForm({...form, website_url: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="https://exemplo.com.br"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo</label>
                <div className="flex items-center gap-4">
                  {form.logo_url ? (
                    <img src={form.logo_url} className="h-16 w-max object-contain border rounded p-1" />
                  ) : <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}
                  <button type="button" onClick={() => setShowImagePicker(true)} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-blue-500 hover:text-white">
                    Escolher / Enviar Logo
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="activeCheck" 
                  checked={form.active} 
                  onChange={e => setForm({...form, active: e.target.checked})} 
                />
                <label htmlFor="activeCheck" className="text-sm font-medium">Mostrar logotipo publicamente no site</label>
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
            setForm({...form, logo_url: url});
            setShowImagePicker(false);
          }}
        />
      )}
    </div>
  );
}
