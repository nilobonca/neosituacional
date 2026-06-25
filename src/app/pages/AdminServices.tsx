import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { useServices, ServiceItem } from "../hooks/useServices";
import * as Icons from "lucide-react";

export function AdminServices() {
  const { services, loading, fetchServices, addService, updateService, deleteService } = useServices();
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const availableIcons = ["Wallet", "Scale", "Wrench", "MessageSquare", "Users", "Shield", "Building", "Briefcase", "CheckCircle", "FileText", "Home", "Key", "Star"];

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (service: ServiceItem) => {
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentService({
      title: "",
      description: "",
      icon: "Star",
      features: [""],
      active: true,
      order_index: services.length + 1
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;

    setSaving(true);
    try {
      const cleanFeatures = (currentService.features || []).filter(f => f.trim() !== "");
      const dataToSave = { ...currentService, features: cleanFeatures };

      if (currentService.id) {
        await updateService(currentService.id, dataToSave);
      } else {
        await addService(dataToSave as any);
      }
      setIsEditing(false);
      setCurrentService(null);
    } catch (err) {
      alert("Erro ao salvar o serviço.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Você tem certeza que quer excluir este serviço permanentemente? Ele vai sumir do site.")) {
      await deleteService(id);
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    await updateService(service.id, { active: !service.active });
  };

  const addFeature = () => {
    if (currentService) {
      setCurrentService({
        ...currentService,
        features: [...(currentService.features || []), ""]
      });
    }
  };

  const updateFeature = (index: number, value: string) => {
    if (currentService && currentService.features) {
      const newFeatures = [...currentService.features];
      newFeatures[index] = value;
      setCurrentService({ ...currentService, features: newFeatures });
    }
  };

  const removeFeature = (index: number) => {
    if (currentService && currentService.features) {
      setCurrentService({
        ...currentService,
        features: currentService.features.filter((_, i) => i !== index)
      });
    }
  };
  const renderIcon = (iconName: string, className = "h-5 w-5") => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent className={className} />;
  };

  if (loading && !isEditing && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <span className="ml-2 text-gray-500">Montando painel de serviços...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Serviços</h1>
          <p className="text-gray-500 text-sm mt-1">Crie os cartões de serviço que aparecem na tela principal.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Serviço
          </button>
        )}
      </div>

      {isEditing && currentService ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              {currentService.id ? "Editar Serviço" : "Criar Novo Serviço"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
                <input
                  type="text"
                  required
                  value={currentService.title || ""}
                  onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
                  placeholder="Ex: Gestão Financeira"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Breve</label>
                <textarea
                  required
                  rows={2}
                  value={currentService.description || ""}
                  onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone de Destaque</label>
                <div className="flex flex-wrap gap-3">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCurrentService({...currentService, icon})}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${currentService.icon === icon ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                      title={icon}
                    >
                      {renderIcon(icon, "h-6 w-6")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Tópicos (Lista do cartão)</label>
                 </div>
                 <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {currentService.features?.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="mt-2.5 text-gray-400">
                           <GripVertical className="h-4 w-4"/>
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(idx, e.target.value)}
                          placeholder="Ex: Emissão de boletos"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 mt-2">
                       <Plus className="h-4 w-4"/> Adicionar Tópico
                    </button>
                 </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-500"
              >
                {saving && <Loader2 className="animate-spin h-4 w-4" />}
                {saving ? "Salvando..." : "Salvar Serviço"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className={`bg-white rounded-lg shadow-sm border p-6 flex flex-col ${!service.active ? 'opacity-60 grayscale-[0.5]' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {renderIcon(service.icon)}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleToggleActive(service)}
                    className={`text-xs px-2 py-1.5 rounded-md font-medium ${service.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors mr-2`}
                    title={service.active ? "Desativar" : "Ativar"}
                  >
                    {service.active ? "Ativo no Site" : "Oculto"}
                  </button>
                  <button onClick={() => handleEdit(service)} className="p-1.5 text-gray-500 hover:bg-blue-500 hover:text-white rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(service.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{service.description}</p>
              
              <div className="border-t pt-3">
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tópicos Inclusos</p>
                 <ul className="text-sm text-gray-600 pl-4 list-disc space-y-1">
                    {service.features?.slice(0, 3).map((f, i) => (
                      <li key={i} className="line-clamp-1">{f}</li>
                    ))}
                    {service.features && service.features.length > 3 && (
                      <li className="text-gray-400 italic">e mais {service.features.length - 3}...</li>
                    )}
                 </ul>
              </div>
            </div>
          ))}

          {services.length === 0 && !loading && (
             <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                 <p className="text-gray-500 font-medium pb-2">Nenhum serviço cadastrado.</p>
                 <button onClick={handleAddNew} className="text-blue-600 hover:underline">Comece criando o primeiro!</button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
