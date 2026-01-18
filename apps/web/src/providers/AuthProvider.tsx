'use client'

import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore()

  useEffect(() => {
    // Initialize auth on mount
    if (accessToken) {
      // Token is already loaded from localStorage via Zustand persist
    }
  }, [accessToken])

  return <>{children}</>
}
