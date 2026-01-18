'use client'

import { CreditCard, ExternalLink, Shield, AlertCircle } from 'lucide-react'
import type { OnboardingData } from '../page'

interface Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export function StepPayments({ data, updateData }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Receba pagamentos</h3>
          <p className="text-gray-600 mt-2">
            Conecte sua conta Stripe para receber pagamentos dos seus assinantes
          </p>
        </div>

        {/* Stripe Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12" viewBox="0 0 60 25" fill="none">
                <path d="M59.64 14.28c0-4.88-2.36-8.72-6.88-8.72-4.56 0-7.28 3.84-7.28 8.68 0 5.72 3.24 8.6 7.88 8.6 2.28 0 4-0.52 5.28-1.24v-3.8c-1.28 0.64-2.76 1.04-4.64 1.04-1.84 0-3.48-0.64-3.68-2.88h9.28c0-0.24 0.04-1.24 0.04-1.68zm-9.36-1.8c0-2.16 1.32-3.04 2.52-3.04 1.16 0 2.4 0.88 2.4 3.04h-4.92zM38.4 5.56c-1.84 0-3.04 0.88-3.68 1.48l-0.24-1.16h-4.16v22.12l4.72-1v-5.36c0.68 0.48 1.68 1.16 3.32 1.16 3.36 0 6.4-2.68 6.4-8.64 0.04-5.48-3.08-8.6-6.36-8.6zm-1.12 13.24c-1.12 0-1.76-0.4-2.2-0.88v-6.96c0.48-0.56 1.16-0.92 2.2-0.92 1.68 0 2.84 1.88 2.84 4.36 0 2.52-1.12 4.4-2.84 4.4zM24.96 4.32l4.76-1.04V0l-4.76 1v3.32zM24.96 5.88h4.76v16.68h-4.76V5.88zM20.16 7.4l-0.28-1.52h-4.08v16.68h4.72v-11.32c1.12-1.44 3-1.2 3.6-0.96V5.88c-0.64-0.24-2.88-0.68-3.96 1.52zM10.96 2.04l-4.6 0.96-0.02 15.28c0 2.84 2.12 4.92 4.96 4.92 1.56 0 2.72-0.28 3.36-0.64v-3.84c-0.6 0.24-3.58 1.12-3.58-1.68V9.72h3.58V5.88h-3.58l-0.12-3.84zM0 10.04c0-0.6 0.48-0.84 1.28-0.84 1.16 0 2.6 0.36 3.76 0.96V5.92c-1.24-0.52-2.48-0.72-3.76-0.72C0.52 5.2 0 6.88 0 8.56c0 4.24 5.84 3.56 5.84 5.4 0 0.72-0.6 0.96-1.48 0.96-1.28 0-2.92-0.52-4.2-1.24v4.28c1.44 0.6 2.88 0.88 4.2 0.88 2.76 0 5.48-1.12 5.48-4.56 0.04-4.56-5.84-3.76-5.84-5.24z" fill="#635BFF"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Stripe</h4>
              <p className="text-sm text-gray-600 mt-1">
                Plataforma líder mundial em pagamentos online. 
                Aceite cartões de crédito, débito, Pix e mais.
              </p>
            </div>
          </div>
        </div>

        {/* MVP Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Configuração do Stripe</strong>
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Você poderá conectar sua conta Stripe após criar seu clube. 
                Por enquanto, vamos configurar seu ambiente primeiro.
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Seus dados estão seguros</span>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0%</p>
            <p className="text-sm text-gray-600">Taxa da plataforma*</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">D+2</p>
            <p className="text-sm text-gray-600">Recebimento</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          *Taxas do Stripe aplicadas normalmente (2.99% + R$0.39 por transação)
        </p>
      </div>
    </div>
  )
}
