'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, CreditCard, Calendar, Package } from 'lucide-react'

interface SubscriptionDetail {
  id: string
  status: string
  createdAt: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  stripeSubscriptionId: string | null
  billingInterval: 'MONTHLY' | 'YEARLY'
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    profile: {
      cpf: string | null
      birthDate: string | null
      address: {
        street: string
        number: string
        complement: string | null
        district: string
        city: string
        state: string
        zipCode: string
      } | null
    } | null
  }
  plan: {
    name: string
    description: string
  }
}

export default function AdminAssinaturaDetalhes() {
  const router = useRouter()
  const params = useParams()
  const { user, accessToken } = useAuthStore()
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/admin/login')
      return
    }
    fetchSubscription()
  }, [user, accessToken, router, params.id])

  const fetchSubscription = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/admin/subscriptions/${params.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        setError('Assinatura não encontrada')
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setError('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400 font-semibold">Ativo</span>
      case 'PENDING':
        return <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">Pendente</span>
      case 'CANCELED':
        return <span className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-400 font-semibold">Cancelado</span>
      case 'PAST_DUE':
        return <span className="px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400 font-semibold">Atrasado</span>
      default:
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-600 text-gray-300 font-semibold">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Assinatura não encontrada'}</p>
          <Link href="/admin/assinaturas" className="text-brew-gold hover:underline">
            ← Voltar para assinaturas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Brewjaria" className="h-10 w-auto" />
            <span className="text-white font-bold text-xl">Admin</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-gray-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/admin/usuarios" className="text-gray-400 hover:text-white transition">
              Usuários
            </Link>
            <Link href="/admin/assinaturas" className="text-brew-gold font-semibold">
              Assinaturas
            </Link>
            <Link href="/admin/entregas" className="text-gray-400 hover:text-white transition">
              Entregas
            </Link>
            <Link href="/admin/pagamentos" className="text-gray-400 hover:text-white transition">
              Pagamentos
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← Voltar ao Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/admin/assinaturas" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Voltar para assinaturas
        </Link>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Detalhes da Assinatura</h1>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cliente Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <User size={20} className="text-brew-gold" />
              Dados do Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Nome</p>
                <p className="text-white font-medium">{subscription.user.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">E-mail</p>
                <p className="text-white font-medium">{subscription.user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Telefone</p>
                <p className="text-white font-medium">{subscription.user.phone || '-'}</p>
              </div>
              {subscription.user.profile?.cpf && (
                <div>
                  <p className="text-gray-400 text-sm">CPF</p>
                  <p className="text-white font-medium">{subscription.user.profile.cpf}</p>
                </div>
              )}
              {subscription.user.profile?.birthDate && (
                <div>
                  <p className="text-gray-400 text-sm">Data de Nascimento</p>
                  <p className="text-white font-medium">{formatDate(subscription.user.profile.birthDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <MapPin size={20} className="text-brew-gold" />
              Endereço de Entrega
            </h2>
            {subscription.user.profile?.address ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Logradouro</p>
                  <p className="text-white font-medium">
                    {subscription.user.profile.address.street}, {subscription.user.profile.address.number}
                    {subscription.user.profile.address.complement && ` - ${subscription.user.profile.address.complement}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Bairro</p>
                  <p className="text-white font-medium">{subscription.user.profile.address.district}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Cidade</p>
                    <p className="text-white font-medium">{subscription.user.profile.address.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Estado</p>
                    <p className="text-white font-medium">{subscription.user.profile.address.state}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">CEP</p>
                  <p className="text-white font-medium">{subscription.user.profile.address.zipCode}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Endereço não cadastrado</p>
              </div>
            )}
          </div>

          {/* Plano */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Package size={20} className="text-brew-gold" />
              Plano
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Nome do Plano</p>
                <p className="text-white font-medium">{subscription.plan.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tipo de Cobrança</p>
                <p className="text-white font-medium">
                  {subscription.billingInterval === 'YEARLY' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400 font-semibold">Anual</span>
                      R$ 999,00/ano
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 font-semibold">Mensal</span>
                      R$ 99,90/mês
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Descrição</p>
                <p className="text-white font-medium">{subscription.plan.description || '-'}</p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Calendar size={20} className="text-brew-gold" />
              Período
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Data de Criação</p>
                <p className="text-white font-medium">{formatDate(subscription.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Início do Período Atual</p>
                <p className="text-white font-medium">{formatDate(subscription.currentPeriodStart)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Próxima Cobrança</p>
                <p className="text-white font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              {subscription.stripeSubscriptionId && (
                <div>
                  <p className="text-gray-400 text-sm">ID Stripe</p>
                  <p className="text-white font-medium text-xs font-mono">{subscription.stripeSubscriptionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
