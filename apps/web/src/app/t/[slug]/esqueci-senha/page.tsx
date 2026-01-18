'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import { authAPI } from '@/lib/api'

export default function EsqueciSenha() {
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authAPI.forgotPassword({ email })
      setSuccess(true)
    } catch (err: any) {
      // Não revelar se o email existe ou não por segurança
      setSuccess(true)
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Enviado!</h1>
            <p className="text-muted-foreground mb-6">
              Se o email <strong className="text-foreground">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <p className="text-muted-foreground/60 text-sm mb-6">
              Verifique também sua caixa de spam.
            </p>
            <Link
              href={`/t/${slug}/login`}
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
            >
              Voltar ao Login
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
          <h1 className="text-2xl font-bold text-foreground mt-4">Esqueci minha senha</h1>
          <p className="text-muted-foreground mt-2">
            Digite seu email para receber o link de recuperação
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary"
              placeholder="seu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
