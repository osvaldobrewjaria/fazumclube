'use client'

import { Store, Link, Beer, Wine, Coffee, Sparkles, Leaf, Package, Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { tenantsAPI } from '@/lib/api'
import type { OnboardingData, BusinessType } from '../page'

interface Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'BEER', label: 'Cerveja', icon: <Beer className="w-6 h-6" />, color: 'amber' },
  { value: 'WINE', label: 'Vinho', icon: <Wine className="w-6 h-6" />, color: 'purple' },
  { value: 'COFFEE', label: 'Café', icon: <Coffee className="w-6 h-6" />, color: 'brown' },
  { value: 'SPIRITS', label: 'Destilados', icon: <Sparkles className="w-6 h-6" />, color: 'blue' },
  { value: 'TEA', label: 'Chás', icon: <Leaf className="w-6 h-6" />, color: 'green' },
  { value: 'OTHER', label: 'Outro', icon: <Package className="w-6 h-6" />, color: 'gray' },
]

export function StepBusiness({ data, updateData }: Props) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [slugDebounce, setSlugDebounce] = useState<NodeJS.Timeout | null>(null)

  // Gerar slug automaticamente do nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    updateData({ tenantName: name })
    const slug = generateSlug(name)
    updateData({ tenantSlug: slug })
    checkSlugAvailability(slug)
  }

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    updateData({ tenantSlug: cleanSlug })
    checkSlugAvailability(cleanSlug)
  }

  const checkSlugAvailability = (slug: string) => {
    if (slugDebounce) clearTimeout(slugDebounce)
    
    if (slug.length < 3) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')
    
    const timeout = setTimeout(async () => {
      try {
        const response = await tenantsAPI.checkSlug(slug)
        setSlugStatus(response.data.available ? 'available' : 'taken')
      } catch {
        setSlugStatus('idle')
      }
    }, 500)

    setSlugDebounce(timeout)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="space-y-6">
        {/* Nome da marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da sua marca
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={data.tenantName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Meu Clube de Cervejas"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Slug/URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do seu clube
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={data.tenantSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="meu-clube"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 transition-all ${
                slugStatus === 'available' 
                  ? 'border-green-500 focus:ring-green-500' 
                  : slugStatus === 'taken'
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }} text-gray-900 placeholder-gray-400`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {slugStatus === 'checking' && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
              {slugStatus === 'available' && <Check className="w-5 h-5 text-green-500" />}
              {slugStatus === 'taken' && <X className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          <p className={`mt-1 text-xs ${
            slugStatus === 'available' ? 'text-green-600' : 
            slugStatus === 'taken' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {slugStatus === 'available' && '✓ URL disponível!'}
            {slugStatus === 'taken' && '✗ Esta URL já está em uso'}
            {slugStatus === 'idle' && `nextpay.com/t/${data.tenantSlug || 'seu-clube'}`}
            {slugStatus === 'checking' && 'Verificando disponibilidade...'}
          </p>
        </div>

        {/* Tipo de negócio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de negócio
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateData({ businessType: type.value })}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                  ${data.businessType === type.value 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                `}
              >
                {type.icon}
                <span className="mt-2 text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
