'use client'

import { useState } from 'react'
import { useTenant } from '@/contexts/TenantContext'
import SubscriptionStepsShared from './steps/SubscriptionStepsShared'

interface SubscriptionFlowSharedProps {
  onClose: () => void
  flowType?: 'signup' | 'login'
  selectedPlanId?: string
}

/**
 * SubscriptionFlowShared - Fluxo de assinatura multi-tenant
 * 
 * Comportamento baseado em tenant.subscription.checkoutMode:
 * - 'link': Redireciona para URL externa (Stripe, etc.)
 * - 'embedded': Usa steps internos (AccountStep, AddressStep, PaymentStep)
 * 
 * MVP: Sempre usa embedded (steps internos)
 */
export default function SubscriptionFlowShared({
  onClose,
  flowType = 'signup',
  selectedPlanId,
}: SubscriptionFlowSharedProps) {
  const { tenant, hasFeature } = useTenant()

  // Se assinatura não está habilitada, não renderiza
  if (!hasFeature('enableSubscription')) {
    return null
  }

  const checkoutMode = tenant.subscription?.checkoutMode || 'embedded'

  // MVP: Sempre usa embedded
  // Futuro: if (checkoutMode === 'link') { redirect to external URL }

  return (
    <SubscriptionStepsShared
      onClose={onClose}
      flowType={flowType}
      selectedPlanId={selectedPlanId}
    />
  )
}
