'use client'

import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { OnboardingData } from '../page'

interface Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export function StepAccount({ data, updateData }: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu nome completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={data.ownerName}
              onChange={(e) => updateData({ ownerName: e.target.value })}
              placeholder="João Silva"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={data.ownerEmail}
              onChange={(e) => updateData({ ownerEmail: e.target.value })}
              placeholder="joao@empresa.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.ownerPassword}
              onChange={(e) => updateData({ ownerPassword: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Use pelo menos 8 caracteres
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>Você será o administrador</strong> do seu clube de assinaturas. 
          Poderá adicionar outros usuários depois.
        </p>
      </div>
    </div>
  )
}
