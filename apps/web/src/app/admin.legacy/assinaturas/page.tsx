'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import Pagination from '@/components/admin/Pagination'

interface Subscription {
  id: string
  status: string
  createdAt: string
  currentPeriodEnd: string | null
  user: { name: string; email: string }
  plan: { name: string }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminAssinaturas() {
  const { accessToken } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchSubscriptions = useCallback(async (page: number, status: string) => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status !== 'all') params.append('status', status)
      
      const response = await fetch(`${API_URL}/admin/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchSubscriptions(1, filter)
  }, [filter, fetchSubscriptions])

  const handlePageChange = (page: number) => {
    fetchSubscriptions(page, filter)
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
  }

  const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-'

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      ACTIVE: { bg: 'bg-green-500/20 text-green-400', label: 'Ativo' },
      PENDING: { bg: 'bg-yellow-500/20 text-yellow-400', label: 'Pendente' },
      CANCELED: { bg: 'bg-red-500/20 text-red-400', label: 'Cancelado' },
      PAUSED: { bg: 'bg-orange-500/20 text-orange-400', label: 'Pausado' },
      PAST_DUE: { bg: 'bg-orange-500/20 text-orange-400', label: 'Atrasado' },
    }
    const c = config[status] || { bg: 'bg-gray-600 text-gray-300', label: status }
    return <span className={`px-3 py-1 text-xs rounded-full font-semibold ${c.bg}`}>{c.label}</span>
  }

  const filters = [
    { key: 'all', label: 'Todas', color: 'bg-brew-gold text-brew-black' },
    { key: 'ACTIVE', label: 'Ativas', color: 'bg-green-500/20 text-green-400' },
    { key: 'PENDING', label: 'Pendentes', color: 'bg-yellow-500/20 text-yellow-400' },
    { key: 'PAUSED', label: 'Pausadas', color: 'bg-orange-500/20 text-orange-400' },
    { key: 'CANCELED', label: 'Canceladas', color: 'bg-red-500/20 text-red-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Assinaturas</h1>
          <p className="text-gray-400 mt-1">{pagination.total} assinaturas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f.key ? f.color : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Cliente</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Plano</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300 hidden md:table-cell">Início</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300 hidden md:table-cell">Próx. Cobrança</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhuma assinatura encontrada</td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{s.user.name}</p>
                        <p className="text-gray-400 text-sm truncate max-w-[180px]">{s.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300">{s.plan.name}</td>
                    <td className="px-4 lg:px-6 py-4">{getStatusBadge(s.status)}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300 hidden md:table-cell">{formatDate(s.createdAt)}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300 hidden md:table-cell">{formatDate(s.currentPeriodEnd)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <Link href={`/admin/assinaturas/${s.id}`} className="text-brew-gold hover:text-brew-gold/80 transition text-sm">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={handlePageChange} />
    </div>
  )
}
