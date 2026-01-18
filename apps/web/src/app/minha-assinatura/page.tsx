'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { subscriptionsAPI } from '@/lib/api'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  plan: {
    name: string
    slug: string
    description: string
  }
}

export default function MinhaAssinatura() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || !accessToken) {
        router.push('/')
        return
      }

      try {
        const response = await subscriptionsAPI.getSubscription()
        setSubscription(response.data)
      } catch (err: any) {
        if (err.response?.status === 404) {
          setSubscription(null)
        } else {
          setError('Erro ao carregar assinatura')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user, accessToken, router])

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return

    try {
      await subscriptionsAPI.cancelSubscription()
      setSubscription(null)
      alert('Assinatura cancelada com sucesso')
    } catch (err) {
      alert('Erro ao cancelar assinatura')
    }
  }

  const handleResumePayment = async () => {
    if (!subscription) return
    
    try {
      // Criar nova sessão de checkout para a assinatura pendente
      const response = await subscriptionsAPI.createCheckoutSession({
        planSlug: subscription.plan.slug || 'clube-brewjaria',
        billingInterval: 'MONTHLY',
      })
      
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Erro ao retomar pagamento'
      alert(errorMsg)
    }
  }

  const handlePauseSubscription = async () => {
    if (!confirm('Tem certeza que deseja pausar sua assinatura? Você não receberá entregas enquanto estiver pausada.')) return

    try {
      await subscriptionsAPI.pauseSubscription()
      // Atualizar estado local
      if (subscription) {
        setSubscription({ ...subscription, status: 'PAUSED' })
      }
      alert('Assinatura pausada com sucesso')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Erro ao pausar assinatura'
      alert(errorMsg)
    }
  }

  const handleResumeSubscription = async () => {
    try {
      await subscriptionsAPI.resumeSubscription()
      // Atualizar estado local
      if (subscription) {
        setSubscription({ ...subscription, status: 'ACTIVE' })
      }
      alert('Assinatura reativada com sucesso!')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Erro ao reativar assinatura'
      alert(errorMsg)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400'
      case 'PAUSED':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'CANCELED':
        return 'bg-red-500/20 text-red-400'
      case 'PAST_DUE':
        return 'bg-orange-500/20 text-orange-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'PAUSED':
        return 'Pausado'
      case 'CANCELED':
        return 'Cancelado'
      case 'PAST_DUE':
        return 'Pagamento Pendente'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brew-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-brew-black">
      {/* Header */}
      <header className="bg-brew-gold py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Brewjaria" className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-brew-black hover:text-brew-black/70 transition font-semibold">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Minha Assinatura</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {!subscription ? (
          <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-8 text-center">
            <p className="text-white/60 mb-6">Você ainda não possui uma assinatura ativa.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition"
            >
              Ver Planos Disponíveis
            </Link>
          </div>
        ) : (
          <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-6">
            {/* Status da Assinatura */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{subscription.plan?.name || 'Clube Brewjaria'}</h2>
                <p className="text-white/60">
                  {subscription.plan?.description || 'Assinatura mensal de cervejas artesanais'}
                </p>
              </div>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                {getStatusLabel(subscription.status)}
              </span>
            </div>

            {/* Detalhes */}
            {subscription.currentPeriodEnd && (
              <div className="border-t border-brew-gold/20 pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Próxima cobrança</span>
                  <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </div>
            )}

            {/* Benefícios */}
            <div className="border-t border-brew-gold/20 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Seus Benefícios</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/80">
                  <span className="text-green-400">✓</span>
                  4 cervejas artesanais premium por mês
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <span className="text-green-400">✓</span>
                  Entrega grátis em São Paulo Capital
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <span className="text-green-400">✓</span>
                  Notas de degustação exclusivas
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <span className="text-green-400">✓</span>
                  Acesso a eventos especiais
                </li>
              </ul>
            </div>

            {/* Ações */}
            {subscription.status === 'PENDING' && (
              <div className="border-t border-brew-gold/20 pt-6 mt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">
                    Sua assinatura está aguardando pagamento. Clique no botão abaixo para finalizar.
                  </p>
                </div>
                <button
                  onClick={handleResumePayment}
                  className="px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition"
                >
                  Finalizar Pagamento
                </button>
              </div>
            )}
            {subscription.status === 'ACTIVE' && (
              <div className="border-t border-brew-gold/20 pt-6 mt-6 flex flex-wrap gap-4">
                <button
                  onClick={handlePauseSubscription}
                  className="px-6 py-2 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/10 transition"
                >
                  Pausar Assinatura
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="px-6 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition"
                >
                  Cancelar Assinatura
                </button>
              </div>
            )}
            {subscription.status === 'PAUSED' && (
              <div className="border-t border-brew-gold/20 pt-6 mt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">
                    Sua assinatura está pausada. Você não receberá entregas até reativá-la.
                  </p>
                </div>
                <button
                  onClick={handleResumeSubscription}
                  className="px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition"
                >
                  Reativar Assinatura
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
