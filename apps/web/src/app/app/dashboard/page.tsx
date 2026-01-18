"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  ExternalLink, 
  Settings, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ArrowRight,
  LogOut,
  Loader2
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  businessType: string;
  stripeConnected: boolean;
  stripeOnboardingComplete: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  subscribersCount: number;
  mrr: number;
}

export default function AppDashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar autenticação
    if (!accessToken) {
      router.push("/app/login");
      return;
    }

    // Carregar tenants do usuário
    const fetchTenants = async () => {
      try {
        const res = await fetch(`${API_URL}/tenants/my`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          logout();
          router.push("/app/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Erro ao carregar clubes");
        }

        const data = await res.json();
        setTenants(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [accessToken, router, logout]);

  const handleLogout = () => {
    logout();
    router.push("/app/login");
  };

  return (
    <div className="min-h-screen bg-bgMain">
      {/* Header */}
      <header className="bg-white border-b border-faz-secondary/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-faz-primary" />
              <div className="w-2.5 h-2.5 rounded-full bg-faz-secondary" />
            </div>
            <span className="font-heading font-semibold text-lg tracking-tight text-txtMain uppercase">
              Fazumclube
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-txtMain/60">{user?.email || ""}</span>
            <button 
              onClick={handleLogout}
              className="text-txtMain/40 hover:text-txtMain transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-faz-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Welcome */}
            <div className="mb-10">
              <h1 className="font-heading font-semibold text-2xl text-txtMain mb-2">
                Olá, {user?.name?.split(" ")[0] || "Usuário"}!
              </h1>
              <p className="text-txtMain/60">
                Gerencie seus clubes de assinatura a partir deste painel.
              </p>
            </div>

            {/* Plan Status */}
            <div className="bg-white rounded-2xl border border-faz-secondary/20 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-faz-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-faz-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-txtMain/60">Seus clubes</p>
                    <p className="font-heading font-semibold text-lg text-txtMain">
                      {tenants.length} {tenants.length === 1 ? "clube" : "clubes"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/app/settings"
                  className="text-sm text-faz-secondary hover:text-faz-primary transition-colors flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
              </div>
            </div>

            {/* Clubs Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-xl text-txtMain">
                Seus Clubes
              </h2>
              <Link
                href="/app/signup"
                className="inline-flex items-center gap-2 bg-faz-primary hover:bg-faz-primary-hover text-txtMain px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar novo clube
              </Link>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white rounded-2xl border border-faz-secondary/20 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-faz-secondary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-faz-secondary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-txtMain">
                          {tenant.name}
                        </h3>
                        <p className="text-sm text-txtMain/50">/t/{tenant.slug}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        tenant.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : tenant.status === "TRIAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tenant.status === "ACTIVE" ? "Ativo" : tenant.status === "TRIAL" ? "Trial" : "Rascunho"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bgMain/50 rounded-xl p-3">
                      <p className="text-xs text-txtMain/50 mb-1">Assinantes</p>
                      <p className="font-heading font-semibold text-xl text-txtMain">
                        {tenant.subscribersCount}
                      </p>
                    </div>
                    <div className="bg-bgMain/50 rounded-xl p-3">
                      <p className="text-xs text-txtMain/50 mb-1">MRR</p>
                      <p className="font-heading font-semibold text-xl text-txtMain">
                        R$ {tenant.mrr.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Stripe Status */}
                  <div className="flex items-center gap-2 mb-6 text-sm">
                    {tenant.stripeConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Stripe conectado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-700">Stripe pendente</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/t/${tenant.slug}/admin`}
                      className="flex-1 bg-txtMain hover:bg-txtMain/90 text-white py-2.5 rounded-xl text-sm font-medium text-center transition-colors flex items-center justify-center gap-2"
                    >
                      Acessar admin
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/t/${tenant.slug}`}
                      className="px-4 py-2.5 border border-faz-secondary/30 hover:border-faz-secondary rounded-xl text-sm text-txtMain/70 hover:text-txtMain transition-colors flex items-center gap-2"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (quando não há clubes) */}
            {tenants.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-faz-secondary/30 p-12 text-center">
                <div className="w-16 h-16 bg-faz-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-faz-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-txtMain mb-2">
                  Nenhum clube ainda
                </h3>
                <p className="text-txtMain/60 mb-6 max-w-md mx-auto">
                  Crie seu primeiro clube de assinatura e comece a vender com recorrência.
                </p>
                <Link
                  href="/app/signup"
                  className="inline-flex items-center gap-2 bg-faz-primary hover:bg-faz-primary-hover text-txtMain px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Criar meu primeiro clube
                </Link>
              </div>
            )}

            {/* Help */}
            <div className="mt-10 text-center text-sm text-txtMain/50">
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@fazumclube.com" className="text-faz-primary hover:underline">
                Entre em contato
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
