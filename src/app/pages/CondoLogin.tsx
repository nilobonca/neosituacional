import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, AlertCircle, ArrowLeft, Building2 } from "lucide-react";

export function CondoLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verifica a role para saber para onde mandar
        const { data: roleData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (roleData?.role === "admin") {
          navigate("/admin");
        } else if (roleData?.role === "sindico") {
          navigate("/area-cliente");
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.session) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Após o login, verifica a role
    const { data: roleData, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .single();

    if (roleError || !roleData) {
      setError("Conta não possui acesso configurado no sistema.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (roleData.role === "sindico") {
      navigate("/area-cliente");
    } else if (roleData.role === "admin") {
      navigate("/admin");
    } else {
      setError("Acesso negado para este tipo de conta.");
      await supabase.auth.signOut();
      setLoading(false);
    }
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
          Área do Síndico
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acesse o painel exclusivo do seu condomínio.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
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
              <div className="flex items-center justify-end mt-2">
                <div className="text-sm">
                  <Link to="/area-cliente/esqueci-senha" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    Esqueci minha senha?
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Autenticando..." : "Entrar no Painel"}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6 flex flex-col gap-3">
            <Link to="/area-cliente/cadastro" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Ainda não tem conta? Cadastre seu condomínio
            </Link>
            <Link to="/" className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o site principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
