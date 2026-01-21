"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  Loader2,
  AlertCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Eye,
  X,
  Shield
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  businessType: string;
  stripeConnected: boolean;
  trialEndsAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string } | null;
  admins: Admin[];
  usersCount: number;
  subscriptionsCount: number;
}

interface PlatformStats {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    deleted: number;
  };
  users: { total: number };
  subscriptions: { total: number; active: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SuperadminPage() {
  const router = useRouter();
  const authStore = useAuthStore();
  
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Verificar autenticação no cliente
  useEffect(() => {
    // Tentar obter token do store ou localStorage
    let accessToken = authStore.accessToken;
    
    if (!accessToken) {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          accessToken = parsed?.state?.accessToken || null;
        }
      } catch (e) {
        // Silenciar erro
      }
    }
    
    if (!accessToken) {
      router.push("/app/login");
      return;
    }
    
    setToken(accessToken);
    setIsReady(true);
  }, []);
  
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal de admins
  const [adminsModal, setAdminsModal] = useState<{ open: boolean; tenant: Tenant | null }>({
    open: false,
    tenant: null,
  });
  
  // Modal de criar admin
  const [createAdminModal, setCreateAdminModal] = useState<{ open: boolean; tenantId: string | null }>({
    open: false,
    tenantId: null,
  });
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState("");

  const fetchData = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const [statsRes, tenantsRes] = await Promise.all([
        fetch(`${API_URL}/superadmin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/superadmin/tenants?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.status === 403 || tenantsRes.status === 403) {
        setError("Acesso negado. Você não tem permissão de superadmin.");
        setLoading(false);
        return;
      }

      if (statsRes.status === 401 || tenantsRes.status === 401) {
        authStore.logout();
        router.push("/app/login");
        return;
      }

      if (!statsRes.ok || !tenantsRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const statsData = await statsRes.json();
      const tenantsData = await tenantsRes.json();

      setStats(statsData);
      setTenants(tenantsData.tenants);
      setPagination(tenantsData.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady || !token) return;
    fetchData();
  }, [isReady, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const handleAction = async (tenantId: string, action: "suspend" | "reactivate" | "delete" | "restore") => {
    setActionLoading(tenantId);
    setActionMenu(null);

    try {
      const endpoint = action === "delete" 
        ? `${API_URL}/superadmin/tenants/${tenantId}`
        : `${API_URL}/superadmin/tenants/${tenantId}/${action}`;
      
      const method = action === "delete" ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao executar ação");
      }

      // Recarregar dados
      fetchData(pagination.page);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createAdminModal.tenantId) return;
    
    setCreatingAdmin(true);
    setCreateAdminError("");

    try {
      const res = await fetch(`${API_URL}/superadmin/tenants/${createAdminModal.tenantId}/admins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdmin),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar admin");
      }

      // Fechar modal e recarregar dados
      setCreateAdminModal({ open: false, tenantId: null });
      setNewAdmin({ name: "", email: "", password: "" });
      fetchData(pagination.page);
    } catch (err: any) {
      setCreateAdminError(err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const openCreateAdminModal = (tenantId: string) => {
    setCreateAdminModal({ open: true, tenantId });
    setNewAdmin({ name: "", email: "", password: "" });
    setCreateAdminError("");
    setActionMenu(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      TRIAL: "bg-blue-100 text-blue-700",
      SUSPENDED: "bg-yellow-100 text-yellow-700",
      CANCELED: "bg-gray-100 text-gray-700",
      DELETED: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Ativo",
      TRIAL: "Trial",
      SUSPENDED: "Suspenso",
      CANCELED: "Cancelado",
      DELETED: "Excluído",
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Mostrar loading enquanto verifica autenticação
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              Superadmin
            </span>
          </div>
          <button 
            onClick={() => { authStore.logout(); router.push("/app/login"); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Total Tenants</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stats.tenants.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-500">Ativos</span>
              </div>
              <p className="text-2xl font-semibold text-green-600">{stats.tenants.active}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-500">Trial</span>
              </div>
              <p className="text-2xl font-semibold text-blue-600">{stats.tenants.trial}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Usuários</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Assinaturas</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stats.subscriptions.active}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="TRIAL">Trial</option>
                <option value="SUSPENDED">Suspensos</option>
                <option value="DELETED">Excluídos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Nenhum tenant encontrado
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usuários</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assinaturas</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">/t/{tenant.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.owner ? (
                        <div>
                          <p className="text-sm text-gray-900">{tenant.owner.name}</p>
                          <p className="text-xs text-gray-500">{tenant.owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.usersCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.subscriptionsCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenu(actionMenu === tenant.id ? null : tenant.id)}
                          disabled={actionLoading === tenant.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {actionLoading === tenant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        
                        {actionMenu === tenant.id && (
                          <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                            {/* Ver admins */}
                            <button
                              onClick={() => { setAdminsModal({ open: true, tenant }); setActionMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                              Ver admins ({tenant.admins?.length || 0})
                            </button>
                            {/* Criar admin */}
                            <button
                              onClick={() => openCreateAdminModal(tenant.id)}
                              className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2 border-b border-gray-100"
                            >
                              <UserPlus className="w-4 h-4" />
                              Criar admin
                            </button>
                            {tenant.status !== "SUSPENDED" && tenant.status !== "DELETED" && (
                              <button
                                onClick={() => handleAction(tenant.id, "suspend")}
                                className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                              >
                                <Pause className="w-4 h-4" />
                                Suspender
                              </button>
                            )}
                            {tenant.status === "SUSPENDED" && (
                              <button
                                onClick={() => handleAction(tenant.id, "reactivate")}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Reativar
                              </button>
                            )}
                            {tenant.status === "DELETED" && (
                              <button
                                onClick={() => handleAction(tenant.id, "restore")}
                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Restaurar
                              </button>
                            )}
                            {tenant.status !== "DELETED" && (
                              <button
                                onClick={() => handleAction(tenant.id, "delete")}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchData(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Admins */}
      {adminsModal.open && adminsModal.tenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Admins de {adminsModal.tenant.name}
                  </h3>
                  <p className="text-sm text-gray-500">/t/{adminsModal.tenant.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setAdminsModal({ open: false, tenant: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {adminsModal.tenant.admins && adminsModal.tenant.admins.length > 0 ? (
                adminsModal.tenant.admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{admin.name}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {admin.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum admin encontrado</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdminsModal({ open: false, tenant: null })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  openCreateAdminModal(adminsModal.tenant!.id);
                  setAdminsModal({ open: false, tenant: null });
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Criar admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Admin */}
      {createAdminModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-lg text-gray-900">
                  Criar Admin
                </h3>
              </div>
              <button
                onClick={() => setCreateAdminModal({ open: false, tenantId: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Nome do admin"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Senha inicial"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>

              {createAdminError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createAdminError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreateAdminModal({ open: false, tenantId: null })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={creatingAdmin || !newAdmin.name || !newAdmin.email || !newAdmin.password}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center gap-2"
              >
                {creatingAdmin ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Criar admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
