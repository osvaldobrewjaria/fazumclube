'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'

export default function AssinaturaSucesso() {
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Parabéns!</h1>
        <p className="text-muted-foreground mb-6">
          Sua assinatura foi confirmada com sucesso! Você agora faz parte do {tenant?.name || 'clube'}.
        </p>
        <p className="text-muted-foreground/60 text-sm mb-8">
          Em breve você receberá um email com os detalhes da sua assinatura.
        </p>
        <Link
          href={`/t/${slug}`}
          className="inline-block px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
        >
          Voltar para o Início
        </Link>
      </div>
    </main>
  )
}
