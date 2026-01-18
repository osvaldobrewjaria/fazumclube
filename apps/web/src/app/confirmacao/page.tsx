'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { subscriptionsAPI } from '@/lib/api'

function ConfirmacaoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setStatus('error')
      setMessage('Sessão não encontrada')
      return
    }

    // Verify subscription
    const verifySubscription = async () => {
      try {
        const response = await subscriptionsAPI.getSubscription()
        if (response.data) {
          setStatus('success')
          setMessage('Assinatura ativada com sucesso!')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Erro ao verificar assinatura')
      }
    }

    verifySubscription()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brew-black via-brew-black to-brew-gold flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-brew-gold/30 border-t-secondary rounded-full animate-spin mx-auto" />
            <p className="text-white">Verificando assinatura...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl"
            >
              ✓
            </motion.div>
            <h1 className="text-4xl font-bold text-white">{message}</h1>
            <p className="text-white/80">
              Você receberá um email de confirmação em breve.
            </p>
            <button
              onClick={() => router.push('/minha-conta')}
              className="w-full px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all"
            >
              Ir para Minha Conta
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="text-6xl">✗</div>
            <h1 className="text-4xl font-bold text-red-400">{message}</h1>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all"
            >
              Voltar para Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brew-black flex items-center justify-center"><p className="text-white">Carregando...</p></div>}>
      <ConfirmacaoContent />
    </Suspense>
  )
}
