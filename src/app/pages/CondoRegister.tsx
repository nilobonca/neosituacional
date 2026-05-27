import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, AlertCircle, ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { Toast } from "../components/Toast";

export function CondoRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === "User already registered" ? "Este e-mail já está cadastrado." : "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    if (data.user) {
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
          Cadastro de Síndico
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crie a conta para acessar o painel do seu condomínio.
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
                Conta criada com sucesso!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Seu cadastro foi realizado. Agora você pode fazer o login no painel para acessar a rede de prestadores.
                </p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/area-cliente/login")}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Ir para o Login
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email || !password || !confirmPassword}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Criando conta..." : "Criar Conta de Síndico"}
                </button>
              </div>
            </form>
          )}
          
          {!success && (
            <div className="mt-8 text-center border-t border-gray-100 pt-6 flex flex-col gap-3">
              <Link to="/area-cliente/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Já possui uma conta? Faça Login
              </Link>
              <Link to="/" className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o site principal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
