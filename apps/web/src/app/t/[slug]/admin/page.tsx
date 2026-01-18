'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Palette
} from 'lucide-react'

export default function TenantAdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { tenant } = useTenant()
  const { user, accessToken, logout } = useAuthStore()
  const setTenantSlug = useTenantStore((state) => state.setSlug)
  const isAuthenticated = !!accessToken
  const [isLoading, setIsLoading] = useState(true)

  // Garantir que o slug do tenant está setado
  useEffect(() => {
    setTenantSlug(slug)
  }, [slug, setTenantSlug])

  useEffect(() => {
    // Verificar autenticação - redirecionar para login do tenant
    if (!isAuthenticated) {
      router.push(`/t/${slug}/login`)
      return
    }
    setIsLoading(false)
  }, [isAuthenticated, router, slug])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tenant?.name || slug}
            </h1>
            <p className="text-sm text-gray-500">Painel Administrativo</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Bem-vindo ao seu Dashboard! 🎉
          </h2>
          <p className="text-indigo-100">
            Seu clube <strong>{tenant?.name || slug}</strong> está pronto para receber assinantes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Assinantes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">R$ 0</p>
                <p className="text-sm text-gray-500">Receita Mensal</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Entregas Pendentes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0%</p>
                <p className="text-sm text-gray-500">Crescimento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Checklist */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configure seu clube
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Conta criada</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-gray-700">Conectar Stripe para receber pagamentos</span>
            </div>
            <button 
              onClick={() => router.push(`/t/${slug}/admin/planos`)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors text-left w-full"
            >
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              <span className="text-gray-500 hover:text-indigo-600">Criar planos de assinatura</span>
            </button>
            <button 
              onClick={() => router.push(`/t/${slug}/admin/personalizar`)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors text-left w-full"
            >
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              <span className="text-gray-500 hover:text-indigo-600">Personalizar página de vendas</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button 
            onClick={() => router.push(`/t/${slug}/admin/configuracoes`)}
            className="bg-white rounded-xl p-6 shadow-sm border hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <Settings className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-semibold text-gray-900">Configurações</h4>
            <p className="text-sm text-gray-500 mt-1">Personalize seu clube</p>
          </button>

          <button 
            onClick={() => router.push(`/t/${slug}/admin/planos`)}
            className="bg-white rounded-xl p-6 shadow-sm border hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <Package className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-semibold text-gray-900">Planos</h4>
            <p className="text-sm text-gray-500 mt-1">Gerencie seus planos</p>
          </button>

          <button 
            onClick={() => router.push(`/t/${slug}/admin/pagamentos`)}
            className="bg-white rounded-xl p-6 shadow-sm border hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <CreditCard className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-semibold text-gray-900">Pagamentos</h4>
            <p className="text-sm text-gray-500 mt-1">Conecte o Stripe</p>
          </button>

          <button 
            onClick={() => router.push(`/t/${slug}/admin/personalizar`)}
            className="bg-white rounded-xl p-6 shadow-sm border hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <Palette className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-semibold text-gray-900">Personalizar</h4>
            <p className="text-sm text-gray-500 mt-1">Página de vendas</p>
          </button>
        </div>
      </div>
    </div>
  )
}
