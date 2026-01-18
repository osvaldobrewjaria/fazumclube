'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTenant } from '@/contexts/TenantContext'
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
    features?: string[]
  }
}

export default function MinhaAssinatura() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()
  const { user, accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || !accessToken) {
        router.push(`/t/${slug}/login`)
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
  }, [user, accessToken, router, slug])

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
      const response = await subscriptionsAPI.createCheckoutSession({
        planSlug: subscription.plan.slug,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  // Usar features do plano ou fallback genérico
  const planFeatures = subscription?.plan?.features || [
    'Produtos selecionados todo mês',
    'Frete grátis',
    'Acesso exclusivo a novidades',
    'Suporte prioritário',
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/t/${slug}`} className="flex items-center gap-3">
            {tenant?.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="h-10 w-auto" />
            ) : (
              <span className="text-primary-foreground font-bold text-xl">{tenant?.name}</span>
            )}
          </Link>
          <Link href={`/t/${slug}`} className="text-primary-foreground hover:text-primary-foreground/70 transition font-semibold">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minha Assinatura</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {!subscription ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground mb-6">Você ainda não possui uma assinatura ativa.</p>
            <Link
              href={`/t/${slug}`}
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
            >
              Ver Planos Disponíveis
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Status da Assinatura */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{subscription.plan?.name}</h2>
                <p className="text-muted-foreground">
                  {subscription.plan?.description}
                </p>
              </div>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                {getStatusLabel(subscription.status)}
              </span>
            </div>

            {/* Detalhes */}
            {subscription.currentPeriodEnd && (
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próxima cobrança</span>
                  <span className="text-foreground">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </div>
            )}

            {/* Benefícios */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Seus Benefícios</h3>
              <ul className="space-y-2">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ações */}
            {subscription.status === 'PENDING' && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">
                    Sua assinatura está aguardando pagamento. Clique no botão abaixo para finalizar.
                  </p>
                </div>
                <button
                  onClick={handleResumePayment}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
                >
                  Finalizar Pagamento
                </button>
              </div>
            )}
            {subscription.status === 'ACTIVE' && (
              <div className="border-t border-border pt-6 mt-6 flex flex-wrap gap-4">
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
              <div className="border-t border-border pt-6 mt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">
                    Sua assinatura está pausada. Você não receberá entregas até reativá-la.
                  </p>
                </div>
                <button
                  onClick={handleResumeSubscription}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
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
