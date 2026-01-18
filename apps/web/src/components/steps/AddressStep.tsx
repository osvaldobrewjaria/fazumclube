'use client'

import { useState } from 'react'
import { usersAPI } from '@/lib/api'

interface AddressStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  onClose: () => void
}

export default function AddressStep({
  data,
  onNext,
  onBack,
  onClose,
}: AddressStepProps) {
  const [formData, setFormData] = useState(data.address || {})
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [saveError, setSaveError] = useState('')

  // CEPs de São Paulo Capital: 01000-000 a 05999-999 e 08000-000 a 08499-999
  const isSaoPauloCapital = (cep: string, cidade: string, uf: string) => {
    const cepNum = parseInt(cep.replace(/\D/g, ''))
    const isSPCapitalCep = (cepNum >= 1000000 && cepNum <= 5999999) || (cepNum >= 8000000 && cepNum <= 8499999)
    return isSPCapitalCep && cidade === 'São Paulo' && uf === 'SP'
  }

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setCepLoading(true)
    setCepError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setCepError('CEP não encontrado')
        return
      }

      // Verificar se é São Paulo Capital
      if (!isSaoPauloCapital(cleanCep, data.localidade, data.uf)) {
        setCepError('Desculpe, no momento atendemos apenas São Paulo - Capital')
        setFormData((prev: any) => ({
          ...prev,
          street: '',
          district: '',
          city: '',
          state: '',
        }))
        return
      }

      setFormData((prev: any) => ({
        ...prev,
        street: data.logradouro || '',
        district: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }))
    } catch (error) {
      setCepError('Erro ao buscar CEP')
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)
    
    // Formatar CEP: 12345-678
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5)
    }
    
    setFormData({ ...formData, zipCode: value })
    setCepError('')

    // Buscar endereço quando CEP tiver 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaveError('')

    try {
      // Salvar endereço no backend
      await usersAPI.updateProfile({
        address: {
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          district: formData.district,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode.replace(/\D/g, ''),
        },
      })

      // Continuar para próximo passo
      onNext({ address: formData })
    } catch (err: any) {
      console.error('Erro ao salvar endereço:', err)
      setSaveError(err?.response?.data?.message || 'Erro ao salvar endereço. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveError && (
        <div className="p-3 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-sm">
          {saveError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            CEP
          </label>
          <div className="relative">
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode || ''}
              onChange={handleCepChange}
              required
              placeholder="01310-100"
              maxLength={9}
              className={`w-full px-4 py-3 bg-brew-black/50 border rounded-lg text-white placeholder-white/50 focus:border-brew-gold ${
                cepError ? 'border-red-500' : 'border-brew-gold/30'
              }`}
            />
            {cepLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {cepError && (
            <p className="text-red-500 text-sm mt-1">{cepError}</p>
          )}
          <p className="text-white/50 text-xs mt-1">
            * Atendemos apenas São Paulo - Capital
          </p>
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Rua
        </label>
        <input
          type="text"
          name="street"
          value={formData.street || ''}
          onChange={handleChange}
          required
          placeholder="Rua das Flores"
          className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Número
          </label>
          <input
            type="text"
            name="number"
            value={formData.number || ''}
            onChange={handleChange}
            required
            placeholder="123"
            className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white text-sm font-semibold mb-2">
            Complemento (Opcional)
          </label>
          <input
            type="text"
            name="complement"
            value={formData.complement || ''}
            onChange={handleChange}
            placeholder="Apto 42"
            className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Bairro
          </label>
          <input
            type="text"
            name="district"
            value={formData.district || ''}
            onChange={handleChange}
            required
            placeholder="Centro"
            className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Cidade
          </label>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            required
            placeholder="São Paulo"
            className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
          />
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Estado
        </label>
        <input
          type="text"
          name="state"
          value={formData.state || ''}
          onChange={handleChange}
          required
          placeholder="SP"
          maxLength={2}
          className="w-full px-4 py-3 bg-brew-black/50 border border-brew-gold/30 rounded-lg text-white placeholder-white/50 focus:border-brew-gold"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <div className="flex gap-3 sm:flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all text-sm sm:text-base"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition-all text-sm sm:text-base"
          >
            Cancelar
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:flex-1 px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition-all disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? 'Processando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}
