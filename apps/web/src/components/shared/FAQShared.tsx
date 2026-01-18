'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTenant } from '@/contexts/TenantContext'
import { ChevronDown } from 'lucide-react'

// FAQ genérico padrão
const defaultFAQ = [
  {
    question: 'Como funciona a assinatura?',
    answer: 'Você escolhe o plano ideal para você, realiza o pagamento e todo mês recebe os produtos selecionados diretamente na sua casa. Simples assim!',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. O cancelamento pode ser feito diretamente pela sua área de assinante.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'As entregas são realizadas entre os dias 1 e 10 de cada mês. Você receberá um código de rastreamento assim que seu pedido for despachado.',
  },
  {
    question: 'Posso trocar de plano?',
    answer: 'Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança será aplicada no próximo ciclo de cobrança.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer: 'Aceitamos cartão de crédito e PIX. O pagamento é processado automaticamente todo mês na data de renovação da sua assinatura.',
  },
]

export default function FAQShared() {
  const { tenant } = useTenant()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  
  // Usa FAQ do tenant se existir, senão usa o padrão
  const faqItems = tenant.faq?.length 
    ? tenant.faq 
    : defaultFAQ
  
  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre nossa assinatura
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {faqItems.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-background hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-foreground text-left">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-background border-t border-border">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
