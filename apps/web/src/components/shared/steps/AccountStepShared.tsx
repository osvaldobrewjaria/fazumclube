'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'

export interface AccountData {
  name: string
  email: string
  password: string
}

interface AccountStepSharedProps {
  data: AccountData
  setData: (data: AccountData) => void
  onNext: () => void
  onBack?: () => void
  isLogin?: boolean
}

export default function AccountStepShared({
  data,
  setData,
  onNext,
  onBack,
  isLogin = false,
}: AccountStepSharedProps) {
  const [errors, setErrors] = useState<Partial<AccountData>>({})

  const validate = () => {
    const newErrors: Partial<AccountData> = {}
    
    if (!isLogin && !data.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    if (!data.email.trim() || !data.email.includes('@')) {
      newErrors.email = 'E-mail inválido'
    }
    if (!data.password || data.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        {isLogin ? 'Entrar na Conta' : 'Criar Conta'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Seu nome completo"
              />
            </div>
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm text-muted-foreground mb-2">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Sua senha"
            />
          </div>
          {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg
                   hover:opacity-90 transition-all"
        >
          {isLogin ? 'Entrar' : 'Continuar'}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 bg-secondary text-secondary-foreground font-medium rounded-lg
                     hover:opacity-90 transition-all"
          >
            Voltar
          </button>
        )}
      </form>
    </motion.div>
  )
}
