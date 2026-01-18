'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { tenantsAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Package,
  Edit,
  Trash2,
  Check,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  highlighted: boolean
}

export default function TenantPlansPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { accessToken } = useAuthStore()
  const setTenantSlug = useTenantStore((state) => state.setSlug)
  const isAuthenticated = !!accessToken

  const [tenantId, setTenantId] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    interval: 'monthly' as 'monthly' | 'yearly',
    features: '',
    highlighted: false,
  })

  useEffect(() => {
    setTenantSlug(slug)
  }, [slug, setTenantSlug])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/t/${slug}/login`)
    }
  }, [isAuthenticated, router, slug])

  // Carregar tenant e planos da API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar tenant ID
        const tenantRes = await tenantsAPI.getBySlug(slug)
        if (tenantRes.data.found) {
          const tId = tenantRes.data.tenant.id
          setTenantId(tId)
          
          // Buscar planos
          const plansRes = await tenantsAPI.getPlans(tId)
          const loadedPlans = plansRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price || 0,
            interval: p.interval?.toLowerCase() === 'yearly' ? 'yearly' : 'monthly',
            features: p.features || [],
            highlighted: p.highlighted || false,
          }))
          setPlans(loadedPlans)
        }
      } catch (err) {
        console.error('Erro ao carregar planos:', err)
      } finally {
        setIsLoadingPlans(false)
      }
    }
    loadData()
  }, [slug])

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        interval: plan.interval,
        features: plan.features.join('\n'),
        highlighted: plan.highlighted,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        price: '',
        interval: 'monthly',
        features: '',
        highlighted: false,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return
    
    const planData = {
      name: formData.name,
      price: parseFloat(formData.price),
      interval: formData.interval as 'monthly' | 'yearly',
      features: formData.features.split('\n').filter(f => f.trim()),
      highlighted: formData.highlighted,
    }

    try {
      if (editingPlan) {
        // Atualizar plano existente
        const res = await tenantsAPI.updatePlan(tenantId, editingPlan.id, planData)
        setPlans(plans.map(p => p.id === editingPlan.id ? {
          ...p,
          ...planData,
        } : p))
      } else {
        // Criar novo plano
        const res = await tenantsAPI.createPlan(tenantId, planData)
        setPlans([...plans, {
          id: res.data.plan.id,
          ...planData,
        }])
      }
      closeModal()
    } catch (err) {
      console.error('Erro ao salvar plano:', err)
      alert('Erro ao salvar plano')
    }
  }

  const deletePlan = async (id: string) => {
    if (!tenantId) return
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await tenantsAPI.deletePlan(tenantId, id)
        setPlans(plans.filter(p => p.id !== id))
      } catch (err) {
        console.error('Erro ao excluir plano:', err)
        alert('Erro ao excluir plano')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link 
            href={`/t/${slug}/admin`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planos de Assinatura</h1>
              <p className="text-gray-600">Gerencie os planos oferecidos aos seus clientes</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Plano
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano criado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro plano de assinatura para começar a vender.</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Plano
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
                  plan.highlighted ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      DESTAQUE
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-500">
                      /{plan.interval === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openModal(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="Ex: Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="99.90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cobrança
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefícios (um por linha)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="1 produto por mês&#10;Frete grátis&#10;Acesso ao app"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="highlighted"
                  checked={formData.highlighted}
                  onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="highlighted" className="text-sm text-gray-700">
                  Destacar este plano (recomendado)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingPlan ? 'Salvar' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
