import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, UploadCloud, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Toast } from "../components/Toast";
import { useSiteSettings, CareersSettings, defaultCareersSettings } from "../hooks/useSiteSettings";

export function Careers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { fetchCareersSettings } = useSiteSettings();
  const [settings, setSettings] = useState<CareersSettings>(defaultCareersSettings);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchCareersSettings();
      if (data) {
        setSettings(data);
      }
    };
    loadSettings();
  }, [fetchCareersSettings]);

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

    if (selectedFile.type !== "application/pdf") {
      setError("Por favor, selecione apenas arquivos no formato PDF.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("O arquivo selecionado excede o limite de 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !department || !file) {
      setError("Por favor, preencha todos os campos e anexe seu currículo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const filePath = `curriculos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Erro ao enviar o arquivo. Tente novamente mais tarde.");
      }
      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);
      const { error: dbError } = await supabase
        .from("job_applications")
        .insert([
          {
            name,
            email,
            phone,
            department,
            resume_url: publicUrlData.publicUrl,
            status: "new"
          }
        ]);

      if (dbError) {
        throw new Error("Erro ao registrar a candidatura. Tente novamente mais tarde.");
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
          className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
            {settings.successTitle || "Candidatura Enviada!"}
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {settings.successMessage || defaultCareersSettings.successMessage}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white border border-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <div className="mb-8 flex items-center">
        <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 md:p-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat tracking-tight">
            {settings.headerTitle || "Trabalhe Conosco"}
          </h1>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            {settings.headerSubtitle || defaultCareersSettings.headerSubtitle}
          </p>
        </div>

        <div className="p-8 md:p-12">
          <Toast message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Nome Completo <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  E-mail Profissional <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Celular / WhatsApp <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-semibold text-gray-700">
                Área de Interesse <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                required
              >
                <option value="" disabled>Selecione um departamento</option>
                <option value="Departamento Pessoal">Departamento Pessoal</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Condomínio">Condomínio</option>
                <option value="Jurídico">Jurídico</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-gray-700">
                {settings.instructionsTitle || "Anexar Currículo (PDF)"} <span className="text-red-500 ml-0.5">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {settings.instructionsText || defaultCareersSettings.instructionsText}
              </p>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-blue-600 group-hover:underline">Clique para selecionar</span> ou arraste o arquivo aqui
                    <p className="text-xs text-gray-500 mt-1">Apenas formato PDF (máx. 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-montserrat"
            >
              {isSubmitting ? (
                <>Enviando Currículo...</>
              ) : (
                <>Enviar Candidatura</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
