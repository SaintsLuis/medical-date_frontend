'use client'

import { useEffect } from 'react'
import { useAuthStore, initializeAuth } from '@/features/auth/store/auth'
import { useRouter, usePathname } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initializeAuth()
  }, [])

  useEffect(() => {
    // Configurar auto-refresh con un interval
    if (!isAuthenticated || isLoading) return

    // Verificar auth cada 10 minutos (antes de que expire el token de 15 min)
    const interval = setInterval(() => {
      console.log('🔄 Performing periodic auth check...')
      checkAuth()
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(interval)
  }, [isAuthenticated, isLoading, checkAuth])

  useEffect(() => {
    // Verificar auth cuando la página se enfoca nuevamente
    const handleFocus = () => {
      if (isAuthenticated && !isLoading) {
        console.log('🔄 Page focused, checking auth status...')
        checkAuth()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isAuthenticated, isLoading, checkAuth])

  useEffect(() => {
    // Verificar auth cuando se reanuda la conexión a internet
    const handleOnline = () => {
      if (isAuthenticated && !isLoading) {
        console.log('🔄 Connection restored, checking auth status...')
        checkAuth()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [isAuthenticated, isLoading, checkAuth])

  useEffect(() => {
    // Redirigir a login si no está autenticado y no está en página de login
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      console.log('🔒 User not authenticated, redirecting to login...')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  return <>{children}</>
}
