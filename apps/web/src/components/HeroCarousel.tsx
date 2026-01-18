'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image: '/beer-bottle.png',
    alt: 'Cervejas artesanais selecionadas',
    focus: 'person', // person = focus on face, product = focus on bottle
  },
  {
    image: '/beer-bottle.png',
    alt: 'Entrega grátis todo mês',
    focus: 'person',
  },
  {
    image: '/beer-bottle.png',
    alt: 'Experiência premium',
    focus: 'person',
  },
]

// Focus positions based on content type
const focusPositions = {
  person: '50% 18%',   // Higher focus for faces
  product: '50% 40%',  // Lower focus for product shots
  center: '50% 30%',   // Balanced
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(320px, 52vh, 420px)' }}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].alt}
            className="w-full h-full object-cover"
            style={{ 
              filter: 'saturate(0.92) contrast(1.02)',
              objectPosition: focusPositions[slides[currentSlide].focus as keyof typeof focusPositions] || focusPositions.center
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay - subtle, doesn't eat the image */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent pointer-events-none z-10" />

      {/* Navigation arrows - very subtle, swipe is primary */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/50 active:bg-black/40 transition z-20"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/50 active:bg-black/40 transition z-20"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Dots indicator - minimal */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white/60 w-4'
                : 'bg-white/20 w-1'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
