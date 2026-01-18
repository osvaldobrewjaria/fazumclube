'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
  planName: string
  stripePaymentIntentId: string | null
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminPagamentos() {
  const { accessToken } = useAuthStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchPayments = useCallback(async (page: number, status: string) => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status !== 'all') params.append('status', status)
      
      const response = await fetch(`${API_URL}/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchPayments(1, filter)
  }, [filter, fetchPayments])

  const handlePageChange = (page: number) => fetchPayments(page, filter)
  const handleFilterChange = (newFilter: string) => setFilter(newFilter)

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof CheckCircle; bg: string; label: string }> = {
      PAID: { icon: CheckCircle, bg: 'bg-green-500/20 text-green-400', label: 'Pago' },
      FAILED: { icon: XCircle, bg: 'bg-red-500/20 text-red-400', label: 'Falhou' },
      PENDING: { icon: Clock, bg: 'bg-yellow-500/20 text-yellow-400', label: 'Pendente' },
    }
    const c = config[status] || { icon: Clock, bg: 'bg-gray-600 text-gray-300', label: status }
    const Icon = c.icon
    return <span className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold ${c.bg}`}><Icon size={14} />{c.label}</span>
  }

  const filters = [
    { key: 'all', label: 'Todos', color: 'bg-brew-gold text-brew-black' },
    { key: 'PAID', label: 'Pagos', color: 'bg-green-500/20 text-green-400' },
    { key: 'PENDING', label: 'Pendentes', color: 'bg-yellow-500/20 text-yellow-400' },
    { key: 'FAILED', label: 'Falhos', color: 'bg-red-500/20 text-red-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Histórico de Pagamentos</h1>
        <p className="text-gray-400 mt-1">{pagination.total} pagamento{pagination.total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
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

      {/* Payments Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Data</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Cliente</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300 hidden md:table-cell">Plano</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Valor</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum pagamento encontrado</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 lg:px-6 py-4 text-gray-300 text-sm">{formatDate(p.createdAt)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{p.customerName}</p>
                        <p className="text-gray-400 text-sm truncate max-w-[150px]">{p.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300 hidden md:table-cell">{p.planName}</td>
                    <td className="px-4 lg:px-6 py-4 text-brew-gold font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-4 lg:px-6 py-4">{getStatusBadge(p.status)}</td>
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
