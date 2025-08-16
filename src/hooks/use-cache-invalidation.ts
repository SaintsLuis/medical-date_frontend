import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getGlobalQueryClient } from '@/providers/react-query-provider'

/**
 * Hook para manejar la invalidación de caché basada en parámetros de URL
 * Útil para limpiar caché después de logout/login
 */
export function useCacheInvalidation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const clearCache = searchParams.get('clearCache')

    if (clearCache === 'true') {
      const queryClient = getGlobalQueryClient()
      if (queryClient) {
        console.log('🗑️ Clearing React Query cache due to clearCache param...')
        queryClient.clear()
      }

      // Limpiar localStorage de auth
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }

      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href)
      url.searchParams.delete('clearCache')
      router.replace(url.pathname, { scroll: false })
    }
  }, [searchParams, router])
}
