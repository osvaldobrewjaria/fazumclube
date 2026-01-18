'use client'

import { useState } from 'react'
import { subscriptionsAPI } from '@/lib/api'

const planDetails = {
  MONTHLY: {
    name: 'Plano Mensal',
    price: 115.00,
    priceFormatted: 'R$ 115,00',
    frequency: 'Mensal',
    features: [
      '4 cervejas artesanais ultra frescas (350ml)',
      'Produção em pequenos lotes',
      'Entrega grátis em SP Capital',
      'Notas de degustação',
    ],
  },
  YEARLY: {
    name: 'Plano Anual',
    price: 1179.00,
    priceFormatted: 'R$ 1.179,00',
    frequency: 'Anual',
    features: [
      '4 cervejas artesanais ultra frescas (350ml)',
      'Produção em pequenos lotes',
      'Entrega grátis em SP Capital',
      'Notas de degustação',
      'Economize R$ 201 no ano',
      'Prioridade nos lotes ultrafrescos',
    ],
  },
}

interface PaymentStepProps {
  data: any
  onBack: () => void
  onClose: () => void
}

export default function PaymentStep({
  data,
  onBack,
  onClose,
}: PaymentStepProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = planDetails[data.billingInterval as keyof typeof planDetails] || planDetails.MONTHLY

  const handleCheckout = async () => {
    setError('')
    setLoading(true)

    console.log('PaymentStep - billingInterval:', data.billingInterval)
    console.log('PaymentStep - planSlug:', data.planSlug)

    try {
      const response = await subscriptionsAPI.createCheckoutSession({
        planSlug: data.planSlug,
        billingInterval: data.billingInterval,
      })

      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-brew-gold/10 border border-brew-gold/30 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4">Resumo do Plano</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-white">
            <span>{plan.name}</span>
            <span className="font-semibold">{plan.priceFormatted}</span>
          </div>
          <div className="flex justify-between text-white text-sm">
            <span>Frequência</span>
            <span>{plan.frequency}</span>
          </div>
          <div className="border-t border-brew-gold/20 pt-3 flex justify-between text-white font-bold">
            <span>Total</span>
            <span className="text-brew-gold">{plan.priceFormatted}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-bold">O que está incluído:</h3>
        <ul className="space-y-2 text-white/80 text-sm">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-brew-gold">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <div className="flex gap-3 sm:flex-1">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            Cancelar
          </button>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full sm:w-auto sm:flex-1 px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? 'Processando...' : 'Pagar'}
        </button>
      </div>
    </div>
  )
}
