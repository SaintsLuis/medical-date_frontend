'use client'

import { useAuthStore } from '@/features/auth/store/auth'

/**
 * Componente que force un re-render completo de la aplicación
 * cuando cambia el usuario. Esto es más confiable que intentar
 * invalidar cache individual en Next.js 15.
 */
export function UserSessionGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  // Usar el ID del usuario como key para forzar re-render completo
  const sessionKey = user?.id || 'no-user'

  return (
    <div key={sessionKey} className='w-full h-full'>
      {children}
    </div>
  )
}
