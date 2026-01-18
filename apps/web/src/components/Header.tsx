'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

interface HeaderProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Planos', href: '#pricing' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#c4a030] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 py-2.5 md:px-6 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Brewjaria"
              className="h-6 md:h-8 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#1a1a1a]/60 hover:text-[#1a1a1a]/90 transition-colors duration-200 text-sm font-normal tracking-wide"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right side - Auth or User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              // User Menu
              <div className="relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#1a1a1a]/8 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a]/15 flex items-center justify-center text-[10px] font-medium text-[#1a1a1a]/70">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-[#1a1a1a]/60 hidden sm:inline text-sm">{user.name || 'Usuário'}</span>
                  <svg
                    className={`w-3 h-3 text-[#1a1a1a]/40 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-brew-black border border-brew-gold/20 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-brew-gold/20">
                        <p className="text-white font-semibold">{user.name || 'Usuário'}</p>
                        <p className="text-white/60 text-sm">{user.email || ''}</p>
                      </div>
                      <nav className="py-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onSignupClick()
                          }}
                          className="w-full text-left px-4 py-2 text-brew-gold font-semibold hover:bg-brew-gold/20 transition-colors"
                        >
                          🍺 Assinar Plano
                        </button>
                        <div className="border-t border-brew-gold/20 my-2" />
                        <Link
                          href="/minha-conta"
                          className="block px-4 py-2 text-white hover:bg-brew-gold/20 transition-colors"
                        >
                          Minha Conta
                        </Link>
                        <Link
                          href="/minha-assinatura"
                          className="block px-4 py-2 text-white hover:bg-brew-gold/20 transition-colors"
                        >
                          Minha Assinatura
                        </Link>
                        <Link
                          href="/pagamentos"
                          className="block px-4 py-2 text-white hover:bg-brew-gold/20 transition-colors"
                        >
                          Histórico de Pagamentos
                        </Link>
                        <div className="border-t border-brew-gold/20 my-2" />
                        <button
                          onClick={() => {
                            logout()
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Sair
                        </button>
                      </nav>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Auth Buttons
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={onLoginClick}
                  className="hidden sm:inline px-4 py-1.5 text-[#1a1a1a]/60 hover:text-[#1a1a1a]/90 text-sm transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-[#D4AF37] text-sm font-medium rounded-lg transition-all active:scale-[0.98]"
                >
                  Assinar
                </button>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-[#1a1a1a]/70 hover:bg-[#1a1a1a]/10 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pt-4 border-t border-brew-gold/20 space-y-2"
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-brew-black/80 hover:text-brew-gold hover:bg-brew-gold/20 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      onLoginClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex-1 px-4 py-2 text-brew-black font-bold border border-brew-black rounded-lg hover:bg-brew-black/20 transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex-1 px-4 py-2 bg-brew-black text-brew-gold font-bold rounded-lg hover:bg-brew-black/90 transition-colors"
                  >
                    Assinar
                  </button>
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
