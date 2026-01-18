'use client'

import { Beer, Factory, RefreshCw } from 'lucide-react'

const features = [
  {
    Icon: Beer,
    title: 'Seleção Ultrafresca',
    description: 'Lotes pequenos, envase profissional e entrega direta para garantir frescor máximo.',
  },
  {
    Icon: Factory,
    title: 'Produção sob Demanda',
    description: 'Nada de estoque parado. Produzimos para assinantes, no tempo certo da cerveja.',
  },
  {
    Icon: RefreshCw,
    title: 'Flexibilidade Total',
    description: 'Pause ou cancele quando quiser. Sem fidelidade e sem burocracia.',
  },
]

export default function Features() {
  return (
    <section className="pt-8 pb-10 md:pt-12 md:pb-16 px-4 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
            Por que escolher a Brewjaria?
          </h2>
          <p className="text-sm text-white/35 max-w-md mx-auto">
            Cerveja artesanal de verdade, do jeito que deveria ser
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 md:p-10 rounded-2xl bg-gradient-to-b from-[#13131a] to-[#111118] border border-white/[0.04] hover:border-[#D4AF37]/20 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-6">
                <feature.Icon className="w-8 h-8 text-[#D4AF37]/60 mx-auto" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-base font-medium text-white/90 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-white/25 text-xs tracking-wide">
            Entrega gratuita para São Paulo capital.
          </p>
        </div>
      </div>
    </section>
  )
}
