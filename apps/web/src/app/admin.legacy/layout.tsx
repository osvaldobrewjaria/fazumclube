'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, accessToken } = useAuthStore()
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Login page doesn't need auth
    if (isLoginPage) {
      setAuthState('authenticated')
      return
    }

    // Check if we have auth
    if (!user || !accessToken) {
      setAuthState('unauthenticated')
      router.push('/admin/login')
      return
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      setAuthState('unauthenticated')
      router.push('/admin/login')
      return
    }

    setAuthState('authenticated')
  }, [user, accessToken, router, isLoginPage])

  // Show loading while checking auth
  if (authState === 'loading' || authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brew-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Login page doesn't use admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  return <AdminLayout>{children}</AdminLayout>
}
