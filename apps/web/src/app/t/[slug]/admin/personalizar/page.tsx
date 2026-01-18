'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { tenantsAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Save,
  Loader2,
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Eye,
  CheckCircle,
  Upload,
  AlertCircle,
  Layers,
  Plus,
  Trash2,
  Gift,
  Truck,
  Shield,
  Star,
  Heart,
  Zap,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function TenantCustomizePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { accessToken } = useAuthStore()
  const setTenantSlug = useTenantStore((state) => state.setSlug)
  const isAuthenticated = !!accessToken

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cores' | 'textos' | 'imagens' | 'secoes' | 'depoimentos' | 'faq' | 'layout'>('cores')

  interface FeatureItem {
    icon: string
    title: string
    description: string
  }

  interface TestimonialItem {
    name: string
    role: string
    content: string
    rating: number
  }

  interface FAQItem {
    question: string
    answer: string
  }

  const [formData, setFormData] = useState({
    // Cores
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    
    // Textos
    heroTitle: 'Assine e receba todo mês',
    heroSubtitle: 'Os melhores produtos selecionados para você',
    ctaText: 'Quero Assinar',
    
    // Imagens
    logoUrl: '',
    heroImageUrl: '',
    
    // Seções
    featuresTitle: 'Por que escolher a gente?',
    featuresSubtitle: 'Benefícios exclusivos para assinantes',
    features: [] as FeatureItem[],
    
    // Depoimentos
    testimonials: [] as TestimonialItem[],
    
    // FAQ
    faq: [] as FAQItem[],
    
    // Layout
    showTestimonials: true,
    showFAQ: true,
    showFeatures: true,
  })

  useEffect(() => {
    setTenantSlug(slug)
  }, [slug, setTenantSlug])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/t/${slug}/login`)
    }
  }, [isAuthenticated, router, slug])

  // Carregar dados do tenant
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const response = await tenantsAPI.getBySlug(slug)
        if (response.data.found) {
          const t = response.data.tenant
          setTenantId(t.id)
          const settings = t.settings || {}
          setFormData(prev => ({
            ...prev,
            primaryColor: settings.theme?.primaryColor || prev.primaryColor,
            secondaryColor: settings.theme?.secondaryColor || prev.secondaryColor,
            backgroundColor: settings.theme?.backgroundColor || prev.backgroundColor,
            textColor: settings.theme?.textColor || prev.textColor,
            heroTitle: settings.content?.heroTitle || prev.heroTitle,
            heroSubtitle: settings.content?.heroSubtitle || prev.heroSubtitle,
            ctaText: settings.content?.ctaText || prev.ctaText,
            logoUrl: settings.images?.logoUrl || prev.logoUrl,
            heroImageUrl: settings.images?.heroImageUrl || prev.heroImageUrl,
            featuresTitle: settings.sections?.featuresTitle || prev.featuresTitle,
            featuresSubtitle: settings.sections?.featuresSubtitle || prev.featuresSubtitle,
            features: settings.sections?.features || prev.features,
            testimonials: settings.testimonials || prev.testimonials,
            faq: settings.faq || prev.faq,
            showTestimonials: settings.layout?.showTestimonials ?? prev.showTestimonials,
            showFAQ: settings.layout?.showFAQ ?? prev.showFAQ,
            showFeatures: settings.layout?.showFeatures ?? prev.showFeatures,
          }))
        }
      } catch (err) {
        console.error('Erro ao carregar tenant:', err)
      }
    }
    loadTenant()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await tenantsAPI.updateSettings(tenantId, {
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
        },
        content: {
          heroTitle: formData.heroTitle,
          heroSubtitle: formData.heroSubtitle,
          ctaText: formData.ctaText,
        },
        images: {
          logoUrl: formData.logoUrl,
          heroImageUrl: formData.heroImageUrl,
        },
        sections: {
          featuresTitle: formData.featuresTitle,
          featuresSubtitle: formData.featuresSubtitle,
          features: formData.features,
        },
        testimonials: formData.testimonials,
        faq: formData.faq,
        layout: {
          showTestimonials: formData.showTestimonials,
          showFAQ: formData.showFAQ,
          showFeatures: formData.showFeatures,
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

  const tabs = [
    { id: 'cores', label: 'Cores', icon: Palette },
    { id: 'textos', label: 'Textos', icon: Type },
    { id: 'imagens', label: 'Imagens', icon: ImageIcon },
    { id: 'secoes', label: 'Benefícios', icon: Layers },
    { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'layout', label: 'Layout', icon: Layout },
  ]

  const iconOptions = [
    { value: 'gift', label: 'Presente', Icon: Gift },
    { value: 'truck', label: 'Entrega', Icon: Truck },
    { value: 'shield', label: 'Segurança', Icon: Shield },
    { value: 'star', label: 'Estrela', Icon: Star },
    { value: 'heart', label: 'Coração', Icon: Heart },
    { value: 'zap', label: 'Raio', Icon: Zap },
  ]

  // Features
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { icon: 'gift', title: '', description: '' }]
    })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setFormData({ ...formData, features: newFeatures })
  }

  // Testimonials
  const addTestimonial = () => {
    setFormData({
      ...formData,
      testimonials: [...formData.testimonials, { name: '', role: '', content: '', rating: 5 }]
    })
  }

  const removeTestimonial = (index: number) => {
    setFormData({
      ...formData,
      testimonials: formData.testimonials.filter((_, i) => i !== index)
    })
  }

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string | number) => {
    const newTestimonials = [...formData.testimonials]
    newTestimonials[index] = { ...newTestimonials[index], [field]: value }
    setFormData({ ...formData, testimonials: newTestimonials })
  }

  // FAQ
  const addFAQ = () => {
    setFormData({
      ...formData,
      faq: [...formData.faq, { question: '', answer: '' }]
    })
  }

  const removeFAQ = (index: number) => {
    setFormData({
      ...formData,
      faq: formData.faq.filter((_, i) => i !== index)
    })
  }

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const newFAQ = [...formData.faq]
    newFAQ[index] = { ...newFAQ[index], [field]: value }
    setFormData({ ...formData, faq: newFAQ })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link 
            href={`/t/${slug}/admin`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Personalizar Página de Vendas</h1>
              <p className="text-gray-600">Customize a aparência da sua página pública</p>
            </div>
            <Link
              href={`/t/${slug}`}
              target="_blank"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Eye className="w-5 h-5" />
              Visualizar Página
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            
            {/* Cores */}
            {activeTab === 'cores' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Esquema de Cores</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Principal
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Secundária
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor de Fundo
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor do Texto
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-8 p-6 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 mb-4">Pré-visualização:</p>
                  <div 
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: formData.backgroundColor }}
                  >
                    <h4 
                      className="text-xl font-bold mb-2"
                      style={{ color: formData.primaryColor }}
                    >
                      Título de Exemplo
                    </h4>
                    <p style={{ color: formData.textColor }}>
                      Este é um texto de exemplo para visualizar as cores.
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Botão de Ação
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Textos */}
            {activeTab === 'textos' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Textos da Página</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal (Hero)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Assine e receba todo mês"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <textarea
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Os melhores produtos selecionados para você"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Botão (CTA)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Quero Assinar"
                  />
                </div>
              </div>
            )}

            {/* Imagens */}
            {activeTab === 'imagens' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagens</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {formData.logoUrl && (
                    <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                      <img src={formData.logoUrl} alt="Logo preview" className="max-h-20 mx-auto" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Principal (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                  {formData.heroImageUrl && (
                    <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                      <img src={formData.heroImageUrl} alt="Banner preview" className="max-h-40 mx-auto rounded" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                  💡 Dica: Use serviços como Imgur, Cloudinary ou seu próprio servidor para hospedar as imagens.
                </p>
              </div>
            )}

            {/* Seções */}
            {activeTab === 'secoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefícios / Features</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título da Seção
                    </label>
                    <input
                      type="text"
                      value={formData.featuresTitle}
                      onChange={(e) => setFormData({ ...formData, featuresTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Por que escolher a gente?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.featuresSubtitle}
                      onChange={(e) => setFormData({ ...formData, featuresSubtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Benefícios exclusivos para assinantes"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Itens de Benefícios</h4>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  {formData.features.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum benefício adicionado</p>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Adicionar primeiro benefício
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Ícone</label>
                              <select
                                value={feature.icon}
                                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                              >
                                {iconOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                                <input
                                  type="text"
                                  value={feature.title}
                                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                  placeholder="Ex: Frete Grátis"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                                <input
                                  type="text"
                                  value={feature.description}
                                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                  placeholder="Ex: Entrega grátis em todo o Brasil"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Depoimentos */}
            {activeTab === 'depoimentos' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Depoimentos de Clientes</h3>
                
                <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg mb-6">
                  💡 Adicione depoimentos reais de clientes satisfeitos. Se não adicionar nenhum, serão exibidos depoimentos genéricos.
                </p>

                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Lista de Depoimentos</h4>
                  <button
                    type="button"
                    onClick={addTestimonial}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>

                {formData.testimonials.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum depoimento personalizado</p>
                    <p className="text-sm text-gray-400 mt-1">Depoimentos genéricos serão exibidos</p>
                    <button
                      type="button"
                      onClick={addTestimonial}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Adicionar primeiro depoimento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.testimonials.map((testimonial, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                                <input
                                  type="text"
                                  value={testimonial.name}
                                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                  placeholder="Maria Silva"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cargo/Descrição</label>
                                <input
                                  type="text"
                                  value={testimonial.role}
                                  onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                  placeholder="Assinante há 6 meses"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Depoimento</label>
                              <textarea
                                value={testimonial.content}
                                onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 resize-none"
                                rows={3}
                                placeholder="Estou muito satisfeita com o serviço..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Avaliação</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateTestimonial(index, 'rating', star)}
                                    className={`p-1 ${testimonial.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    <Star className="w-6 h-6 fill-current" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTestimonial(index)}
                            className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
                
                <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg mb-6">
                  💡 Adicione as perguntas mais comuns dos seus clientes. Se não adicionar nenhuma, serão exibidas perguntas genéricas sobre assinatura.
                </p>

                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Lista de Perguntas</h4>
                  <button
                    type="button"
                    onClick={addFAQ}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>

                {formData.faq.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma pergunta personalizada</p>
                    <p className="text-sm text-gray-400 mt-1">Perguntas genéricas serão exibidas</p>
                    <button
                      type="button"
                      onClick={addFAQ}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Adicionar primeira pergunta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.faq.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Pergunta</label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                placeholder="Como funciona a assinatura?"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Resposta</label>
                              <textarea
                                value={item.answer}
                                onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 resize-none"
                                rows={3}
                                placeholder="Você escolhe o plano ideal para você..."
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFAQ(index)}
                            className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Layout */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seções da Página</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900">Depoimentos</span>
                      <p className="text-sm text-gray-500">Mostrar seção de depoimentos de clientes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showTestimonials}
                      onChange={(e) => setFormData({ ...formData, showTestimonials: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900">FAQ</span>
                      <p className="text-sm text-gray-500">Mostrar perguntas frequentes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showFAQ}
                      onChange={(e) => setFormData({ ...formData, showFAQ: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900">Benefícios</span>
                      <p className="text-sm text-gray-500">Mostrar seção de benefícios/features</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showFeatures}
                      onChange={(e) => setFormData({ ...formData, showFeatures: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Botão Salvar */}
          <div className="flex items-center justify-end gap-4 mt-6">
            {error && (
              <span className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                {error}
              </span>
            )}
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
