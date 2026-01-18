'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { tenantsAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// Steps
import { StepAccount } from './steps/StepAccount'
import { StepBusiness } from './steps/StepBusiness'
import { StepPlan } from './steps/StepPlan'
import { StepPayments } from './steps/StepPayments'
import { StepComplete } from './steps/StepComplete'

export type BusinessType = 'BEER' | 'WINE' | 'COFFEE' | 'SPIRITS' | 'TEA' | 'OTHER'

export interface OnboardingData {
  // Step 1: Account
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  
  // Step 2: Business
  tenantName: string
  tenantSlug: string
  businessType: BusinessType
  
  // Step 3: Plan
  selectedPlan: 'starter' | 'pro' | 'scale'
  
  // Step 4: Payments (MVP: apenas info, não conecta ainda)
  stripeConnected: boolean
}

const STEPS = [
  { id: 1, title: 'Conta', description: 'Seus dados' },
  { id: 2, title: 'Negócio', description: 'Sua marca' },
  { id: 3, title: 'Plano', description: 'Escolha' },
  { id: 4, title: 'Pagamentos', description: 'Stripe' },
  { id: 5, title: 'Pronto!', description: 'Concluído' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [data, setData] = useState<OnboardingData>({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    tenantName: '',
    tenantSlug: '',
    businessType: 'BEER',
    selectedPlan: 'starter',
    stripeConnected: false,
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.ownerName.length >= 2 && 
               data.ownerEmail.includes('@') && 
               data.ownerPassword.length >= 8
      case 2:
        return data.tenantName.length >= 2 && 
               data.tenantSlug.length >= 3
      case 3:
        return !!data.selectedPlan
      case 4:
        return true // Stripe é opcional no MVP
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep < 5) {
      // Se está no step 4, criar o tenant
      if (currentStep === 4) {
        setIsLoading(true)
        setError(null)
        
        try {
          console.log('Criando tenant...', { 
            ownerEmail: data.ownerEmail, 
            tenantSlug: data.tenantSlug 
          })
          
          const response = await tenantsAPI.provision({
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
            ownerPassword: data.ownerPassword,
            tenantName: data.tenantName,
            tenantSlug: data.tenantSlug,
            businessType: data.businessType,
          })
          
          console.log('Tenant criado!', response.data)
          
          // Salvar tokens no auth store
          setAuth(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.owner
          )
          
          setCurrentStep(5)
        } catch (err: any) {
          setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
        } finally {
          setIsLoading(false)
        }
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const handleGoToDashboard = () => {
    router.push(`/t/${data.tenantSlug}/admin`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-900">NextPay</h1>
          <p className="text-sm text-gray-600">Plataforma de clubes de assinatura</p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300
                    ${currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div 
                    className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepAccount data={data} updateData={updateData} />
              )}
              {currentStep === 2 && (
                <StepBusiness data={data} updateData={updateData} />
              )}
              {currentStep === 3 && (
                <StepPlan data={data} updateData={updateData} />
              )}
              {currentStep === 4 && (
                <StepPayments data={data} updateData={updateData} />
              )}
              {currentStep === 5 && (
                <StepComplete data={data} onGoToDashboard={handleGoToDashboard} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  transition-all duration-200
                  ${currentStep === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  transition-all duration-200
                  ${canProceed() && !isLoading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    Criar minha conta
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
