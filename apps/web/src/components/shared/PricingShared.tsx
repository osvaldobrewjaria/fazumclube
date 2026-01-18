'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'

interface PricingSharedProps {
  onStartSubscription: (planId?: string) => void
}

export default function PricingShared({ onStartSubscription }: PricingSharedProps) {
  const { tenant } = useTenant()
  
  const getCheckoutUrl = (planId: string): string | null => {
    // Primeiro tenta URL específica do plano
    const planUrl = tenant.subscription?.planCheckoutUrls?.[planId]
    if (planUrl) return planUrl
    
    // Fallback para URL genérica
    return tenant.subscription?.checkoutUrl || null
  }
  
  const handlePlanClick = (planId: string) => {
    const checkoutUrl = getCheckoutUrl(planId)
    
    // Se tem URL externa (Stripe, etc.), redireciona
    if (checkoutUrl && checkoutUrl.startsWith('http')) {
      window.location.href = checkoutUrl
      return
    }
    
    // Senão, abre fluxo interno
    onStartSubscription(planId)
  }
  
  return (
    <section className="py-20 px-4 bg-muted" id="pricing">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h2>
          <p className="text-lg text-muted-foreground">
            Selecione o plano ideal para você
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tenant.plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl bg-card border-2 transition-all
                ${plan.highlighted 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                {plan.name}
              </h3>
              
              <div className="mb-6">
                {plan.originalPrice && (
                  <span className="text-muted-foreground line-through text-sm mr-2">
                    R$ {plan.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-4xl font-bold text-primary">
                  R$ {plan.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-card-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full py-3 rounded-lg font-bold transition-all
                  ${plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
              >
                {tenant.subscription?.ctaLabel || 'Assinar agora'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
