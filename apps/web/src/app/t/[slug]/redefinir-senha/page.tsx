'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTenant } from '@/contexts/TenantContext'
import { authAPI } from '@/lib/api'

function RedefinirSenhaContent() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()
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
        router.push(`/t/${slug}/login`)
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token inválido ou expirado')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Senha Redefinida!</h1>
            <p className="text-muted-foreground mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login...
            </p>
            <Link
              href={`/t/${slug}/login`}
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
            >
              Ir para Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/t/${slug}`}>
            {tenant?.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="h-16 w-auto mx-auto mb-4" />
            ) : (
              <span className="text-2xl font-bold text-primary">{tenant?.name}</span>
            )}
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">Redefinir Senha</h1>
          <p className="text-muted-foreground mt-2">
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
            <label className="block text-muted-foreground text-sm font-medium mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-muted-foreground text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>

          <div className="text-center">
            <Link href={`/t/${slug}/login`} className="text-primary hover:text-primary/80 transition text-sm">
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
