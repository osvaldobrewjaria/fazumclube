'use client'

import { motion } from 'framer-motion'

interface PricingProps {
  onStartSubscription: () => void
}

const plans = [
  {
    name: 'Mensal',
    price: '99,90',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      '4 cervejas artesanais premium',
      'Entrega grátis',
      'Notas de degustação',
      'Acesso à comunidade',
      'Cancelamento a qualquer momento',
    ],
    popular: false,
  },
  {
    name: 'Anual',
    price: '999,00',
    period: '/ano',
    description: 'Melhor valor',
    features: [
      '4 cervejas artesanais premium',
      'Entrega grátis',
      'Notas de degustação',
      'Acesso à comunidade',
      'Cancelamento a qualquer momento',
      '2 meses grátis',
      'Brindes exclusivos',
    ],
    popular: true,
  },
]

export default function Pricing({ onStartSubscription }: PricingProps) {
  return (
    <section className="py-10 px-4 bg-gradient-to-b from-brew-black/95 to-brew-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Planos Simples e Transparentes
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Sem taxas ocultas, sem compromisso de longo prazo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-br from-brew-gold/20 to-brew-gold/10 border-2 border-brew-gold scale-105 md:scale-110'
                  : 'bg-brew-gold/5 border border-brew-gold/20 hover:border-brew-gold/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brew-gold text-brew-black px-4 py-1 rounded-full text-sm font-bold">
                    Mais Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/60 mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-brew-gold">R$ {plan.price}</span>
                <span className="text-white/60 ml-2">{plan.period}</span>
              </div>

              <button
                onClick={onStartSubscription}
                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 mb-8 ${
                  plan.popular
                    ? 'bg-brew-gold text-brew-black hover:bg-brew-gold/90'
                    : 'bg-brew-gold/20 text-brew-gold hover:bg-brew-gold/30'
                }`}
              >
                Começar Agora
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-brew-gold mt-1">✓</span>
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-white/60">
            Todos os planos incluem 14 dias de garantia. Se não gostar, devolvemos 100% do seu dinheiro.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
