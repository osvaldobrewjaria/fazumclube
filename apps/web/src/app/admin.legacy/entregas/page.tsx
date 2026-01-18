'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { 
  Download, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

interface Delivery {
  id: string
  subscriptionId: string
  deliveryId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string | null
  planName: string
  billingInterval: string
  subscriptionStatus: string
  deliveryStatus: string
  trackingCode: string | null
  trackingUrl: string | null
  shippedAt: string | null
  deliveredAt: string | null
  notes: string | null
  address: {
    street: string
    number: string
    complement: string | null
    district: string
    city: string
    state: string
    zipCode: string
  } | null
  referenceMonth: number
  referenceYear: number
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  PREPARING: { label: 'Preparando', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  RETURNED: { label: 'Devolvido', color: 'bg-red-500/20 text-red-400', icon: RotateCcw },
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function AdminEntregas() {
  const { accessToken } = useAuthStore()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDeliveries()
  }, [accessToken, selectedMonth, selectedYear])

  const fetchDeliveries = async () => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${API_URL}/admin/deliveries?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (response.ok) {
        setDeliveries(await response.json())
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/admin/deliveries/export`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `entregas-${selectedMonth}-${selectedYear}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const updateStatus = async (subscriptionId: string, status: string, trackingCode?: string) => {
    setUpdatingId(subscriptionId)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(
        `${API_URL}/admin/deliveries/${subscriptionId}?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ status, trackingCode }),
        }
      )
      fetchDeliveries()
    } catch (error) {
      console.error('Error updating:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.length === 0) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(`${API_URL}/admin/deliveries/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ subscriptionIds: selectedIds, month: selectedMonth, year: selectedYear, status }),
      })
      setSelectedIds([])
      fetchDeliveries()
    } catch (error) {
      console.error('Error bulk updating:', error)
    }
  }

  const navigateMonth = (dir: number) => {
    let m = selectedMonth + dir, y = selectedYear
    if (m > 12) { m = 1; y++ } else if (m < 1) { m = 12; y-- }
    setSelectedMonth(m)
    setSelectedYear(y)
  }

  const filteredDeliveries = deliveries.filter(d => filter === 'all' || d.deliveryStatus === filter)

  const statusCounts = {
    all: deliveries.length,
    PENDING: deliveries.filter(d => d.deliveryStatus === 'PENDING').length,
    PREPARING: deliveries.filter(d => d.deliveryStatus === 'PREPARING').length,
    SHIPPED: deliveries.filter(d => d.deliveryStatus === 'SHIPPED').length,
    DELIVERED: deliveries.filter(d => d.deliveryStatus === 'DELIVERED').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Entregas</h1>
          <p className="text-gray-400 mt-1">{deliveries.length} assinatura{deliveries.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Navigator */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigateMonth(-1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <div className="px-3 py-2 bg-gray-800 rounded-lg min-w-[140px] text-center">
              <span className="text-white text-sm font-medium">{monthNames[selectedMonth - 1]} {selectedYear}</span>
            </div>
            <button onClick={() => navigateMonth(1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting || deliveries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition disabled:opacity-50 text-sm"
          >
            <Download size={16} />
            {exporting ? 'Exportando...' : 'CSV'}
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === status
                ? status === 'all' ? 'bg-brew-gold text-brew-black' : statusConfig[status]?.color
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {status === 'all' ? 'Todas' : statusConfig[status]?.label} ({count})
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 flex flex-wrap items-center gap-3">
          <span className="text-white text-sm">{selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}</span>
          <button onClick={() => handleBulkUpdate('PREPARING')} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">Preparar</button>
          <button onClick={() => handleBulkUpdate('SHIPPED')} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Enviar</button>
          <button onClick={() => handleBulkUpdate('DELIVERED')} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">Entregue</button>
        </div>
      )}

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nenhuma entrega encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center gap-2 px-2 text-gray-400 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredDeliveries.length}
              onChange={() => setSelectedIds(selectedIds.length === filteredDeliveries.length ? [] : filteredDeliveries.map(d => d.subscriptionId))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brew-gold"
            />
            Selecionar todos
          </label>

          {filteredDeliveries.map((d) => {
            const cfg = statusConfig[d.deliveryStatus] || statusConfig.PENDING
            const Icon = cfg.icon
            return (
              <div key={d.subscriptionId} className={`bg-gray-800 rounded-xl border p-4 ${selectedIds.includes(d.subscriptionId) ? 'border-brew-gold' : 'border-gray-700'}`}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Customer */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(d.subscriptionId)}
                      onChange={() => setSelectedIds(prev => prev.includes(d.subscriptionId) ? prev.filter(i => i !== d.subscriptionId) : [...prev, d.subscriptionId])}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-brew-gold"
                    />
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate">{d.customerName}</h3>
                      <p className="text-gray-400 text-sm truncate">{d.customerEmail}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${d.billingInterval === 'YEARLY' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {d.planName} • {d.billingInterval === 'YEARLY' ? 'Anual' : 'Mensal'}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex-1 min-w-0">
                    {d.address ? (
                      <div className="flex gap-2">
                        <MapPin size={14} className="text-brew-gold mt-0.5 flex-shrink-0" />
                        <div className="text-sm min-w-0">
                          <p className="text-white truncate">{d.address.street}, {d.address.number}{d.address.complement && ` - ${d.address.complement}`}</p>
                          <p className="text-gray-400 truncate">{d.address.district} - {d.address.city}/{d.address.state}</p>
                          <p className="text-gray-500">CEP: {d.address.zipCode}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-yellow-400 text-sm flex items-center gap-1"><MapPin size={14} /> Sem endereço</p>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm ${cfg.color}`}>
                      <Icon size={14} />
                      {cfg.label}
                    </div>
                    
                    {d.trackingCode && (
                      <a href={d.trackingUrl || `https://www.linkcorreios.com.br/?id=${d.trackingCode}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brew-gold flex items-center gap-1 hover:underline">
                        {d.trackingCode} <ExternalLink size={10} />
                      </a>
                    )}

                    <div className="flex gap-1">
                      {d.deliveryStatus === 'PENDING' && (
                        <button onClick={() => updateStatus(d.subscriptionId, 'PREPARING')} disabled={updatingId === d.subscriptionId} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50">Preparar</button>
                      )}
                      {d.deliveryStatus === 'PREPARING' && (
                        <button onClick={() => { const c = prompt('Código rastreio:'); updateStatus(d.subscriptionId, 'SHIPPED', c || undefined) }} disabled={updatingId === d.subscriptionId} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 disabled:opacity-50">Enviar</button>
                      )}
                      {d.deliveryStatus === 'SHIPPED' && (
                        <button onClick={() => updateStatus(d.subscriptionId, 'DELIVERED')} disabled={updatingId === d.subscriptionId} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50">Entregue</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
