'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}
