import { cookies } from 'next/headers'
import { config } from '@/config/app'
import { refreshTokenAction } from '@/features/auth/actions/auth-actions'

/**
 * Cliente API para Server Actions con auto-refresh automático
 * Maneja la renovación de tokens transparentemente cuando expiran
 */

export interface ServerApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string | null
}

// Helper para manejar respuestas API con auto-refresh
export async function handleApiResponse<T = unknown>(
  response: Response
): Promise<ServerApiResponse<T>> {
  if (response.ok) {
    try {
      const data = await response.json()
      console.log('✅ Server API Success:', {
        status: response.status,
        url: response.url,
        hasData: !!data,
      })
      return { success: true, data: data.data || data }
    } catch (error) {
      console.error('❌ Failed to parse response JSON:', error)
      return {
        success: false,
        error: 'Error al procesar la respuesta del servidor',
      }
    }
  }

  const errorData = await response.json().catch(() => ({}))
  console.error('🚨 Server API Error:', {
    status: response.status,
    statusText: response.statusText,
    errorData,
    url: response.url,
    headers: Object.fromEntries(response.headers.entries()),
  })

  return {
    success: false,
    error:
      errorData.message ||
      `Error ${response.status}: ${response.statusText} - ${response.url}`,
  }
}

/**
 * Cliente API para Server Actions con auto-refresh automático
 * Detecta errores 401 y renueva el token automáticamente
 */
export async function serverFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    throw new Error('No authentication token available')
  }

  // Construir URL completa si es relativa
  const fullUrl = url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`

  console.log('🔗 Server API fetch:', {
    originalUrl: url,
    fullUrl,
    isRelative: !url.startsWith('http'),
  })

  // Configurar headers por defecto
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  // Primera tentativa con el token actual
  let response = await fetch(fullUrl, {
    ...options,
    headers,
    cache: 'no-store',
  })

  // Si es 401, intentar refresh automáticamente
  if (response.status === 401) {
    console.log('🔄 Server API: Token expired, attempting auto-refresh...')

    try {
      const refreshResult = await refreshTokenAction()

      if (refreshResult.success && refreshResult.newTokens) {
        console.log(
          '✅ Server API: Auto-refresh successful, retrying request...'
        )

        // Reintentar con el nuevo token
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${refreshResult.newTokens.accessToken}`,
        }

        response = await fetch(fullUrl, {
          ...options,
          headers: newHeaders,
          cache: 'no-store',
        })

        if (response.ok) {
          console.log('✅ Server API: Retry after refresh successful')
        } else {
          console.log(
            '❌ Server API: Retry after refresh still failed:',
            response.status
          )
        }
      } else {
        console.log(
          '❌ Server API: Auto-refresh failed, user needs to login again'
        )
        // El refresh ya limpia las cookies si falla
      }
    } catch (error) {
      console.error('❌ Server API: Refresh error:', error)
    }
  }

  return response
}

/**
 * Helpers de conveniencia para diferentes métodos HTTP
 */
export const serverApi = {
  async get<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<ServerApiResponse<T>> {
    try {
      console.log('🔗 Server API GET:', url)
      const response = await serverFetch(url, { ...options, method: 'GET' })
      return handleApiResponse<T>(response)
    } catch (error) {
      console.error('❌ Server API GET error:', {
        url,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      })

      if (error instanceof Error && error.message.includes('authentication')) {
        return {
          success: false,
          error: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        }
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: `Error de conexión al servidor: ${config.API_BASE_URL}`,
        }
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error desconocido en la solicitud.',
      }
    }
  },

  async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ServerApiResponse<T>> {
    try {
      const response = await serverFetch(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
      return handleApiResponse<T>(response)
    } catch (error) {
      console.error('Server API POST error:', error)

      if (error instanceof Error && error.message.includes('authentication')) {
        return {
          success: false,
          error: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        }
      }

      return { success: false, error: 'Error de red en la solicitud.' }
    }
  },

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ServerApiResponse<T>> {
    try {
      const response = await serverFetch(url, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      })
      return handleApiResponse<T>(response)
    } catch (error) {
      console.error('Server API PATCH error:', error)

      if (error instanceof Error && error.message.includes('authentication')) {
        return {
          success: false,
          error: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        }
      }

      return { success: false, error: 'Error de red en la solicitud.' }
    }
  },

  async delete<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<ServerApiResponse<T>> {
    try {
      const response = await serverFetch(url, { ...options, method: 'DELETE' })
      return handleApiResponse<T>(response)
    } catch (error) {
      console.error('Server API DELETE error:', error)

      if (error instanceof Error && error.message.includes('authentication')) {
        return {
          success: false,
          error: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        }
      }

      return { success: false, error: 'Error de red en la solicitud.' }
    }
  },
}

/**
 * Helper para construir URLs con query parameters
 */
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = `${config.API_BASE_URL}${endpoint}`

  if (!params) return url

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `${url}?${queryString}` : url
}

export default serverApi
