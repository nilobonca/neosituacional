import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  XCircle,
  Clock
} from "lucide-react";
import logo from "../../graphics/logo.svg";

export function AdminAcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setLoading(false);
      setIsValid(false);
      setInvalidReason("Nenhum token de convite foi informado na URL.");
      return;
    }

    try {
      setLoading(true);
      setInvalidReason(null);

      // Chamar RPC segura no Supabase para validar assinatura, status no banco e expiração
      const { data, error } = await supabase.rpc("validate_admin_invite", {
        token_jwt: token
      });

      if (error) throw error;

      if (data && data.valid) {
        setIsValid(true);
        setInviteEmail(data.email || "");
        setExpiresAt(data.expires_at || null);
      } else {
        setIsValid(false);
        setInvalidReason(data?.reason || "Convite inválido ou expirado.");
      }
    } catch (err: any) {
      console.error("Erro ao validar convite:", err);
      setIsValid(false);
      setInvalidReason(err.message || "Erro ao consultar a validade do convite.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Por favor, informe seu nome completo.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("As senhas informadas não coincidem.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Tentar criar o usuário pelo Supabase Auth (se não existir)
      let userId: string | null = null;
      try {
        const { data: signUpData } = await supabase.auth.signUp({
          email: inviteEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (signUpData?.user?.id) {
          userId = signUpData.user.id;
        }
      } catch (clientAuthErr) {
        console.warn("SignUp no cliente falhou, criando diretamente via RPC:", clientAuthErr);
      }

      // 2. Chamar RPC atômica que consome o convite, cria/atualiza o usuário, confirma o e-mail, grava a senha com bcrypt e eleva para 'admin'
      const { data: acceptData, error: acceptError } = await supabase.rpc("accept_admin_invite", {
        token_jwt: token,
        target_user_id: userId,
        target_full_name: fullName.trim(),
        user_password: password
      });

      if (acceptError) {
        throw acceptError;
      }

      // 3. Fazer login imediato com a senha configurada
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: inviteEmail,
        password: password
      });

      if (signInError) {
        console.warn("Aviso na autenticação pós-ativação:", signInError);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 2000);

    } catch (err: any) {
      console.error("Erro ao aceitar convite:", err);
      setFormError(err.message || "Erro ao processar o aceite do convite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Detalhes de Fundo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
            <img src={logo} alt="Logo" className="h-7 w-auto bg-white rounded p-1" />
            <span className="font-montserrat font-bold text-white tracking-wider text-base">
              SITUACIONAL <span className="text-blue-400 font-semibold">ADMIN</span>
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white font-montserrat tracking-tight">
          Convite de Administrador
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Ativação de credencial e acesso restrito ao painel de gestão.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          
          {/* ESTADO 1: CARREGANDO E VALIDANDO */}
          {loading && (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-base font-semibold text-gray-800">Validando Token de Convite...</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Verificando a assinatura digital e o estado do convite no banco de dados.
              </p>
            </div>
          )}

          {/* ESTADO 2: TOKEN INVÁLIDO / JÁ UTILIZADO / EXPIRADO */}
          {!loading && !isValid && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-100 text-rose-600">
                <XCircle className="h-9 w-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-montserrat">
                  Convite Inválido ou Já Utilizado
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {invalidReason || "Este link de convite não é mais válido, já foi utilizado anteriormente ou expirou."}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Por motivos de segurança, cada link de convite é de <strong>uso único</strong>. Caso precise de acesso, solicite um novo convite ao administrador.
                </span>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
                >
                  Ir para o Login de Administrador
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* ESTADO 3: SUCESSO AO ATIVAR */}
          {!loading && isValid && success && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-montserrat">
                Conta de Administrador Ativada!
              </h3>
              <p className="text-sm text-gray-600">
                O convite foi consumido com sucesso e seu acesso de administrador foi configurado. Redirecionando para o painel...
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          )}

          {/* ESTADO 4: FORMULÁRIO DE CADASTRO (CONVITE VÁLIDO) */}
          {!loading && isValid && !success && (
            <form onSubmit={handleRegister} className="space-y-5">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-950">Convite Confirmado</p>
                  <p className="text-[11px] text-blue-700">Acesso de Administrador Garantido</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  E-mail Convidado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={inviteEmail}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Criar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha criada"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Ativando Conta de Administrador...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Criar Conta e Acessar Painel
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/admin/login" className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
                  Já possui uma conta configurada? Faça Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
