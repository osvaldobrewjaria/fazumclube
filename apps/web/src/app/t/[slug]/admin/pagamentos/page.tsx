'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { 
  ArrowLeft, 
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function TenantPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { accessToken } = useAuthStore()
  const setTenantSlug = useTenantStore((state) => state.setSlug)
  const isAuthenticated = !!accessToken

  const [isConnecting, setIsConnecting] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    setTenantSlug(slug)
  }, [slug, setTenantSlug])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/t/${slug}/login`)
    }
  }, [isAuthenticated, router, slug])

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    
    // TODO: Implementar integração real com Stripe Connect
    // Por enquanto, simula a conexão
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsConnecting(false)
    setStripeConnected(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href={`/t/${slug}/admin`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600">Configure como você vai receber dos seus assinantes</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Status Card */}
        <div className={`rounded-xl p-6 mb-8 ${
          stripeConnected 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-amber-50 border-2 border-amber-200'
        }`}>
          <div className="flex items-start gap-4">
            {stripeConnected ? (
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <h2 className={`text-lg font-semibold ${
                stripeConnected ? 'text-green-800' : 'text-amber-800'
              }`}>
                {stripeConnected 
                  ? 'Stripe conectado com sucesso!' 
                  : 'Conecte sua conta Stripe para receber pagamentos'
                }
              </h2>
              <p className={`mt-1 ${
                stripeConnected ? 'text-green-700' : 'text-amber-700'
              }`}>
                {stripeConnected 
                  ? 'Você está pronto para receber pagamentos dos seus assinantes.'
                  : 'Sem uma conta Stripe conectada, você não poderá receber pagamentos.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Stripe Connect Card */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stripe</h2>
              <p className="text-gray-500">Plataforma líder em pagamentos online</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Seguro</h4>
                <p className="text-sm text-gray-500">Certificação PCI DSS nível 1</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Rápido</h4>
                <p className="text-sm text-gray-500">Receba em D+2</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Global</h4>
                <p className="text-sm text-gray-500">Aceite cartões do mundo todo</p>
              </div>
            </div>
          </div>

          {stripeConnected ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Conta conectada</span>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Acessar Dashboard Stripe
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Conectar com Stripe
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-indigo-50 rounded-xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-3">Como funciona?</h3>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              Clique em "Conectar com Stripe" para criar ou vincular sua conta
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              Complete o cadastro no Stripe (dados bancários, documentos)
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Pronto! Seus assinantes podem pagar e você recebe diretamente
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <p className="text-xs text-indigo-700">
              <strong>Taxas:</strong> 2,99% + R$0,39 por transação (cobradas pelo Stripe)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
