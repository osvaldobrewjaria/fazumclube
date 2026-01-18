'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usersAPI, subscriptionsAPI } from '@/lib/api'
import Link from 'next/link'
import { User, MapPin, Package, Edit2, Lock, LogOut, Check } from 'lucide-react'

interface UserProfile {
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    district: string
    city: string
    state: string
    zipCode: string
  }
}

interface SubscriptionData {
  id: string
  status: string
  plan: { name: string; description: string }
  currentPeriodEnd?: string
}

export default function MinhaConta() {
  const router = useRouter()
  const { user, accessToken, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'perfil' | 'endereco' | 'assinatura'>('perfil')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [subError, setSubError] = useState(false)
  const [formData, setFormData] = useState({
    name: '', phone: '', street: '', number: '', complement: '',
    district: '', city: '', state: '', zipCode: '',
  })

  useEffect(() => {
    const loadData = async () => {
      if (!user || !accessToken) {
        router.push('/')
        return
      }
      try {
        const profileRes = await usersAPI.getProfile()
        setProfile(profileRes.data.profile)
        try {
          const subRes = await subscriptionsAPI.getSubscription()
          setSubscription(subRes.data)
          setSubError(false)
        } catch (err: any) {
          // 404 = sem assinatura, outros = erro real
          if (err?.response?.status === 404) {
            setSubscription(null)
          } else {
            setSubError(true)
          }
        }
        setFormData({
          name: user.name || '',
          phone: profileRes.data.profile?.phone || '',
          street: profileRes.data.profile?.address?.street || '',
          number: profileRes.data.profile?.address?.number || '',
          complement: profileRes.data.profile?.address?.complement || '',
          district: profileRes.data.profile?.address?.district || '',
          city: profileRes.data.profile?.address?.city || '',
          state: profileRes.data.profile?.address?.state || '',
          zipCode: profileRes.data.profile?.address?.zipCode || '',
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [user, accessToken, router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      // Montar payload - só incluir endereço se campos obrigatórios estiverem preenchidos
      const payload: any = {
        name: formData.name,
        phone: formData.phone || undefined,
      }
      
      // Só enviar endereço se os campos obrigatórios estiverem preenchidos
      if (formData.street && formData.number && formData.district && formData.city && formData.state && formData.zipCode) {
        payload.address = {
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          district: formData.district,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
      }
      
      await usersAPI.updateProfile(payload)
      
      // Recarregar perfil para atualizar os dados na tela
      const profileRes = await usersAPI.getProfile()
      setProfile(profileRes.data.profile)
      
      setMessage('Dados salvos com sucesso!')
      setIsEditing(false)
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      const errorMsg = err?.response?.data?.message || 'Erro ao salvar dados'
      setMessage(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brew-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  const TabButton = ({ tab, icon: Icon, label }: { tab: 'perfil' | 'endereco' | 'assinatura', icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setIsEditing(false); setMessage(''); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        activeTab === tab ? 'bg-brew-gold text-brew-black font-semibold' : 'text-white hover:bg-brew-gold/10'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  )

  return (
    <main className="min-h-screen bg-brew-black">
      {/* Header */}
      <header className="bg-brew-gold py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Brewjaria" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-brew-black hover:text-brew-black/70 transition font-semibold">← Voltar</Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-brew-black hover:text-brew-black/70 transition font-semibold">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Minha Conta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-4 space-y-2">
              <div className="flex flex-col items-center py-4 border-b border-brew-gold/20 mb-4">
                <div className="w-16 h-16 rounded-full bg-brew-gold/20 flex items-center justify-center text-2xl font-bold text-brew-gold mb-2">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h2 className="text-white font-semibold">{user.name || 'Usuário'}</h2>
                <p className="text-white/60 text-sm">{user.email || ''}</p>
              </div>
              <TabButton tab="perfil" icon={User} label="Meus Dados" />
              <TabButton tab="endereco" icon={MapPin} label="Endereço de Entrega" />
              <TabButton tab="assinatura" icon={Package} label="Minha Assinatura" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-brew-black/50 border border-brew-gold/20 rounded-xl p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('sucesso') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {message}
                </div>
              )}

              {/* Tab: Perfil */}
              {activeTab === 'perfil' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><User size={20} className="text-brew-gold" /> Meus Dados</h2>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-brew-gold hover:text-brew-gold/80"><Edit2 size={16} /> Editar</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Nome Completo</label>
                      {isEditing ? <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{user.name}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Email</label>
                      <p className="text-white py-3">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Telefone</label>
                      {isEditing ? <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.phone || 'Não informado'}</p>}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-4 pt-4 border-t border-brew-gold/20">
                      <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition">Cancelar</button>
                    </div>
                  )}
                  <div className="pt-4 border-t border-brew-gold/20">
                    <button className="flex items-center gap-2 text-brew-gold hover:text-brew-gold/80"><Lock size={16} /> Alterar Senha</button>
                  </div>
                </div>
              )}

              {/* Tab: Endereço */}
              {activeTab === 'endereco' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin size={20} className="text-brew-gold" /> Endereço de Entrega</h2>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-brew-gold hover:text-brew-gold/80"><Edit2 size={16} /> Editar</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">CEP</label>
                      {isEditing ? <input type="text" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} placeholder="00000-000" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.zipCode || 'Não informado'}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm mb-2">Rua</label>
                      {isEditing ? <input type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} placeholder="Nome da rua" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.street || 'Não informado'}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Número</label>
                      {isEditing ? <input type="text" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} placeholder="123" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.number || '-'}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Complemento</label>
                      {isEditing ? <input type="text" value={formData.complement} onChange={(e) => setFormData({...formData, complement: e.target.value})} placeholder="Apto, Bloco" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.complement || '-'}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Bairro</label>
                      {isEditing ? <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} placeholder="Bairro" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.district || '-'}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Cidade</label>
                      {isEditing ? <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Cidade" className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.city || '-'}</p>}
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Estado</label>
                      {isEditing ? <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="SP" maxLength={2} className="w-full px-4 py-3 bg-brew-black border border-brew-gold/30 rounded-lg text-white placeholder-white/30 focus:border-brew-gold outline-none" /> : <p className="text-white py-3">{profile?.address?.state || '-'}</p>}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-4 pt-4 border-t border-brew-gold/20">
                      <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar Endereço'}</button>
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition">Cancelar</button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Assinatura */}
              {activeTab === 'assinatura' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package size={20} className="text-brew-gold" /> Minha Assinatura</h2>
                  {subError && (
                    <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-300 border border-red-500/30">
                      Erro ao carregar assinatura. Tente novamente mais tarde.
                    </div>
                  )}
                  {!subError && subscription ? (
                    <div className="space-y-4">
                      <div className="bg-brew-gold/10 border border-brew-gold/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-bold">{subscription.plan.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {subscription.status === 'ACTIVE' ? 'Ativa' : subscription.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{subscription.plan.description}</p>
                        {subscription.currentPeriodEnd && (
                          <p className="text-white/60 text-sm mt-2">Próxima cobrança: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 border border-brew-gold/30 text-white rounded-lg hover:bg-brew-gold/10 transition">Alterar Plano</button>
                        <button className="px-6 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition">Cancelar Assinatura</button>
                      </div>
                    </div>
                  ) : !subError && (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-white/30 mb-4" />
                      <p className="text-white/60 mb-4">Você ainda não possui uma assinatura ativa.</p>
                      <Link href="/#pricing" className="inline-block px-6 py-3 bg-brew-gold text-brew-black font-bold rounded-lg hover:bg-brew-gold/90 transition">Ver Planos Disponíveis</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
