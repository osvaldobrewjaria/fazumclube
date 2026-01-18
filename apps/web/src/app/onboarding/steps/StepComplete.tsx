'use client'

import { CheckCircle, ArrowRight, Sparkles, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import type { OnboardingData } from '../page'

interface Props {
  data: OnboardingData
  onGoToDashboard: () => void
}

export function StepComplete({ data, onGoToDashboard }: Props) {
  return (
    <div className="text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
      >
        <CheckCircle className="w-12 h-12 text-green-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Parabéns! 🎉
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Seu clube <strong className="text-indigo-600">{data.tenantName}</strong> está pronto!
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-left"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Resumo do seu clube
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nome</span>
            <span className="font-medium text-gray-900">{data.tenantName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">URL</span>
            <span className="font-medium text-indigo-600">
              /t/{data.tenantSlug}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Administrador</span>
            <span className="font-medium text-gray-900">{data.ownerEmail}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Trial Ativo (14 dias)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-indigo-50 rounded-xl p-6 mb-8 text-left"
      >
        <h3 className="font-semibold text-indigo-900 mb-3">Próximos passos:</h3>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            Configure seus planos de assinatura
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            Conecte sua conta Stripe para receber pagamentos
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            Personalize sua página de vendas
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            Convide seus primeiros assinantes!
          </li>
        </ul>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onGoToDashboard}
        className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        Ir para o Dashboard
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Link to public page */}
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        href={`/t/${data.tenantSlug}`}
        target="_blank"
        className="inline-flex items-center gap-1 mt-4 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        Ver página pública
        <ExternalLink className="w-4 h-4" />
      </motion.a>
    </div>
  )
}
