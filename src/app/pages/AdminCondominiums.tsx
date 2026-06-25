import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Building } from "lucide-react";

interface Condominium {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export function AdminCondominiums() {
  const [condos, setCondos] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Condominium>>({ name: "", active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCondos();
  }, []);

  const fetchCondos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCondos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert("Preencha o nome do condomínio.");
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        const { error } = await supabase.from("condominiums").update(form).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("condominiums").insert([form]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchCondos();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja apagar o condomínio "${name}"? Isso pode afetar os síndicos e depoimentos vinculados a ele.`)) return;
    try {
      const { error } = await supabase.from("condominiums").delete().eq("id", id);
      if (error) throw error;
      setCondos(condos.filter(c => c.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("condominiums").update({ active: !current }).eq("id", id);
      if (error) throw error;
      setCondos(condos.map(c => c.id === id ? { ...c, active: !current } : c));
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const openNewForm = () => {
    setForm({ name: "", active: true });
    setIsModalOpen(true);
  };

  const openEditForm = (condo: Condominium) => {
    setForm(condo);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Condomínios (Clientes)</h1>
          <p className="text-gray-500">Cadastre os condomínios para uso nos formulários do site</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Condomínio
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome do Condomínio</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {condos.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhum condomínio cadastrado ainda.</td></tr>
              ) : condos.map(condo => (
                <tr key={condo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    {condo.name}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(condo.id, condo.active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${condo.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {condo.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    <button onClick={() => openEditForm(condo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(condo.id, condo.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{form.id ? "Editar Condomínio" : "Novo Condomínio"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Oficial do Condomínio *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="Ex: Condomínio Residencial Flores"
                  required 
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="activeCheck" 
                  checked={form.active} 
                  onChange={e => setForm({...form, active: e.target.checked})} 
                />
                <label htmlFor="activeCheck" className="text-sm font-medium">Disponível para seleção nos formulários</label>
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
    </div>
  );
}
