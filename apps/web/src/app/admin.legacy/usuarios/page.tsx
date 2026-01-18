'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Search } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  subscription?: {
    status: string
    plan: { name: string }
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsuarios() {
  const { accessToken } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async (page: number, searchTerm: string) => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchUsers(1, searchDebounce)
  }, [searchDebounce, fetchUsers])

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchDebounce)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR')

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-300">Sem assinatura</span>
    const badges: Record<string, string> = {
      ACTIVE: 'bg-green-500/20 text-green-400',
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      CANCELED: 'bg-red-500/20 text-red-400',
      PAUSED: 'bg-orange-500/20 text-orange-400',
    }
    const labels: Record<string, string> = { ACTIVE: 'Ativo', PENDING: 'Pendente', CANCELED: 'Cancelado', PAUSED: 'Pausado' }
    return <span className={`px-2 py-1 text-xs rounded-full ${badges[status] || 'bg-gray-600 text-gray-300'}`}>{labels[status] || status}</span>
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        fetchUsers(pagination.page, searchDebounce)
      } else {
        alert('Erro ao deletar usuário')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao deletar usuário')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Usuários</h1>
          <p className="text-gray-400 mt-1">{pagination.total} usuários cadastrados</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brew-gold w-full sm:w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Nome</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300 hidden sm:table-cell">Email</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Assinatura</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300 hidden md:table-cell">Cadastro</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum usuário encontrado</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-brew-gold/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-brew-gold font-bold text-sm lg:text-base">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{u.name}</p>
                          <p className="text-gray-400 text-xs sm:hidden truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300 hidden sm:table-cell">
                      <span className="truncate block max-w-[200px]">{u.email}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">{getStatusBadge(u.subscription?.status)}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-300 hidden md:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-red-400 hover:text-red-300 transition text-xs lg:text-sm">
                        Deletar
                      </button>
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
