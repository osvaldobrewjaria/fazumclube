'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Home, Building } from 'lucide-react'

export interface AddressData {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

interface AddressStepSharedProps {
  data: AddressData
  setData: (data: AddressData) => void
  onNext: () => void
  onBack: () => void
}

export default function AddressStepShared({
  data,
  setData,
  onNext,
  onBack,
}: AddressStepSharedProps) {
  const [errors, setErrors] = useState<Partial<AddressData>>({})
  const [loading, setLoading] = useState(false)

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const result = await response.json()
      
      if (!result.erro) {
        setData({
          ...data,
          cep: cleanCep,
          street: result.logradouro || '',
          neighborhood: result.bairro || '',
          city: result.localidade || '',
          state: result.uf || '',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors: Partial<AddressData> = {}
    
    if (!data.cep || data.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido'
    }
    if (!data.street.trim()) {
      newErrors.street = 'Rua é obrigatória'
    }
    if (!data.number.trim()) {
      newErrors.number = 'Número é obrigatório'
    }
    if (!data.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório'
    }
    if (!data.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }
    if (!data.state.trim()) {
      newErrors.state = 'Estado é obrigatório'
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
        Endereço de Entrega
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CEP */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">CEP</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={data.cep}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                setData({ ...data, cep: value })
                if (value.length === 8) fetchCep(value)
              }}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="00000-000"
              disabled={loading}
            />
          </div>
          {errors.cep && <p className="text-destructive text-sm mt-1">{errors.cep}</p>}
        </div>

        {/* Street + Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-muted-foreground mb-2">Rua</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.street}
                onChange={(e) => setData({ ...data, street: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Rua, Avenida..."
              />
            </div>
            {errors.street && <p className="text-destructive text-sm mt-1">{errors.street}</p>}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Número</label>
            <input
              type="text"
              value={data.number}
              onChange={(e) => setData({ ...data, number: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="123"
            />
            {errors.number && <p className="text-destructive text-sm mt-1">{errors.number}</p>}
          </div>
        </div>

        {/* Complement */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Complemento (opcional)</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={data.complement || ''}
              onChange={(e) => setData({ ...data, complement: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Apto, Bloco..."
            />
          </div>
        </div>

        {/* Neighborhood */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Bairro</label>
          <input
            type="text"
            value={data.neighborhood}
            onChange={(e) => setData({ ...data, neighborhood: e.target.value })}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Bairro"
          />
          {errors.neighborhood && <p className="text-destructive text-sm mt-1">{errors.neighborhood}</p>}
        </div>

        {/* City + State */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-muted-foreground mb-2">Cidade</label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => setData({ ...data, city: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cidade"
            />
            {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Estado</label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => setData({ ...data, state: e.target.value.toUpperCase().slice(0, 2) })}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="UF"
            />
            {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg
                     hover:opacity-90 transition-all"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 bg-secondary text-secondary-foreground font-medium rounded-lg
                     hover:opacity-90 transition-all"
          >
            Voltar
          </button>
        </div>
      </form>
    </motion.div>
  )
}
