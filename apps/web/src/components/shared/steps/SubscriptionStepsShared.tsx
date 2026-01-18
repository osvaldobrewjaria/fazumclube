'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import AccountStepShared, { AccountData } from './AccountStepShared'
import AddressStepShared, { AddressData } from './AddressStepShared'
import PaymentStepShared, { PaymentData } from './PaymentStepShared'

interface SubscriptionStepsSharedProps {
  onClose: () => void
  flowType?: 'signup' | 'login'
  selectedPlanId?: string
}

type Step = 'account' | 'address' | 'payment' | 'success'

export default function SubscriptionStepsShared({
  onClose,
  flowType = 'signup',
  selectedPlanId,
}: SubscriptionStepsSharedProps) {
  const { tenant } = useTenant()
  const [currentStep, setCurrentStep] = useState<Step>(flowType === 'login' ? 'account' : 'account')
  
  const [accountData, setAccountData] = useState<AccountData>({
    name: '',
    email: '',
    password: '',
  })
  
  const [addressData, setAddressData] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  const selectedPlan = tenant.plans.find(p => p.id === selectedPlanId) || tenant.plans[0]

  const steps: Step[] = flowType === 'login' 
    ? ['account', 'payment'] 
    : ['account', 'address', 'payment']

  const currentStepIndex = steps.indexOf(currentStep)

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    } else {
      setCurrentStep('success')
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-xl font-bold text-primary">
          {tenant.brandText.line1} {tenant.brandText.line2}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Progress */}
      {currentStep !== 'success' && (
        <div className="flex items-center justify-center gap-4 py-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index <= currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {currentStep === 'account' && (
            <AccountStepShared
              key="account"
              data={accountData}
              setData={setAccountData}
              onNext={goToNext}
              isLogin={flowType === 'login'}
            />
          )}
          
          {currentStep === 'address' && (
            <AddressStepShared
              key="address"
              data={addressData}
              setData={setAddressData}
              onNext={goToNext}
              onBack={goBack}
            />
          )}
          
          {currentStep === 'payment' && (
            <PaymentStepShared
              key="payment"
              data={paymentData}
              setData={setPaymentData}
              onNext={goToNext}
              onBack={goBack}
              planName={selectedPlan?.name}
              planPrice={selectedPlan?.price}
            />
          )}
          
          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Assinatura Confirmada!
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Bem-vindo ao {tenant.name}! Você receberá um e-mail com os detalhes da sua assinatura.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg
                         hover:opacity-90 transition-all"
              >
                Voltar ao Início
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
