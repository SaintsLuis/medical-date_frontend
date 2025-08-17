'use client'

import { useQueryClient, QueryClient } from '@tanstack/react-query'

/**
 * Hook para manejar la invalidación de caché relacionada con autenticación
 */
export function useAuthCache() {
  const queryClient = useQueryClient()

  /**
   * Invalida todas las queries y limpia la caché
   * Útil para logout o cambio de usuario
   */
  const clearAuthCache = () => {
    console.log('🗑️ Clearing all React Query cache...')
    queryClient.clear()
  }

  /**
   * Invalida queries específicas del usuario
   * Útil para refresh de datos después de login
   */
  const invalidateUserQueries = () => {
    console.log('🔄 Invalidating user-specific queries...')

    // Invalidar queries relacionadas con el usuario actual
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey
        // Invalidar cualquier query que contenga datos del usuario
        return queryKey.some(
          (key) =>
            typeof key === 'string' &&
            (key.includes('appointments') ||
              key.includes('prescriptions') ||
              key.includes('medical-records') ||
              key.includes('doctors') ||
              key.includes('patients') ||
              key.includes('profile') ||
              key.includes('dashboard'))
        )
      },
    })
  }

  /**
   * Remueve queries en caché que contengan información sensible
   * Más específico que clearAuthCache
   */
  const removeSensitiveQueries = () => {
    console.log('🔒 Removing sensitive data from cache...')

    queryClient.removeQueries({
      predicate: (query) => {
        const queryKey = query.queryKey
        return queryKey.some(
          (key) =>
            typeof key === 'string' &&
            (key.includes('appointments') ||
              key.includes('prescriptions') ||
              key.includes('medical-records') ||
              key.includes('billing') ||
              key.includes('private'))
        )
      },
    })
  }

  return {
    clearAuthCache,
    invalidateUserQueries,
    removeSensitiveQueries,
    queryClient,
  }
}

/**
 * Función utilitaria para limpiar caché desde fuera de componentes React
 * NOTA: Solo usar esta función si tienes acceso al queryClient global
 */
export const clearAuthCacheGlobal = (queryClient: QueryClient) => {
  console.log('🗑️ Clearing auth cache globally...')
  queryClient.clear()
}
