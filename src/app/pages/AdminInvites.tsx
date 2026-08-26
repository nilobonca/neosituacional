import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  UserPlus, 
  Mail, 
  Clock, 
  Copy, 
  Check, 
  Ban, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminInvite {
  id: string;
  email: string;
  token: string;
  status: "pending" | "used" | "revoked" | "expired";
  invited_by: string | null;
  used_by: string | null;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export function AdminInvites() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [hoursValid, setHoursValid] = useState("48");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newlyCreatedLink, setNewlyCreatedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setInvites(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar convites:", err);
      setError(err.message || "Erro ao carregar lista de convites.");
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/admin/convite?token=${encodeURIComponent(token)}`;
  };

  const handleCopyLink = async (token: string) => {
    const url = getInviteUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 3000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setCreating(true);
      setError(null);
      setSuccessMsg(null);
      setNewlyCreatedLink(null);

      const { data, error: rpcError } = await supabase.rpc("create_admin_invite", {
        target_email: email.trim().toLowerCase(),
        hours_valid: parseInt(hoursValid, 10) || 48
      });

      if (rpcError) throw rpcError;

      if (data && data.token) {
        const inviteUrl = getInviteUrl(data.token);
        setNewlyCreatedLink(inviteUrl);
        setSuccessMsg(`Convite gerado com sucesso para ${email}!`);
        setEmail("");
        fetchInvites();
      }
    } catch (err: any) {
      console.error("Erro ao criar convite:", err);
      setError(err.message || "Erro ao gerar convite de administrador.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm("Tem certeza que deseja cancelar e revogar este convite? O link deixará de funcionar imediatamente.")) {
      return;
    }

    try {
      const { error: revokeErr } = await supabase.rpc("revoke_admin_invite", {
        invite_id: inviteId
      });

      if (revokeErr) throw revokeErr;

      setSuccessMsg("Convite cancelado com sucesso.");
      fetchInvites();
    } catch (err: any) {
      console.error("Erro ao revogar convite:", err);
      setError(err.message || "Erro ao revogar convite.");
    }
  };

  const getStatusBadge = (status: AdminInvite["status"], expiresAt: string) => {
    const isExpired = new Date(expiresAt).getTime() < Date.now();
    const effectiveStatus = (status === "pending" && isExpired) ? "expired" : status;

    switch (effectiveStatus) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendente (Uso Único)
          </span>
        );
      case "used":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Utilizado
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Expirado
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Convites de Administrador</h1>
              <p className="text-sm text-gray-500">
                Gere links com tokens JWT criptografados de uso único para convidar novos administradores.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchInvites}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erro</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Sucesso</p>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {/* Box de Convite Recém-Criado */}
      {newlyCreatedLink && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Link de Convite Gerado com Sucesso!
          </div>
          <p className="text-xs text-blue-700 mb-4">
            Envie este link para o novo administrador. Ele é protegido por JWT e será invalidado automaticamente no banco de dados após o primeiro uso.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              readOnly
              value={newlyCreatedLink}
              className="flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm font-mono text-gray-700 select-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(newlyCreatedLink);
                setCopiedToken(newlyCreatedLink);
                setTimeout(() => setCopiedToken(null), 3000);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0"
            >
              {copiedToken === newlyCreatedLink ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Formulário para Gerar Novo Convite */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 font-montserrat">Gerar Novo Convite de Administrador</h2>
          </div>
        </div>

        <form onSubmit={handleCreateInvite} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                E-mail do Novo Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="exemplo@situacional.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Validade do Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Clock className="w-4 h-4" />
                </div>
                <select
                  value={hoursValid}
                  onChange={(e) => setHoursValid(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all appearance-none"
                >
                  <option value="24">24 horas</option>
                  <option value="48">48 horas (Padrão)</option>
                  <option value="72">72 horas (3 dias)</option>
                  <option value="168">7 dias</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating || !email}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Gerar Convite
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            * O token gerado concede permissões completas de <strong>Admin</strong> no painel e é estritamente de <strong>uso único</strong>.
          </p>
        </form>
      </div>

      {/* Histórico e Tabela de Convites */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 font-montserrat">Histórico de Convites Emitidos</h2>
            <p className="text-xs text-gray-500">Acompanhe quais links já foram utilizados, estão pendentes ou expiraram.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200/70 text-gray-700 rounded-lg">
            {invites.length} {invites.length === 1 ? "convite" : "convites"}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Carregando convites...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Nenhum convite emitido até o momento</p>
            <p className="text-sm text-gray-500 mt-1">Utilize o formulário acima para gerar o primeiro convite de administrador.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">E-mail Convidado</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Criação</th>
                  <th className="px-6 py-3.5">Expiração</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invites.map((invite) => {
                  const isExpired = new Date(invite.expires_at).getTime() < Date.now();
                  const isPending = invite.status === "pending" && !isExpired;

                  return (
                    <tr key={invite.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{invite.email}</span>
                        </div>
                        {invite.used_at && (
                          <span className="text-[11px] text-emerald-600 block mt-0.5">
                            Utilizado em: {format(new Date(invite.used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invite.status, invite.expires_at)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(invite.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(invite.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleCopyLink(invite.token)}
                                title="Copiar link do convite"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex items-center gap-1.5 text-xs font-medium"
                              >
                                {copiedToken === invite.token ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-green-600">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar Link</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRevokeInvite(invite.id)}
                                title="Cancelar e revogar este convite"
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {!isPending && (
                            <span className="text-xs text-gray-400 italic">Sem ações</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
