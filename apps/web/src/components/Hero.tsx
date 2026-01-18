"use client"

import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import HeroCarousel from './HeroCarousel'

export default function Hero() {
  const { user } = useAuthStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0f]">
      {/* Gradient transition from header */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      
      {/* Background decorative elements - more subtle */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Mobile: Carousel on top + Content below */}
      <div className="lg:hidden relative z-10">
        {/* Image Carousel - Full width, top */}
        <HeroCarousel />
        
        {/* Content below carousel */}
        <div className="px-7 pt-6 pb-10 space-y-6">
          <h1 className="text-[1.75rem] font-bold text-white leading-[1.25] tracking-tight">
            Você nunca bebeu{' '}
            <span className="text-[#c9a432]">cerveja</span>{' '}
            <span className="text-white/50">assim.</span>
          </h1>
          
          <p className="text-[13px] text-white/40 leading-[1.6]">
            Cervejas ultrafrescas em pequenos lotes.<br />
            Direto do tanque para a sua geladeira.
          </p>
          
          <div className="pt-4 pb-6">
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-[14px] bg-[#D4AF37] active:bg-[#b8952d] text-[#0a0a0f] font-semibold rounded-2xl transition-all shadow-lg shadow-[#D4AF37]/15"
            >
              Escolher Plano
            </button>
          </div>
        </div>
        
        {/* Stats - Mobile */}
        <div className="grid grid-cols-3 gap-4 px-6 py-6 border-t border-white/[0.04]">
          <div className="text-center">
            <p className="text-sm font-medium text-white/70">Pequenos Lotes</p>
            <p className="text-white/25 text-[10px] mt-1 uppercase tracking-wider">Produção</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/70">100% Frescor</p>
            <p className="text-white/25 text-[10px] mt-1 uppercase tracking-wider">Foco Total</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/70">Direto a Você</p>
            <p className="text-white/25 text-[10px] mt-1 uppercase tracking-wider">Entrega</p>
          </div>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden lg:block relative z-10 w-full px-4 py-20">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left side */}
            <div className="space-y-10">
              <motion.h1
                variants={itemVariants}
                className="text-5xl xl:text-6xl font-bold text-white leading-[1.15] tracking-tight"
              >
                Você nunca bebeu{' '}
                <span className="text-[#D4AF37]/90 font-semibold">cerveja</span>{' '}
                <span className="text-white/70">assim.</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg text-white/50 leading-relaxed max-w-md"
              >
                Cervejas artesanais ultra frescas, produzidas em pequenos lotes e entregues no auge do sabor.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-row gap-4 pt-2"
              >
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-[#D4AF37] hover:bg-[#c9a432] active:bg-[#b8952d] text-[#0a0a0f] font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#D4AF37]/10"
                >
                  Escolher Plano
                </button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-8 pt-10"
              >
                <span className="text-white/40 text-sm">Frete Grátis • SP Capital</span>
                <span className="text-white/20">•</span>
                <span className="text-white/40 text-sm">Cancele quando quiser</span>
                <span className="text-white/20">•</span>
                <span className="text-white/40 text-sm">Produção sob demanda</span>
              </motion.div>
            </div>

            {/* Right side - Image */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center"
            >
              <div className="w-full max-w-md">
                <img
                  src="/beer-bottle.png"
                  alt="Cerveja"
                  className="w-full h-auto rounded-2xl"
                  style={{ filter: 'saturate(0.9) contrast(1.05)' }}
                />
              </div>
            </motion.div>
          </div>

          {/* Stats - Desktop */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/[0.06]"
          >
            <div className="text-center">
              <p className="text-lg font-medium text-white/80">Pequenos Lotes</p>
              <p className="text-white/30 text-xs mt-1 tracking-wider uppercase">Produção</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white/80">100% Frescor</p>
              <p className="text-white/30 text-xs mt-1 tracking-wider uppercase">Foco Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white/80">Direto a Você</p>
              <p className="text-white/30 text-xs mt-1 tracking-wider uppercase">Entrega</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
