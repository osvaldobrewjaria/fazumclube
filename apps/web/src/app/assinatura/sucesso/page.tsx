'use client'

import Link from 'next/link'

export default function AssinaturaSucesso() {
  return (
    <main className="min-h-screen bg-brew-black flex items-center justify-center px-4">
      <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-4">Parabéns!</h1>
        <p className="text-white/80 mb-6">
          Sua assinatura foi confirmada com sucesso! Você agora faz parte do Clube Brewjaria.
        </p>
        <p className="text-white/60 text-sm mb-8">
          Em breve você receberá um email com os detalhes da sua assinatura.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition"
        >
          Voltar para o Início
        </Link>
      </div>
    </main>
  )
}
