'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import AccountStep from './steps/AccountStep'
import AddressStep from './steps/AddressStep'
import PaymentStep from './steps/PaymentStep'
import LoginStep from './steps/LoginStep'
import { useAuthStore } from '@/stores/authStore'
import { subscriptionsAPI } from '@/lib/api'

interface SubscriptionFlowProps {
  onClose: () => void
  flowType?: 'signup' | 'login'
  billingInterval?: 'MONTHLY' | 'YEARLY'
}

// Função para verificar auth no localStorage diretamente
const checkAuthFromStorage = () => {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return !!(parsed?.state?.user && parsed?.state?.accessToken)
    }
  } catch (e) {
    console.error('Error reading auth storage:', e)
  }
  return false
}

export default function SubscriptionFlow({ onClose, flowType = 'signup', billingInterval = 'MONTHLY' }: SubscriptionFlowProps) {
  console.log('SubscriptionFlow - billingInterval prop:', billingInterval)
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const [checkingSubscription, setCheckingSubscription] = useState(false)
  
  // Verifica auth ANTES de definir o step inicial
  const getInitialStep = () => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = checkAuthFromStorage()
            if (isLoggedIn) return 2
    }
    return flowType === 'login' ? 0 : 1
  }
  
  const [step, setStep] = useState(() => getInitialStep())
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(flowType)
  
  // Verifica se usuário já tem assinatura ao fazer login
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user || !accessToken) return
      
      setCheckingSubscription(true)
      try {
        const response = await subscriptionsAPI.getSubscription()
        if (response.data) {
          // Usuário já tem assinatura - redireciona para página de assinatura
          router.push('/minha-assinatura')
          onClose()
          return
        }
      } catch {
        // Sem assinatura - continua o fluxo normal
      } finally {
        setCheckingSubscription(false)
      }
      
      // Se não tem assinatura, vai para step 2 (endereço)
      if (step < 2) {
        setStep(2)
      }
    }
    
    const isLoggedIn = !!user && !!accessToken
    if (isLoggedIn) {
      checkExistingSubscription()
    }
  }, [user, accessToken, step, router, onClose])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    address: {
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: '',
    },
    planSlug: 'clube-brewjaria',
    billingInterval: billingInterval,
  })

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data })
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleClose = () => {
    onClose()
  }

  // Mostra loading enquanto verifica assinatura existente
  if (checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Verificando sua conta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="bg-brew-black/80 backdrop-blur-md border border-brew-gold/20 rounded-2xl p-8 md:p-12 max-w-2xl w-full shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s <= step
                    ? 'bg-brew-gold text-brew-black'
                    : 'bg-brew-gold/20 text-white/50'
                }`}
                animate={{
                  scale: s === step ? 1.1 : 1,
                }}
              >
                {s}
              </motion.div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 mx-2 transition-all ${
                    s < step ? 'bg-brew-gold' : 'bg-brew-gold/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {step === 0 && (authMode === 'login' ? 'Entrar na Conta' : 'Criar Conta')}
            {step === 1 && 'Criar Conta'}
            {step === 2 && 'Endereço de Entrega'}
            {step === 3 && 'Pagamento'}
          </h2>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginStep
                onSuccess={() => setStep(2)}
                onToggleMode={() => {
                  if (authMode === 'login') {
                    setStep(1) // Vai para o formulário de cadastro
                  }
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                }}
                onClose={handleClose}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AccountStep
                data={formData}
                onNext={handleNext}
                onClose={handleClose}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AddressStep
                data={formData}
                onNext={handleNext}
                onBack={handleBack}
                onClose={handleClose}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentStep
                data={formData}
                onBack={handleBack}
                onClose={handleClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
