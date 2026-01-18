import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { getTenantSlug } from '@/stores/tenantStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fallback tenant para produção (domínio principal)
const DEFAULT_TENANT_SLUG = 'brewjaria'

// Add token and tenant to requests
api.interceptors.request.use((config) => {
  // Auth token
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  
  // Tenant header (multi-tenancy)
  // Prioridade: store > fallback
  const tenantSlug = getTenantSlug() || DEFAULT_TENANT_SLUG
  config.headers['X-Tenant'] = tenantSlug
  
  return config
})

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
}

export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
}

export const subscriptionsAPI = {
  createCheckoutSession: (data: {
    planSlug: string
    billingInterval: 'MONTHLY' | 'YEARLY'
  }) => api.post('/subscriptions/checkout-session', data),
  getSubscription: () => api.get('/subscriptions/me'),
  cancelSubscription: () => api.delete('/subscriptions/cancel'),
  pauseSubscription: () => api.post('/subscriptions/pause'),
  resumeSubscription: () => api.post('/subscriptions/resume'),
}

export const tenantsAPI = {
  provision: (data: {
    ownerName: string
    ownerEmail: string
    ownerPassword: string
    tenantName: string
    tenantSlug: string
    businessType: 'BEER' | 'WINE' | 'COFFEE' | 'SPIRITS' | 'TEA' | 'OTHER'
    currency?: string
    country?: string
    timezone?: string
  }) => api.post('/tenants/provision', data),
  checkSlug: (slug: string) => api.get(`/tenants/check-slug/${slug}`),
  getBySlug: (slug: string) => api.get(`/tenants/${slug}`),
  
  // Admin APIs
  updateSettings: (tenantId: string, data: {
    name?: string
    tagline?: string
    description?: string
    contact?: {
      email?: string
      phone?: string
      whatsapp?: string
      instagram?: string
      address?: string
    }
    theme?: {
      primaryColor?: string
      secondaryColor?: string
      backgroundColor?: string
      textColor?: string
    }
    content?: {
      heroTitle?: string
      heroSubtitle?: string
      ctaText?: string
    }
    images?: {
      logoUrl?: string
      heroImageUrl?: string
    }
    sections?: {
      featuresTitle?: string
      featuresSubtitle?: string
      features?: Array<{
        icon: string
        title: string
        description: string
      }>
    }
    testimonials?: Array<{
      name: string
      role: string
      content: string
      rating: number
    }>
    faq?: Array<{
      question: string
      answer: string
    }>
    layout?: {
      showTestimonials?: boolean
      showFAQ?: boolean
      showFeatures?: boolean
    }
  }) => api.put(`/tenants/${tenantId}/settings`, data),
  
  // Plans APIs
  getPlans: (tenantId: string) => api.get(`/tenants/${tenantId}/plans`),
  createPlan: (tenantId: string, data: {
    name: string
    description?: string
    price: number
    interval: 'monthly' | 'yearly'
    features?: string[]
    highlighted?: boolean
  }) => api.post(`/tenants/${tenantId}/plans`, data),
  updatePlan: (tenantId: string, planId: string, data: {
    name?: string
    description?: string
    price?: number
    interval?: 'monthly' | 'yearly'
    features?: string[]
    highlighted?: boolean
    active?: boolean
  }) => api.put(`/tenants/${tenantId}/plans/${planId}`, data),
  deletePlan: (tenantId: string, planId: string) => 
    api.delete(`/tenants/${tenantId}/plans/${planId}`),
}

export default api
