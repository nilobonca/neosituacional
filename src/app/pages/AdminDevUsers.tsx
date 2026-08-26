import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  KeyRound, 
  Send, 
  Shield, 
  Terminal, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Clock, 
  Mail,
  ShieldCheck,
  Calendar,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  role: "dev" | "admin" | "sindico" | string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export function AdminDevUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal de Troca Direta de Senha
  const [passwordModalUser, setPasswordModalUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);

  // Modal de Alteração de Cargo
  const [roleModalUser, setRoleModalUser] = useState<SystemUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>("sindico");
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Estado de envio de link de recuperação
  const [sendingResetForEmail, setSendingResetForEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: rpcError } = await supabase.rpc("dev_list_all_users");

      if (rpcError) throw rpcError;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err);
      setError(err.message || "Erro ao carregar usuários. Verifique se o seu usuário possui a role 'dev'.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async (userEmail: string) => {
    try {
      setSendingResetForEmail(userEmail);
      setError(null);
      setSuccessMsg(null);

      const redirectTo = `${window.location.origin}/area-cliente/redefinir-senha`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo
      });

      if (resetErr) throw resetErr;

      setSuccessMsg(`Link de redefinição enviado com sucesso para ${userEmail}!`);
    } catch (err: any) {
      console.error("Erro ao enviar link de redefinição:", err);
      setError(err.message || "Erro ao enviar e-mail de redefinição.");
    } finally {
      setSendingResetForEmail(null);
    }
  };

  const handleChangePasswordDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword) return;

    if (newPassword.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    try {
      setPasswordChanging(true);
      setError(null);
      setSuccessMsg(null);

      const { data, error: rpcError } = await supabase.rpc("dev_change_user_password", {
        target_user_id: passwordModalUser.id,
        new_password: newPassword
      });

      if (rpcError) throw rpcError;

      setSuccessMsg(`Senha alterada com sucesso diretamente no banco para ${passwordModalUser.email}!`);
      setPasswordModalUser(null);
      setNewPassword("");
    } catch (err: any) {
      console.error("Erro ao trocar senha:", err);
      setError(err.message || "Erro ao trocar senha do usuário.");
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;

    try {
      setRoleUpdating(true);
      setError(null);
      setSuccessMsg(null);

      const { error: rpcError } = await supabase.rpc("dev_update_user_role", {
        target_user_id: roleModalUser.id,
        new_role: selectedNewRole
      });

      if (rpcError) throw rpcError;

      setSuccessMsg(`Cargo de ${roleModalUser.email} atualizado para ${selectedNewRole.toUpperCase()}!`);
      setRoleModalUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error("Erro ao atualizar cargo:", err);
      setError(err.message || "Erro ao atualizar cargo do usuário.");
    } finally {
      setRoleUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "dev":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-xs">
            <Terminal className="w-3.5 h-3.5" />
            DEV (Superadmin)
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN
          </span>
        );
      case "sindico":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            SÍNDICO
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header com estilo DEV */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-600/30 text-purple-300 rounded-xl border border-purple-500/30">
                <Terminal className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Painel Superadmin DEV
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-montserrat tracking-tight text-white">
              Gestão de Usuários & Senhas
            </h1>
            <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
              Autorização exclusiva DEV para alteração direta de senhas no banco, envio de links de recuperação e gerenciamento de permissões para Usuários e Administradores.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-200 bg-purple-900/40 border border-purple-700/50 rounded-xl hover:bg-purple-800/50 transition-all self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar Lista
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Aviso</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Sucesso</p>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por e-mail ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Todos" },
            { id: "dev", label: "Devs" },
            { id: "admin", label: "Admins" },
            { id: "sindico", label: "Síndicos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRoleFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 font-montserrat">Usuários do Sistema</h2>
            <p className="text-xs text-gray-500">
              Total de {filteredUsers.length} {filteredUsers.length === 1 ? "usuário encontrado" : "usuários encontrados"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm font-medium">Carregando contas do sistema...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Tente ajustar o termo de busca ou o filtro de cargo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Usuário / E-mail</th>
                  <th className="px-6 py-3.5">Cargo</th>
                  <th className="px-6 py-3.5">Data de Criação</th>
                  <th className="px-6 py-3.5">Último Acesso</th>
                  <th className="px-6 py-3.5 text-right">Ações Exclusivas DEV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {user.full_name || "Sem nome cadastrado"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {user.last_sign_in_at ? (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          {format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Nunca acessou</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Botão 1: Trocar Senha Diretamente */}
                        <button
                          onClick={() => {
                            setPasswordModalUser(user);
                            setNewPassword("");
                          }}
                          title="Alterar senha diretamente no banco"
                          className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 flex items-center gap-1 shadow-2xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Mudar Senha</span>
                        </button>

                        {/* Botão 2: Enviar Link de Recuperação */}
                        <button
                          onClick={() => handleSendPasswordResetEmail(user.email)}
                          disabled={sendingResetForEmail === user.email}
                          title="Disparar e-mail com link de redefinição de senha"
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 flex items-center gap-1 shadow-2xs disabled:opacity-50"
                        >
                          {sendingResetForEmail === user.email ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Mandar Link</span>
                        </button>

                        {/* Botão 3: Alterar Cargo */}
                        <button
                          onClick={() => {
                            setRoleModalUser(user);
                            setSelectedNewRole(user.role || "sindico");
                          }}
                          title="Alterar cargo do usuário"
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: MUDAR SENHA DIRETAMENTE */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <KeyRound className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-montserrat">Alterar Senha Diretamente</h3>
                  <p className="text-xs text-purple-200">Permissão Exclusiva DEV</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordDirectly} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-900">
                <p className="font-semibold">{passwordModalUser.full_name || "Usuário"}</p>
                <p className="font-mono text-purple-700">{passwordModalUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  A nova senha será criptografada com <strong>Bcrypt</strong> e gravada diretamente no banco de dados. O usuário poderá logar imediatamente com esta senha.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordChanging || newPassword.length < 6}
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordChanging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gravando no Banco...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Aplicar Nova Senha
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALTERAR CARGO */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-montserrat">Alterar Cargo da Conta</h3>
                  <p className="text-xs text-slate-300">Controle de Permissões</p>
                </div>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900">
                <p className="font-semibold">{roleModalUser.full_name || "Usuário"}</p>
                <p className="font-mono text-slate-600">{roleModalUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Selecione o Novo Cargo
                </label>
                <div className="space-y-2">
                  {[
                    { id: "sindico", label: "Síndico", desc: "Acesso à Área do Cliente e Fornecedores" },
                    { id: "admin", label: "Administrador", desc: "Gestão do site, blogs, propostas e imóveis" },
                    { id: "dev", label: "DEV (Superadmin)", desc: "Acesso total irrestrito + alteração de senhas" },
                  ].map((roleOpt) => (
                    <label
                      key={roleOpt.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedNewRole === roleOpt.id
                          ? "border-purple-600 bg-purple-50/50 shadow-xs"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleOpt.id}
                        checked={selectedNewRole === roleOpt.id}
                        onChange={(e) => setSelectedNewRole(e.target.value)}
                        className="mt-1 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{roleOpt.label}</p>
                        <p className="text-xs text-gray-500">{roleOpt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={roleUpdating}
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {roleUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Salvar Cargo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
