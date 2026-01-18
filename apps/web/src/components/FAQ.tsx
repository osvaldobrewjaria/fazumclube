'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    question: 'Como funciona a assinatura?',
    answer:
      'Você escolhe um plano (mensal ou anual), paga uma vez e recebe 4 cervejas artesanais selecionadas no mês seguinte. A cada mês, você recebe uma nova seleção. É simples assim!',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Você pode cancelar sua assinatura a qualquer momento sem penalidades. Se cancelar, você não será cobrado no próximo ciclo de faturamento.',
  },
  {
    question: 'Qual é o valor do frete?',
    answer:
      'O frete é totalmente grátis para todo o Brasil! Independentemente de onde você mora, você não paga nada pelo envio das suas cervejas.',
  },
  {
    question: 'Como é feita a seleção das cervejas?',
    answer:
      'Nossa equipe de especialistas em cervejas artesanais seleciona cuidadosamente as melhores opções do mês. Buscamos diversidade de estilos, regiões e cervejarias para que você tenha sempre uma experiência nova.',
  },
  {
    question: 'Posso escolher as cervejas que quero?',
    answer:
      'A seleção é feita por nossos especialistas para garantir qualidade e surpresa. Porém, você pode informar suas preferências e restrições (alergias, estilos que não gosta) no seu perfil.',
  },
  {
    question: 'Quanto tempo leva para chegar?',
    answer:
      'O envio é feito no início de cada mês. Dependendo da sua localização, o prazo de entrega é de 5 a 10 dias úteis. Você receberá um código de rastreamento por email.',
  },
  {
    question: 'E se eu não gostar das cervejas?',
    answer:
      'Oferecemos uma garantia de 100% de satisfação. Se você não gostar, pode devolver as cervejas não abertas para reembolso total. Sem perguntas, sem burocracia.',
  },
  {
    question: 'Posso pausar minha assinatura?',
    answer:
      'Sim! Você pode pausar sua assinatura por até 3 meses. Quando quiser retomar, é só acessar sua conta e reativar. Nenhuma cobrança durante o período de pausa.',
  },
  {
    question: 'Qual é a diferença entre os planos?',
    answer:
      'O plano mensal custa R$ 99,90/mês. O plano anual custa R$ 999,00/ano (o equivalente a 10 meses), dando 2 meses grátis. Ambos incluem as mesmas 4 cervejas, frete grátis e acesso à comunidade.',
  },
  {
    question: 'Como funciona o programa de referência?',
    answer:
      'Indique um amigo e ganhe R$ 50 em crédito para sua próxima assinatura. Seu amigo também ganha R$ 50 de desconto na primeira compra. Sem limite de indicações!',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Tire suas dúvidas sobre a Brewjaria e como funciona nossa assinatura
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-brew-gold/20 rounded-lg overflow-hidden hover:border-brew-gold/40 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-brew-gold/5 hover:bg-brew-gold/10 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-white text-left">
                  {faq.question}
                </h3>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-6 text-brew-gold flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-brew-gold/20"
                  >
                    <div className="px-6 py-4 bg-brew-black">
                      <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 p-8 rounded-xl bg-gradient-to-r from-brew-gold/20 to-brew-gold/10 border border-brew-gold/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ainda tem dúvidas?
            </h3>
            <p className="text-white/70 mb-6">
              Entre em contato com nosso time de suporte. Estamos aqui para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:suporte@brewjaria.com"
                className="px-6 py-3 bg-brew-gold hover:bg-brew-gold/90 text-brew-black font-bold rounded-lg transition-all duration-300 hover:scale-105"
              >
                Enviar Email
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-brew-gold text-brew-gold hover:bg-brew-gold/10 font-bold rounded-lg transition-all duration-300"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
