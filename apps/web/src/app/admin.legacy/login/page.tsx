'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { authAPI } from '@/lib/api'

export default function AdminLogin() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.login({ email, password })
      const { user, accessToken, refreshToken } = response.data

      if (user.role !== 'ADMIN') {
        setError('Acesso negado. Apenas administradores podem acessar.')
        setIsLoading(false)
        return
      }

      setAuth(user, accessToken, refreshToken)
      router.push('/admin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f15] to-[#0a0a0f]" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-[420px] bg-gradient-to-b from-[#12121a] to-[#0e0e14] rounded-2xl p-10 border border-white/[0.04] shadow-2xl shadow-black/50">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          {/* Logo - Centralizado com dobra */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {/* Icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="10" width="24" height="22" rx="2" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <rect x="9" y="6" width="18" height="5" rx="1.5" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <path d="M12 16v10M20 16v10M28 16v10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <path d="M30 15c3 0 5 2 5 5s-2 5-5 5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            {/* Text - Duas linhas */}
            <div className="text-left leading-tight">
              <span className="block text-white font-bold text-xl tracking-wider">BREW</span>
              <span className="block text-white font-bold text-xl tracking-wider">JARIA<span className="text-[#D4AF37]">.</span></span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mx-auto mb-6" />

          {/* Title */}
          <h1 className="text-xl font-medium text-white/90 tracking-wide">
            Admin Login
          </h1>
          <p className="text-white/40 text-sm mt-2 tracking-wider">
            Área restrita para administradores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300/90 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/50 text-xs font-medium mb-2 tracking-wider uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#1a1a24] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)] transition-all duration-200"
              placeholder="admin@brewjaria.com.br"
              required
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs font-medium mb-2 tracking-wider uppercase">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#1a1a24] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)] transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#c9a432] active:bg-[#b8952d] text-[#0a0a0f] font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/10"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </div>

          <div className="text-center pt-4">
            <a 
              href="/esqueci-senha" 
              className="text-white/30 hover:text-white/50 text-xs tracking-wide transition-colors duration-200"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </form>

        {/* Subtle watermark */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="w-6 h-6 opacity-[0.03]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#D4AF37]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        </div>
      </div>
    </main>
  )
}
