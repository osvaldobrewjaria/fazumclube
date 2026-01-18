'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'João Silva',
    role: 'Sommelier',
    image: '👨‍💼',
    text: 'Brewjaria trouxe uma experiência incrível para minha casa. Cada mês descubro cervejas que nunca havia experimentado.',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Empresária',
    image: '👩‍💼',
    text: 'O melhor investimento que fiz em lazer. A qualidade das cervejas e o atendimento são impecáveis.',
    rating: 5,
  },
  {
    name: 'Pedro Costa',
    role: 'Entusiasta de Cervejas',
    image: '👨‍🍳',
    text: 'Finalmente encontrei um clube que entende de cervejas artesanais de verdade. Recomendo para todos os meus amigos!',
    rating: 5,
  },
]

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-brew-black to-brew-black/95">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Milhares de pessoas já descobriram suas cervejas favoritas com Brewjaria
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 rounded-xl bg-brew-gold/5 border border-brew-gold/20 hover:border-brew-gold/40 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-brew-gold">⭐</span>
                ))}
              </div>

              <p className="text-white/80 leading-relaxed">{testimonial.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-block bg-brew-gold/10 border border-brew-gold/20 rounded-lg p-6">
            <p className="text-white/60 mb-2">Mais de</p>
            <p className="text-4xl font-bold text-brew-gold">5.000+</p>
            <p className="text-white/60">clientes satisfeitos</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
