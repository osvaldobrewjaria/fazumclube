'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'

interface HeaderSharedProps {
  onLoginClick?: () => void
  onSignupClick?: () => void
}

export default function HeaderShared({ onLoginClick, onSignupClick }: HeaderSharedProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { tenant } = useTenant()

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Planos', href: '#pricing' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="text-xl font-black text-primary leading-none tracking-tight">
              {tenant.brandText.line1}
              <br />
              <span className="text-sm">{tenant.brandText.line2}</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Entrar
            </button>
            <button
              onClick={onSignupClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold
                         hover:opacity-90 transition-all"
            >
              Assinar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-foreground/80 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-border space-y-3">
                <button
                  onClick={() => {
                    onLoginClick?.()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    onSignupClick?.()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-center"
                >
                  Assinar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
