import { useState, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, UploadCloud, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Toast } from "../components/Toast";

export function Careers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!name || !email || !department || !file) {
      setError("Por favor, preencha todos os campos e anexe seu currículo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload do arquivo para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const filePath = `curriculos/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Erro ao enviar o arquivo. Tente novamente mais tarde.");
      }

      // 2. Obter a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      // 3. Salvar os dados na tabela job_applications
      const { error: dbError } = await supabase
        .from("job_applications")
        .insert([
          {
            name,
            email,
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
          className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">Candidatura Enviada!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Obrigado pelo interesse em trabalhar na Situacional, {name.split(' ')[0]}! 
            Recebemos seu currículo com sucesso e nossa equipe entrará em contato se houver alguma oportunidade adequada ao seu perfil.
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
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <div className="mb-8 flex items-center">
        <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 md:p-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat tracking-tight">Trabalhe Conosco</h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Envie seu currículo e venha crescer com a Situacional.
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
                <option value="Vendas">Vendas</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-gray-700">
                Anexar Currículo (PDF) <span className="text-red-500 ml-0.5">*</span>
              </label>
              
              {!file ? (
                <div 
                  className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                      <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                        Clique para selecionar um arquivo
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-gray-500 mt-2">Apenas PDF. Máximo de 5MB.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !file || !name || !email || !department}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando currículo...
                  </span>
                ) : (
                  "Enviar Candidatura"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
