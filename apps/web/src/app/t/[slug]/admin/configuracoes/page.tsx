'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { tenantsAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Building2, 
  Mail,
  Phone,
  Instagram,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function TenantSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { tenant } = useTenant()
  const { accessToken } = useAuthStore()
  const setTenantSlug = useTenantStore((state) => state.setSlug)
  const isAuthenticated = !!accessToken

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    address: '',
  })

  useEffect(() => {
    setTenantSlug(slug)
  }, [slug, setTenantSlug])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/t/${slug}/login`)
    }
  }, [isAuthenticated, router, slug])

  // Carregar dados do tenant da API
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const response = await tenantsAPI.getBySlug(slug)
        if (response.data.found) {
          const t = response.data.tenant
          setTenantId(t.id)
          const settings = t.settings || {}
          setFormData({
            name: t.name || '',
            tagline: t.tagline || '',
            description: t.description || '',
            email: settings.contact?.email || '',
            phone: settings.contact?.phone || '',
            whatsapp: settings.contact?.whatsapp || '',
            instagram: settings.contact?.instagram || '',
            address: settings.contact?.address || '',
          })
        }
      } catch (err) {
        console.error('Erro ao carregar tenant:', err)
      }
    }
    loadTenant()
  }, [slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await tenantsAPI.updateSettings(tenantId, {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        contact: {
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          address: formData.address,
        },
      })
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href={`/t/${slug}/admin`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Personalize seu clube de assinaturas</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
                <p className="text-sm text-gray-500">Dados principais do seu clube</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Clube
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Meu Clube de Assinaturas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="A melhor experiência em assinaturas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Descreva seu clube em poucas palavras..."
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contato</h2>
                <p className="text-sm text-gray-500">Como seus clientes podem te encontrar</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="contato@seuclube.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="@seuclube"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex items-center justify-end gap-4">
            {isSaved && (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Salvo com sucesso!
              </span>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
