import { useState, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, UploadCloud, FileText, X, CheckCircle, AlertCircle, Calculator } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Toast } from "../components/Toast";

export function Proposal() {
  // Form State
  const [document, setDocument] = useState("");
  const [condoName, setCondoName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [blocks, setBlocks] = useState("");
  const [apartments, setApartments] = useState("");
  const [houses, setHouses] = useState("");
  const [employees, setEmployees] = useState("");

  // Files State
  const [files, setFiles] = useState<File[]>([]);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting helpers
  const formatDocument = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 11) {
      // CPF: 000.000.000-00
      return raw.replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    // CNPJ: 00.000.000/0000-00
    return raw.replace(/(\d{2})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1/$2')
              .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

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
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Check total limit
    if (files.length + selectedFiles.length > 3) {
      setError("Você pode anexar no máximo 3 arquivos.");
      return;
    }

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (file.type !== "application/pdf") {
        setError("Por favor, selecione apenas arquivos no formato PDF.");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setError(`O arquivo ${file.name} excede o limite de 15MB.`);
        return;
      }
      
      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    if (!document || !condoName || !representativeName || !email || !phone || !employees) {
      setError("Por favor, preencha os dados básicos obrigatórios.");
      return false;
    }

    const aptCount = parseInt(apartments || "0", 10);
    const houseCount = parseInt(houses || "0", 10);

    if (aptCount === 0 && houseCount === 0) {
      setError("Você precisa informar a quantidade de apartamentos OU a quantidade de casas (maior que zero).");
      return false;
    }

    if (aptCount > 0 && (!blocks || parseInt(blocks, 10) === 0)) {
      setError("A quantidade de blocos é obrigatória e deve ser maior que zero quando há apartamentos.");
      return false;
    }

    if (files.length === 0 || files.length > 3) {
      setError("Você deve anexar de 1 a 3 arquivos (balancetes) do condomínio.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fileUrls: string[] = [];

      // 1. Upload multiple files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const cleanCondoName = condoName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const fileName = `${Date.now()}_${cleanCondoName}_doc${i+1}.${fileExt}`;
        const filePath = `balancetes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("proposals")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Erro ao enviar o arquivo ${file.name}.`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("proposals")
          .getPublicUrl(filePath);

        fileUrls.push(publicUrlData.publicUrl);
      }

      // 2. Save data to database
      const { error: dbError } = await supabase
        .from("commercial_proposals")
        .insert([
          {
            document,
            condominium_name: condoName,
            representative_name: representativeName,
            email,
            phone,
            blocks: parseInt(blocks || "0", 10),
            apartments: parseInt(apartments || "0", 10),
            houses: parseInt(houses || "0", 10),
            employees: parseInt(employees || "0", 10),
            files_urls: fileUrls, // Armazenando array JSON
            status: "new"
          }
        ]);

      if (dbError) {
        throw new Error("Erro ao registrar a solicitação de proposta. Tente novamente mais tarde.");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">Solicitação Recebida!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Obrigado pelo interesse, {representativeName.split(' ')[0]}! 
            Recebemos os dados do condomínio <strong>{condoName}</strong> com sucesso.
            Nossa equipe fará a análise dos arquivos e entrará em contato em breve para apresentar a melhor proposta.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white border border-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors shadow-sm"
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat tracking-tight">Proposta Comercial</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Preencha o formulário abaixo com os dados do seu condomínio para receber uma proposta personalizada da Situacional.
            </p>
          </div>
          <div className="hidden md:flex p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Calculator className="w-16 h-16 text-blue-50" />
          </div>
        </div>

        <div className="p-8 md:p-12">
          <Toast message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sessão 1: Dados do Condomínio / Contato */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">CNPJ ou CPF <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(formatDocument(e.target.value))}
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome do Condomínio <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={condoName}
                    onChange={(e) => setCondoName(e.target.value)}
                    placeholder="Residencial..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome do Representante (Síndico) <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">E-mail <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Celular / WhatsApp <span className="text-red-500 ml-0.5">*</span></label>
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

            {/* Sessão 2: Estrutura */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. Estrutura do Condomínio</h3>
              <p className="text-sm text-gray-500 mb-4">Atenção: É obrigatório informar a quantidade de casas OU apartamentos.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Qtd. de Blocos
                    {parseInt(apartments || "0", 10) > 0 && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={blocks}
                    onChange={(e) => setBlocks(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required={parseInt(apartments || "0", 10) > 0}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Qtd. Apartamentos <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={apartments}
                    onChange={(e) => setApartments(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border ${parseInt(apartments||"0") === 0 && parseInt(houses||"0") === 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Qtd. Casas <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={houses}
                    onChange={(e) => setHouses(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border ${parseInt(apartments||"0") === 0 && parseInt(houses||"0") === 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Qtd. Funcionários <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sessão 3: Arquivos */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. Arquivos para Análise</h3>
              <p className="font-medium text-blue-700 mb-2">Faça upload de 1 a 3 balancetes para análise. <span className="text-red-500 ml-0.5">*</span></p>
              
              <div className="space-y-4">
                {files.length < 3 && (
                  <div 
                    className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500">
                          Clique para selecionar
                        </span>
                        <span className="pl-1">arquivos PDF</span>
                      </div>
                      <p className="text-xs leading-5 text-gray-500 mt-2">Máximo de 15MB por arquivo. Restam {3 - files.length} arquivos.</p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />

                {files.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Arquivos anexados ({files.length}/3):</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold text-gray-900 truncate" title={file.name}>{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remover arquivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Envio */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-sm text-lg font-semibold bg-blue-600 text-white border border-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando proposta...
                  </span>
                ) : (
                  "Solicitar Proposta Comercial"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
