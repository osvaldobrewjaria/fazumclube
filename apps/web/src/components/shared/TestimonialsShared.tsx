'use client'

import { motion } from 'framer-motion'
import { useTenant } from '@/contexts/TenantContext'
import { Star, Quote } from 'lucide-react'

// Depoimentos genéricos padrão
const defaultTestimonials = [
  {
    name: 'Maria Silva',
    role: 'Assinante há 6 meses',
    content: 'Estou muito satisfeita com o serviço! A qualidade dos produtos é excelente e a entrega sempre chega no prazo.',
    rating: 5,
  },
  {
    name: 'João Santos',
    role: 'Assinante há 1 ano',
    content: 'Melhor decisão que tomei foi assinar. O custo-benefício é incrível e sempre me surpreendo com as novidades.',
    rating: 5,
  },
  {
    name: 'Ana Costa',
    role: 'Assinante há 3 meses',
    content: 'Atendimento impecável e produtos de primeira. Recomendo para todos os meus amigos!',
    rating: 5,
  },
]

export default function TestimonialsShared() {
  const { tenant } = useTenant()
  
  // Usa depoimentos do tenant se existirem, senão usa os padrões
  const testimonials = tenant.testimonials?.length 
    ? tenant.testimonials 
    : defaultTestimonials
  
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos assinantes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja a experiência de quem já faz parte da nossa comunidade
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              <p className="text-card-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <div>
                <p className="font-semibold text-card-foreground">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
