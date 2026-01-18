'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

export default function HistoricoPagamentos() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user || !accessToken) {
        router.push('/')
      }
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [user, accessToken, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brew-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-brew-black">
      {/* Header */}
      <header className="bg-brew-gold py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Brewjaria" className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-brew-black hover:text-brew-black/70 transition font-semibold">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Histórico de Pagamentos</h1>

        <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-8 text-center">
          <p className="text-white/60 mb-6">Nenhum pagamento encontrado.</p>
          <p className="text-white/40 text-sm">
            Quando você realizar pagamentos, eles aparecerão aqui.
          </p>
        </div>
      </div>
    </main>
  )
}
