'use client'

import { motion } from 'framer-motion'
import { useTenant } from '@/contexts/TenantContext'
import { Gift, Truck, Shield, Star, Heart, Zap, Package } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gift: Gift,
  truck: Truck,
  shield: Shield,
  star: Star,
  heart: Heart,
  zap: Zap,
  package: Package,
}

export default function FeaturesShared() {
  const { tenant } = useTenant()
  const { features } = tenant.sections
  
  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Gift
    return <Icon className="w-8 h-8" />
  }
  
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {features.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {features.subtitle}
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 mb-4 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
