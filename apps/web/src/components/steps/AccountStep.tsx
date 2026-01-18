'use client'

import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface AccountStepProps {
  data: any
  onNext: (data: any) => void
  onClose: () => void
}

export default function AccountStep({ data, onNext, onClose }: AccountStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    password: data.password || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.register(formData)
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)
      onNext(formData)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          placeholder="João Silva"
        />
      </div>

      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          placeholder="seu@email.com"
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
          required
          minLength={8}
          className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}
