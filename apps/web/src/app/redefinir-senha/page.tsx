'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'

function RedefinirSenhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou expirado')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await authAPI.resetPassword({ token: token!, password })
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token inválido ou expirado')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-brew-black flex items-center justify-center px-4">
        <div className="bg-accent/10 backdrop-blur-sm rounded-xl p-8 w-full max-w-md border border-brew-gold/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Senha Redefinida!</h1>
            <p className="text-white/60 mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login...
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition"
            >
              Ir para Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brew-black flex items-center justify-center px-4">
      <div className="bg-accent/10 backdrop-blur-sm rounded-xl p-8 w-full max-w-md border border-brew-gold/20">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="Brewjaria" className="h-16 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
          <p className="text-white/60 mt-2">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-accent/40 focus:outline-none focus:border-brew-gold"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-accent/40 focus:outline-none focus:border-brew-gold"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-brew-gold hover:text-brew-gold/80 transition text-sm">
              ← Voltar ao login
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function RedefinirSenha() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-brew-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </main>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
