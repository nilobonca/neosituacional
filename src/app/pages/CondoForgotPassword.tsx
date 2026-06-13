import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { Mail, ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { Toast } from "../components/Toast";

export function CondoForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get the current URL base for the redirect
    const redirectTo = `${window.location.origin}/area-cliente/redefinir-senha`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message === "User not found" 
        ? "Nenhuma conta encontrada com este e-mail." 
        : "Erro ao solicitar redefinição. Tente novamente.");
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-montserrat shadow-lg">
            <Building2 size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-montserrat tracking-tight">
          Recuperar Senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Informe seu e-mail para receber um link de redefinição.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <Toast message={error} onClose={() => setError(null)} />

          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 font-montserrat">
                E-mail enviado!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-4">
                  Se houver uma conta associada a <strong>{email}</strong>, 
                  você receberá um link seguro para criar uma nova senha. 
                  Verifique sua caixa de entrada e pasta de spam.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6 rounded-r-md text-left shadow-sm">
                  <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                    <strong>Atenção:</strong> O e-mail de recuperação pode chegar em nome do <strong>Supabase</strong>. Procure por este remetente na sua caixa de entrada se não o encontrar de imediato.
                  </p>
                </div>
                <Link
                  to="/area-cliente/login"
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold bg-blue-600 text-white border border-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="sindico@condominio.com.br"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-semibold bg-blue-600 text-white border border-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/area-cliente/login"
              className="font-medium text-sm text-blue-600 hover:text-blue-500 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
