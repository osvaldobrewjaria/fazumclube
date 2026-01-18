'use client'

import { Check, Zap, Crown, Rocket } from 'lucide-react'
import type { OnboardingData } from '../page'

interface Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const PLANS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Ideal para começar',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Até 100 assinantes',
      '1 plano de assinatura',
      'Página de vendas',
      'Gestão de entregas',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para crescer',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Até 500 assinantes',
      '5 planos de assinatura',
      'Página de vendas personalizada',
      'Gestão de entregas avançada',
      'Relatórios e analytics',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
  {
    id: 'scale' as const,
    name: 'Scale',
    price: 'R$ 397',
    period: '/mês',
    description: 'Para escalar',
    icon: <Rocket className="w-6 h-6" />,
    features: [
      'Assinantes ilimitados',
      'Planos ilimitados',
      'Domínio personalizado',
      'API de integração',
      'White-label',
      'Suporte dedicado',
    ],
    highlighted: false,
  },
]

export function StepPlan({ data, updateData }: Props) {
  return (
    <div className="space-y-4">
      {/* Info Trial */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-medium">
          🎉 Teste grátis por 14 dias! Cancele quando quiser.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => updateData({ selectedPlan: plan.id })}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all
              ${data.selectedPlan === plan.id 
                ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                : plan.highlighted
                  ? 'border-indigo-200 bg-white hover:border-indigo-300'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            {/* Badge Popular */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  data.selectedPlan === plan.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Selected indicator */}
            {data.selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
