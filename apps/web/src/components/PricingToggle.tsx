'use client'

const monthlyPlan = {
  name: 'Mensal',
  price: 115.00,
  period: '/mês',
  description: 'Para quem quer flexibilidade total',
  features: [
    '4 cervejas artesanais ultra frescas (350ml)',
    'Produção em pequenos lotes',
    'Envase profissional',
    'Entrega direta na sua casa',
    'Notas de degustação',
    'Cancelamento a qualquer momento',
  ],
  cta: 'Assinar mensal',
  billingInterval: 'MONTHLY' as const,
}

const yearlyPlan = {
  name: 'Anual',
  price: 1179.00,
  monthlyEquivalent: 98.25,
  period: '/ano',
  description: 'O melhor valor para quem leva cerveja a sério',
  features: [
    'Inclui todos os benefícios do plano mensal',
    'Preço protegido por 12 meses',
    'Prioridade nos lotes ultrafrescos',
    'Brindes e receitas exclusivas',
  ],
  cta: 'Assinar anual',
  billingInterval: 'YEARLY' as const,
  badge: 'Plano preferido',
  savings: 'Economia de R$ 201 ao longo do ano',
}

interface PricingToggleProps {
  onStartSubscription: (billingInterval: 'MONTHLY' | 'YEARLY') => void
}

export default function PricingToggle({ onStartSubscription }: PricingToggleProps) {
  return (
    <section className="pt-10 pb-12 md:pt-16 md:pb-20 px-4 bg-[#0a0a0f]" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Escolha seu plano
          </h2>
          <p className="text-sm md:text-base text-white/45 max-w-xl mx-auto">
            Cerveja artesanal ultra fresca, direto na sua porta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto items-start">
          
          {/* Card Mensal */}
          <div className="relative rounded-2xl p-8 md:p-10 bg-[#111118] border border-white/[0.06] shadow-xl shadow-black/20 transition-all duration-300 hover:border-white/[0.1]">
            
            <h3 className="text-xl font-semibold text-white mb-1">{monthlyPlan.name}</h3>
            <p className="text-white/50 text-sm mb-8">{monthlyPlan.description}</p>

            <div className="mb-10">
              <span className="text-4xl md:text-5xl font-bold text-white">
                R$ {monthlyPlan.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-white/40 text-lg ml-1">{monthlyPlan.period}</span>
            </div>

            <button
              onClick={() => onStartSubscription(monthlyPlan.billingInterval)}
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 mb-10 border border-white/[0.12] text-white/80 hover:border-white/[0.2] hover:text-white bg-transparent"
            >
              {monthlyPlan.cta}
            </button>

            <div className="space-y-4">
              {monthlyPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#D4AF37]/70 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/60 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Anual - Destaque */}
          <div className="relative rounded-2xl p-8 md:p-10 bg-gradient-to-b from-[#14141c] to-[#111118] border border-[#D4AF37]/30 shadow-2xl shadow-black/30 transition-all duration-300">
            
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#D4AF37] text-[#0a0a0f] px-5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                {yearlyPlan.badge}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-1 mt-3">{yearlyPlan.name}</h3>
            <p className="text-white/50 text-sm mb-8">{yearlyPlan.description}</p>

            <div className="mb-2">
              <span className="text-4xl md:text-5xl font-bold text-[#D4AF37]">
                R$ {yearlyPlan.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-white/40 text-lg ml-1">{yearlyPlan.period}</span>
            </div>
            
            <p className="text-white/50 text-sm mb-5">
              ≈ R$ {yearlyPlan.monthlyEquivalent.toFixed(2).replace('.', ',')} <span className="text-white/40">/ mês</span>
            </p>
            
            {/* Savings Box */}
            <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl px-4 py-3 mb-10">
              <p className="text-[#D4AF37]/80 text-sm">
                {yearlyPlan.savings}
              </p>
            </div>

            <button
              onClick={() => onStartSubscription(yearlyPlan.billingInterval)}
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 mb-10 bg-[#D4AF37] hover:bg-[#c9a432] active:bg-[#b8952d] text-[#0a0a0f]"
            >
              {yearlyPlan.cta}
            </button>

            <div className="space-y-4">
              {yearlyPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#D4AF37]/70 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/60 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center max-w-2xl mx-auto">
          <p className="text-white/30 text-sm leading-relaxed">
            Produzimos em pequenos lotes, sem pasteurização, e enviamos direto da cervejaria para a sua geladeira. Por isso, as vagas são limitadas e assinantes anuais têm prioridade.
          </p>
        </div>
      </div>
    </section>
  )
}
