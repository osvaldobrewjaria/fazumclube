'use client'

import { ClipboardList, UserPlus, CreditCard, Truck } from 'lucide-react'

const steps = [
  {
    title: 'Escolha seu Plano',
    description: 'Mensal ou anual, você decide.',
    Icon: ClipboardList,
  },
  {
    title: 'Faça seu Cadastro',
    description: 'Rápido e sem burocracia.',
    Icon: UserPlus,
  },
  {
    title: 'Realize o Pagamento',
    description: 'Seguro via cartão de crédito.',
    Icon: CreditCard,
  },
  {
    title: 'Receba e Aproveite',
    description: 'Direto na sua porta, todo mês.',
    Icon: Truck,
  },
]

export default function HowItWorks() {
  return (
    <section className="pt-10 pb-8 md:pt-16 md:pb-12 px-4 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight">
            Como Funciona
          </h2>
          <p className="text-sm text-white/40 tracking-wide">
            4 passos simples para começar
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group p-6 md:p-7 rounded-2xl bg-[#111118] border border-white/[0.04] hover:border-[#D4AF37]/20 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-5">
                <step.Icon className="w-6 h-6 text-[#D4AF37]/70" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-white/90 mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/40 text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
