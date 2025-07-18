// lib/api/client.ts
import { config } from '@/config/app'
import { useAuthStore } from '@/features/auth/store/auth'

// Configuración del cliente API
export class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = config.API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    console.log('🔧 ApiClient initialized with baseURL:', this.baseURL)
  }

  // Método principal para hacer requests con auto-refresh
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const method = options.method || 'GET'

    console.log(`🌐 API Request: ${method} ${url}`)
    console.log('📋 Request options:', {
      method,
      headers: options.headers,
      body: options.body ? 'Present' : 'None',
    })

    // Configurar headers por defecto
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    }

    console.log('📤 Request headers:', headers)

    // Primera tentativa
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Incluir cookies HTTP-only
    })

    console.log(`📥 Response status: ${response.status} ${response.statusText}`)
    console.log(
      '📥 Response headers:',
      Object.fromEntries(response.headers.entries())
    )

    // Si obtenemos 401, intentar refresh automáticamente
    if (response.status === 401) {
      console.log('🔄 API call returned 401, attempting token refresh...')

      const { refreshAuth, isRefreshing } = useAuthStore.getState()

      // Si ya hay un refresh en progreso, esperar un poco y reintentar
      if (isRefreshing) {
        console.log('⏳ Refresh in progress, waiting...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } else {
        // Intentar refresh
        const refreshSuccess = await refreshAuth()

        if (!refreshSuccess) {
          console.log('❌ Refresh failed, redirecting to login...')
          // El refresh falló, el store ya hizo logout
          throw new Error('Session expired')
        }
      }

      // Reintentar la request original con el nuevo token
      console.log('🔄 Retrying original request after refresh...')
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      console.log(
        `📥 Retry response status: ${response.status} ${response.statusText}`
      )
    }

    // Manejar otros errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }

    // Parsear respuesta JSON
    const data = await response.json()
    console.log('📦 Response data:', data)

    // Si el backend usa la estructura { statusCode, data, timestamp }
    if (data.statusCode !== undefined && data.data !== undefined) {
      console.log('✅ API call successful, returning data')
      return data.data as T
    }

    // Si es una respuesta directa
    console.log('✅ API call successful, returning direct response')
    return data as T
  }

  // Métodos de conveniencia
  async get<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  // Método para subir archivos
  async uploadFile<T = unknown>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options: RequestInit = {}
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type para FormData, el browser lo configura automáticamente
        Accept: 'application/json',
        ...options.headers,
      },
    })
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient()

// Hook para usar el cliente API en componentes
export const useApiClient = () => {
  return apiClient
}

// Función helper para verificar si un error es de autenticación
export const isAuthError = (error: unknown): boolean => {
  return error instanceof Error && error.message === 'Session expired'
}
