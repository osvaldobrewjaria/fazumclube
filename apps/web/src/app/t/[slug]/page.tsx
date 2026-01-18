'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'

// Componentes originais do Brewjaria
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import PricingToggle from '@/components/PricingToggle'
import SubscriptionFlow from '@/components/SubscriptionFlow'

// Componentes genéricos para outros tenants
import HeaderShared from '@/components/shared/HeaderShared'
import HeroShared from '@/components/shared/HeroShared'
import HowItWorksShared from '@/components/shared/HowItWorksShared'
import FeaturesShared from '@/components/shared/FeaturesShared'
import PricingShared from '@/components/shared/PricingShared'
import TestimonialsShared from '@/components/shared/TestimonialsShared'
import FAQShared from '@/components/shared/FAQShared'
import FooterShared from '@/components/shared/FooterShared'
import SubscriptionFlowShared from '@/components/shared/SubscriptionFlowShared'

export default function TenantPage() {
  const params = useParams()
  const slug = params.slug as string
  const [showFlow, setShowFlow] = useState(false)
  const [flowType, setFlowType] = useState<'signup' | 'login'>('signup')
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const { tenant, hasFeature } = useTenant()

  // Brewjaria usa os componentes originais customizados
  const isBrewjaria = slug === 'brewjaria'

  const handleSignup = (interval: 'MONTHLY' | 'YEARLY' = 'MONTHLY') => {
    setFlowType('signup')
    setBillingInterval(interval)
    setShowFlow(true)
  }

  const handleLogin = () => {
    setFlowType('login')
    setShowFlow(true)
  }

  // Renderização para Brewjaria (componentes originais)
  if (isBrewjaria) {
    return (
      <main className="min-h-screen bg-brew-black">
        {!showFlow ? (
          <>
            <Header onLoginClick={handleLogin} onSignupClick={() => handleSignup('MONTHLY')} />
            <Hero />
            <HowItWorks />
            <Features />
            <PricingToggle onStartSubscription={handleSignup} />
            <BrewjariaFooter />
          </>
        ) : (
          <SubscriptionFlow onClose={() => setShowFlow(false)} flowType={flowType} billingInterval={billingInterval} />
        )}
      </main>
    )
  }

  // Renderização para outros tenants (componentes genéricos)
  return (
    <main className="min-h-screen bg-background text-foreground">
      {!showFlow ? (
        <>
          <HeaderShared onLoginClick={handleLogin} onSignupClick={() => handleSignup()} />
          <HeroShared onStartSubscription={() => handleSignup()} />
          {hasFeature('showHowItWorks') && <HowItWorksShared />}
          {hasFeature('showFeatures') && <FeaturesShared />}
          <PricingShared onStartSubscription={() => handleSignup()} />
          {hasFeature('showTestimonials') && <TestimonialsShared />}
          {hasFeature('showFAQ') && <FAQShared />}
          <FooterShared />
        </>
      ) : (
        <SubscriptionFlowShared onClose={() => setShowFlow(false)} flowType={flowType} />
      )}
    </main>
  )
}

// Footer específico do Brewjaria
function BrewjariaFooter() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white leading-tight tracking-wider">
              BREW<br />
              <span className="ml-1">JARIA<span className="text-[#D4AF37]">.</span></span>
            </h3>
          </div>
          <div className="flex items-center justify-center gap-8 mb-6">
            <a href="https://www.instagram.com/brewjaria/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#D4AF37] transition text-sm">
              Contato
            </a>
            <a href="/t/brewjaria/privacidade" className="text-white/50 hover:text-[#D4AF37] transition text-sm">
              Privacidade
            </a>
            <a href="/t/brewjaria/termos" className="text-white/50 hover:text-[#D4AF37] transition text-sm">
              Termos de Serviço
            </a>
          </div>
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Brewjaria. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
