'use client'

import { motion } from 'framer-motion'
import { useTenant } from '@/contexts/TenantContext'

interface HeroSharedProps {
  onStartSubscription: () => void
}

export default function HeroShared({ onStartSubscription }: HeroSharedProps) {
  const { tenant } = useTenant()
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand */}
          <div className="mb-8">
            <h2 className="text-5xl md:text-7xl font-black text-primary leading-none tracking-tight">
              {tenant.brandText.line1}
              <br />
              <span className="ml-4">{tenant.brandText.line2}</span>
            </h2>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {tenant.hero.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {tenant.hero.subtitle}
          </p>
          
          {/* CTA */}
          <motion.button
            onClick={onStartSubscription}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-lg
                       hover:opacity-90 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tenant.hero.cta}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
