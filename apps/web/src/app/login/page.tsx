'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function Login() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brew-black flex items-center justify-center px-4">
      <div className="bg-accent/10 backdrop-blur-sm rounded-xl p-8 w-full max-w-2xl border border-brew-gold/20">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brew-gold text-brew-black flex items-center justify-center font-bold text-sm">1</div>
            <div className="w-12 h-0.5 bg-brew-gold/30"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brew-gold/30 text-white/50 flex items-center justify-center font-bold text-sm">2</div>
            <div className="w-12 h-0.5 bg-brew-gold/30"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-brew-gold/30 text-white/50 flex items-center justify-center font-bold text-sm">3</div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-8">Entrar na Conta</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-accent/50 focus:border-brew-gold focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-accent/50 focus:border-brew-gold focus:outline-none"
              placeholder="Sua senha"
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <Link
              href="/assinatura"
              className="w-full px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all text-center"
            >
              Não tem conta? Cadastre-se
            </Link>

            <Link
              href="/"
              className="w-full px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all text-center"
            >
              Cancelar
            </Link>
          </div>

          <div className="text-center pt-4">
            <Link href="/esqueci-senha" className="text-brew-gold hover:text-brew-gold/80 text-sm">
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
