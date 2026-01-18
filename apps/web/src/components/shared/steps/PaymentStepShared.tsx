'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, Lock } from 'lucide-react'

export interface PaymentData {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

interface PaymentStepSharedProps {
  data: PaymentData
  setData: (data: PaymentData) => void
  onNext: () => void
  onBack: () => void
  planName?: string
  planPrice?: number
}

export default function PaymentStepShared({
  data,
  setData,
  onNext,
  onBack,
  planName,
  planPrice,
}: PaymentStepSharedProps) {
  const [errors, setErrors] = useState<Partial<PaymentData>>({})
  const [processing, setProcessing] = useState(false)

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16)
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4)
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2)
    }
    return numbers
  }

  const validate = () => {
    const newErrors: Partial<PaymentData> = {}
    
    const cardNumbers = data.cardNumber.replace(/\D/g, '')
    if (cardNumbers.length < 13 || cardNumbers.length > 16) {
      newErrors.cardNumber = 'Número do cartão inválido'
    }
    if (!data.cardName.trim()) {
      newErrors.cardName = 'Nome no cartão é obrigatório'
    }
    const expiry = data.expiryDate.replace(/\D/g, '')
    if (expiry.length !== 4) {
      newErrors.expiryDate = 'Data inválida'
    }
    if (data.cvv.length < 3 || data.cvv.length > 4) {
      newErrors.cvv = 'CVV inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setProcessing(true)
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        Pagamento
      </h2>
      
      {planName && planPrice && (
        <p className="text-center text-muted-foreground mb-8">
          Plano <span className="text-primary font-medium">{planName}</span> - R$ {planPrice.toFixed(2)}/mês
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Número do Cartão</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={data.cardNumber}
              onChange={(e) => setData({ ...data, cardNumber: formatCardNumber(e.target.value) })}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0000 0000 0000 0000"
            />
          </div>
          {errors.cardNumber && <p className="text-destructive text-sm mt-1">{errors.cardNumber}</p>}
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Nome no Cartão</label>
          <input
            type="text"
            value={data.cardName}
            onChange={(e) => setData({ ...data, cardName: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="NOME COMO NO CARTÃO"
          />
          {errors.cardName && <p className="text-destructive text-sm mt-1">{errors.cardName}</p>}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Validade</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.expiryDate}
                onChange={(e) => setData({ ...data, expiryDate: formatExpiryDate(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="MM/AA"
              />
            </div>
            {errors.expiryDate && <p className="text-destructive text-sm mt-1">{errors.expiryDate}</p>}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">CVV</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.cvv}
                onChange={(e) => setData({ ...data, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="123"
              />
            </div>
            {errors.cvv && <p className="text-destructive text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
          <Lock className="w-4 h-4" />
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg
                     hover:opacity-90 transition-all disabled:opacity-50"
          >
            {processing ? 'Processando...' : 'Confirmar Assinatura'}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="w-full py-3 bg-secondary text-secondary-foreground font-medium rounded-lg
                     hover:opacity-90 transition-all disabled:opacity-50"
          >
            Voltar
          </button>
        </div>
      </form>
    </motion.div>
  )
}
