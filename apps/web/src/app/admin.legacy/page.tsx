'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { 
  Users, 
  Package, 
  Truck, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  UserPlus,
  UserMinus,
  PieChart,
  BarChart3
} from 'lucide-react'
import dynamic from 'next/dynamic'

const MrrChart = dynamic(() => import('@/components/admin/MrrChart'), { ssr: false })

interface MrrHistoryItem {
  month: string
  year: number
  mrr: number
  subscribers: number
  newUsers: number
}

interface Stats {
  totalUsers: number
  activeSubscriptions: number
  pendingSubscriptions: number
  canceledSubscriptions: number
  pausedSubscriptions: number
  mrr: number
  arr: number
  monthlyRevenue: number
  averageTicket: number
  monthlySubscribers: number
  yearlySubscribers: number
  newUsersLast30Days: number
  newSubscriptionsLast30Days: number
  canceledLast30Days: number
  churnRate: number
  churnTrend: number
  mrrHistory?: MrrHistoryItem[]
}

export default function AdminDashboard() {
  const { accessToken } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingSubscriptions: 0,
    canceledSubscriptions: 0,
    pausedSubscriptions: 0,
    mrr: 0,
    arr: 0,
    monthlyRevenue: 0,
    averageTicket: 0,
    monthlySubscribers: 0,
    yearlySubscribers: 0,
    newUsersLast30Days: 0,
    newSubscriptionsLast30Days: 0,
    canceledLast30Days: 0,
    churnRate: 0,
    churnTrend: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [accessToken])

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Revenue Cards - Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-brew-gold/20 to-brew-gold/5 rounded-xl p-5 lg:p-6 border border-brew-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brew-gold/20 rounded-lg">
              <DollarSign size={24} className="text-brew-gold" />
            </div>
            <span className="text-xs text-brew-gold/70 font-medium">MRR</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.mrr)}
          </p>
          <p className="text-gray-400 text-sm">Receita Recorrente Mensal</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 lg:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar size={24} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">ARR</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.arr)}
          </p>
          <p className="text-gray-400 text-sm">Receita Recorrente Anual</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 lg:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <PieChart size={24} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Ticket Médio</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.averageTicket)}
          </p>
          <p className="text-gray-400 text-sm">Por assinante / mês</p>
        </div>
      </div>

      {/* Subscription Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Assinaturas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-green-400" />
              <span className="text-xs text-gray-400">Ativas</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.activeSubscriptions}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingSubscriptions}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-orange-400" />
              <span className="text-xs text-gray-400">Pausadas</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.pausedSubscriptions}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-red-400" />
              <span className="text-xs text-gray-400">Canceladas</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.canceledSubscriptions}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-blue-400" />
              <span className="text-xs text-gray-400">Usuários</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* MRR Chart */}
      {stats.mrrHistory && stats.mrrHistory.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-brew-gold" />
            <h3 className="text-white font-semibold">Evolução do MRR</h3>
          </div>
          <MrrChart data={stats.mrrHistory} />
        </div>
      )}

      {/* Plan Distribution & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Distribuição de Planos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Mensal</span>
                <span className="text-white font-medium">{stats.monthlySubscribers}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ 
                    width: `${stats.activeSubscriptions > 0 
                      ? (stats.monthlySubscribers / stats.activeSubscriptions) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Anual</span>
                <span className="text-white font-medium">{stats.yearlySubscribers}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ 
                    width: `${stats.activeSubscriptions > 0 
                      ? (stats.yearlySubscribers / stats.activeSubscriptions) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Growth & Churn */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Últimos 30 dias</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={18} className="text-green-400" />
                <span className="text-xs text-gray-400">Novos usuários</span>
              </div>
              <p className="text-xl font-bold text-green-400">+{stats.newUsersLast30Days}</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-400" />
                <span className="text-xs text-gray-400">Novas assinaturas</span>
              </div>
              <p className="text-xl font-bold text-green-400">+{stats.newSubscriptionsLast30Days}</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserMinus size={18} className="text-red-400" />
                <span className="text-xs text-gray-400">Cancelamentos</span>
              </div>
              <p className="text-xl font-bold text-red-400">{stats.canceledLast30Days}</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {stats.churnTrend <= 0 ? (
                  <TrendingDown size={18} className="text-green-400" />
                ) : (
                  <TrendingUp size={18} className="text-red-400" />
                )}
                <span className="text-xs text-gray-400">Churn Rate</span>
              </div>
              <p className={`text-xl font-bold ${stats.churnRate > 5 ? 'text-red-400' : 'text-white'}`}>
                {stats.churnRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/usuarios"
            className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-brew-gold/50 transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-brew-gold" />
              <h3 className="font-bold text-white group-hover:text-brew-gold transition">
                Gerenciar Usuários
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Visualize e gerencie todos os usuários.
            </p>
          </Link>
          
          <Link
            href="/admin/assinaturas"
            className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-brew-gold/50 transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package size={20} className="text-brew-gold" />
              <h3 className="font-bold text-white group-hover:text-brew-gold transition">
                Gerenciar Assinaturas
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Acompanhe o status das assinaturas.
            </p>
          </Link>
          
          <Link
            href="/admin/entregas"
            className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-brew-gold/50 transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Truck size={20} className="text-brew-gold" />
              <h3 className="font-bold text-white group-hover:text-brew-gold transition">
                Lista de Entregas
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Exporte a lista de entregas do mês.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
