import { useState, useCallback } from 'react'
import { apiClient, isAuthError } from '@/lib/api/client'
import { useAuthStore } from '@/features/auth/store/auth'
import { useRouter } from 'next/navigation'

interface UseApiOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
  autoRedirectOnAuthError?: boolean
}

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const { onSuccess, onError, autoRedirectOnAuthError = true } = options
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const { clearAuth } = useAuthStore()
  const router = useRouter()

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>
    ): Promise<{ data: T | null; error: Error | null }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const data = await apiCall()

        setState((prev) => ({ ...prev, data, isLoading: false }))
        onSuccess?.(data)

        return { data, error: null }
      } catch (error) {
        const errorInstance =
          error instanceof Error ? error : new Error('Unknown error')

        setState((prev) => ({
          ...prev,
          error: errorInstance,
          isLoading: false,
        }))

        // Manejar errores de autenticación
        if (isAuthError(error)) {
          console.log('🔒 Authentication error detected, clearing auth state')
          clearAuth()

          if (autoRedirectOnAuthError) {
            router.push('/login')
          }
        }

        onError?.(errorInstance)
        return { data: null, error: errorInstance }
      }
    },
    [onSuccess, onError, clearAuth, router, autoRedirectOnAuthError]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Hook específico para operaciones comunes
export function useApiCall<T = unknown>(options: UseApiOptions = {}) {
  const { execute, ...rest } = useApi<T>(options)

  const get = useCallback(
    (endpoint: string, requestOptions?: RequestInit) =>
      execute(() => apiClient.get<T>(endpoint, requestOptions)),
    [execute]
  )

  const post = useCallback(
    (endpoint: string, data?: unknown, requestOptions?: RequestInit) =>
      execute(() => apiClient.post<T>(endpoint, data, requestOptions)),
    [execute]
  )

  const put = useCallback(
    (endpoint: string, data?: unknown, requestOptions?: RequestInit) =>
      execute(() => apiClient.put<T>(endpoint, data, requestOptions)),
    [execute]
  )

  const patch = useCallback(
    (endpoint: string, data?: unknown, requestOptions?: RequestInit) =>
      execute(() => apiClient.patch<T>(endpoint, data, requestOptions)),
    [execute]
  )

  const del = useCallback(
    (endpoint: string, requestOptions?: RequestInit) =>
      execute(() => apiClient.delete<T>(endpoint, requestOptions)),
    [execute]
  )

  const uploadFile = useCallback(
    (
      endpoint: string,
      file: File,
      additionalData?: Record<string, string>,
      requestOptions?: RequestInit
    ) =>
      execute(() =>
        apiClient.uploadFile<T>(endpoint, file, additionalData, requestOptions)
      ),
    [execute]
  )

  return {
    ...rest,
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
  }
}

// Hook para polling con auto-refresh
export function useApiPolling<T = unknown>(
  apiCall: () => Promise<T>,
  interval: number = 30000, // 30 segundos por defecto
  options: UseApiOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...apiOptions } = options
  const { execute, ...rest } = useApi<T>(apiOptions)

  // En un hook real usarías useEffect con setInterval
  // Por simplicidad, aquí solo devolvemos el execute
  const startPolling = useCallback(() => {
    if (!enabled) return

    const poll = () => execute(apiCall)

    // Ejecutar inmediatamente
    poll()

    // Configurar interval
    const intervalId = setInterval(poll, interval)

    return () => clearInterval(intervalId)
  }, [execute, apiCall, interval, enabled])

  return {
    ...rest,
    startPolling,
  }
}

// Helper para crear hooks específicos de API
export function createApiHook<T = unknown>(
  apiCall: (params?: unknown) => Promise<T>
) {
  return function useCustomApi(params?: unknown, options: UseApiOptions = {}) {
    const { execute, ...rest } = useApi<T>(options)

    const call = useCallback(() => {
      return execute(() => apiCall(params))
    }, [execute, params])

    return {
      ...rest,
      call,
    }
  }
}
