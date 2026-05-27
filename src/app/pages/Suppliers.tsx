import { useState, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, UploadCloud, ImageIcon, X, CheckCircle, AlertCircle, Info, Briefcase } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function Suppliers() {
  // Form State
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workOffered, setWorkOffered] = useState("");
  const [commonServices, setCommonServices] = useState("");
  const [averageValue, setAverageValue] = useState("");
  const [competeBudgets, setCompeteBudgets] = useState(false);

  // File State
  const [file, setFile] = useState<File | null>(null);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 10) {
      return raw.replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return raw.replace(/(\d{2})(\d)/, '($1) $2')
              .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`O arquivo excede o limite de 5MB.`);
      return;
    }
    
    setFile(selectedFile);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!companyName || !phone || !email || !workOffered || !commonServices || !averageValue) {
      setError("Por favor, preencha todos os campos de texto obrigatórios.");
      return false;
    }
    if (!file) {
      setError("Por favor, anexe a logo da sua empresa.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // 1. Upload Logo
      const { error: uploadError } = await supabase.storage
        .from("suppliers_logos")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Erro ao enviar o logotipo.`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("suppliers_logos")
        .getPublicUrl(filePath);

      // 2. Save data to database
      const { error: dbError } = await supabase
        .from("suppliers_applications")
        .insert([
          {
            company_name: companyName,
            phone,
            email,
            work_offered: workOffered,
            common_services: commonServices,
            average_value: averageValue,
            compete_budgets: competeBudgets,
            logo_url: publicUrlData.publicUrl,
            status: "new"
          }
        ]);

      if (dbError) {
        throw new Error("Erro ao registrar a solicitação. Tente novamente mais tarde.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div 
          className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">Cadastro Recebido!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Obrigado pelo interesse! Recebemos os dados da sua empresa <strong>{companyName}</strong> com sucesso.
            Nossa equipe avaliará o seu perfil e entraremos em contato.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="mb-8 flex items-center">
        <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#235487] to-blue-900 p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat tracking-tight">Fornecedores e Prestadores</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Cadastre sua empresa para fazer parte da nossa rede de parceiros e prestar serviços para nossos condomínios.
            </p>
          </div>
          <div className="hidden md:flex p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Briefcase className="w-16 h-16 text-blue-50" />
          </div>
        </div>

        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sessão 1: Dados da Empresa */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Dados Básicos da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome da Empresa <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Razão Social ou Nome Fantasia"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">E-mail para Contato <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Telefone para Contato <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sessão 2: Sobre os Serviços */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. Sobre o Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Qual trabalho oferece? <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={workOffered}
                    onChange={(e) => setWorkOffered(e.target.value)}
                    placeholder="Ex: Manutenção Elétrica, Jardinagem, Limpeza..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Tipo de serviços / produtos mais comuns <span className="text-red-500 ml-0.5">*</span></label>
                  <textarea
                    value={commonServices}
                    onChange={(e) => setCommonServices(e.target.value)}
                    placeholder="Descreva brevemente..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Valor Médio dos serviços / produtos <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={averageValue}
                    onChange={(e) => setAverageValue(e.target.value)}
                    placeholder="Ex: R$ 500,00 por visita, ou Contratos de R$ 2.000,00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sessão 3: Termos e Logo */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. Anexos e Permissões</h3>
              
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center h-6">
                  <input
                    id="competeBudgets"
                    type="checkbox"
                    checked={competeBudgets}
                    onChange={(e) => setCompeteBudgets(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <label htmlFor="competeBudgets" className="text-sm font-semibold text-gray-900 cursor-pointer select-none">
                    Quero disputar orçamentos dos condomínios
                  </label>
                  <div className="relative group flex items-center justify-center">
                    <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Ao concordar/ marcar a caixa você aceita que condominios mandem pedidos de orçamentos que vão ser avaliados juntos de outros prestadores de serviços para se obter a melhor opção.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-sm font-semibold text-gray-700">Pequena logo da empresa <span className="text-red-500 ml-0.5">*</span></label>
                
                {!file ? (
                  <div 
                    className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500">
                          Clique para selecionar a imagem
                        </span>
                      </div>
                      <p className="text-xs leading-5 text-gray-500 mt-1">PNG, JPG, WEBP até 5MB.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl max-w-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                      title="Remover imagem"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Envio */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando dados...
                  </span>
                ) : (
                  "Finalizar Cadastro"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
