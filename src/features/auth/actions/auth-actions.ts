'use server'

import { cookies } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import { config } from '@/config/app'

interface LoginFormData {
  email: string
  password: string
  userType: 'admin' | 'doctor' | 'secretary' | 'auto'
}

interface AuthResponse {
  success: boolean
  error?: string
  user?: unknown
}

interface RefreshResponse {
  success: boolean
  error?: string
  newTokens?: {
    accessToken: string
    refreshToken: string
  }
}

// Server Action para login
export async function loginAction(
  formData: LoginFormData
): Promise<AuthResponse | never> {
  try {
    // Determinar endpoint según el tipo de usuario
    let endpoint = '/auth/login/admin' // Por defecto admin
    if (formData.userType === 'doctor') {
      endpoint = '/auth/login/doctor'
    } else if (formData.userType === 'secretary') {
      endpoint = '/auth/login-secretary'
    }

    console.log(`Login attempt for: ${formData.email} as ${formData.userType}`)
    console.log(`Using endpoint: ${config.API_BASE_URL}${endpoint}`)

    // Hacer fetch directo al backend NestJS
    const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Login failed:', errorData)
      return {
        success: false,
        error: errorData.message || 'Error de autenticación',
      }
    }

    const responseData = await response.json()
    console.log('Login successful, parsing backend response...')

    // El backend devuelve: { statusCode: 200, data: { accessToken, refreshToken }, timestamp, lang }
    // Acceder a la estructura correcta
    const data = responseData.data

    console.log('Extracted data:', {
      hasAccessToken: !!data?.accessToken,
      hasRefreshToken: !!data?.refreshToken,
    })

    // Verificar que tenemos los tokens necesarios
    if (!data || !data.accessToken) {
      console.error('❌ No access token in backend response!')
      return {
        success: false,
        error: 'No se recibió token de acceso del servidor',
      }
    }

    // Configurar cookies HttpOnly de forma segura
    await setAuthCookies(data.accessToken, data.refreshToken)

    console.log('✅ Login successful, cookies set')
    return {
      success: true,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para refresh token
export async function refreshTokenAction(): Promise<RefreshResponse> {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      console.log('❌ No refresh token found')
      return {
        success: false,
        error: 'No refresh token available',
      }
    }

    console.log('🔄 Attempting token refresh...')

    // Llamar al endpoint de refresh del backend
    const response = await fetch(`${config.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    })

    if (!response.ok) {
      console.error(`❌ Refresh failed with status: ${response.status}`)

      // Si el refresh token también expiró, limpiar cookies
      if (response.status === 401) {
        await clearAuthCookies()
      }

      return {
        success: false,
        error: 'Refresh token expired or invalid',
      }
    }

    const responseData = await response.json()
    const data = responseData.data

    if (!data?.accessToken) {
      console.error('❌ No new access token in refresh response')
      return {
        success: false,
        error: 'Invalid refresh response',
      }
    }

    // Actualizar cookies con los nuevos tokens
    await setAuthCookies(data.accessToken, data.refreshToken)

    console.log('✅ Token refreshed successfully')
    return {
      success: true,
      newTokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    }
  } catch (error) {
    console.error('❌ Refresh token error:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para logout
export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    // Intentar hacer logout en el backend
    if (token) {
      try {
        await fetch(`${config.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.warn('Backend logout error:', error)
      }
    }

    // Limpiar cookies
    await clearAuthCookies()
    console.log('✅ Logout successful, cookies cleared')
  } catch (error) {
    console.error('Logout error:', error)
    // Limpiar cookies de todas formas
    await clearAuthCookies()
  }

  // Redirect fuera del try/catch
  redirect('/login', RedirectType.replace)
}

// Server Action para obtener perfil (con auto-refresh)
export async function getProfileAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      console.log('❌ No access token found for profile request')
      return null
    }

    console.log('🔍 Fetching user profile from /auth/me...')

    let response = await fetch(`${config.API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
    })

    // Si el token expiró (401), intentar refresh automáticamente
    if (response.status === 401) {
      console.log('🔄 Token expired, attempting auto-refresh...')

      const refreshResult = await refreshTokenAction()

      if (refreshResult.success && refreshResult.newTokens) {
        console.log('✅ Auto-refresh successful, retrying profile request...')

        // Reintentar con el nuevo token
        response = await fetch(`${config.API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${refreshResult.newTokens.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Language': 'en',
          },
          cache: 'no-store',
        })
      } else {
        console.log('❌ Auto-refresh failed, user needs to login again')
        await clearAuthCookies()
        return null
      }
    }

    if (!response.ok) {
      console.error(`❌ Profile request failed with status: ${response.status}`)
      if (response.status === 401) {
        await clearAuthCookies()
      }
      return null
    }

    const responseData = await response.json()
    console.log('✅ Profile response received')

    return responseData.data
  } catch (error) {
    console.error('❌ Profile error:', error)
    return null
  }
}

// Función utilitaria para obtener token en Server Components (con auto-refresh)
export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return null
    }

    // Verificar si el token está próximo a expirar
    // En un entorno real, podrías decodificar el JWT para verificar exp
    // Por ahora, intentamos usar el token y si falla, hacemos refresh

    return token
  } catch (error) {
    console.error('Error getting server token:', error)
    return null
  }
}

// Helper: Configurar cookies de autenticación
async function setAuthCookies(accessToken: string, refreshToken?: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  // Configurar access token
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  // Configurar refresh token si existe
  if (refreshToken) {
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    })
  }

  console.log('✅ Auth cookies set successfully')
}

// Helper: Limpiar cookies de autenticación
async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  console.log('✅ Auth cookies cleared')
}

// Función de debug para verificar cookies (temporal)
export async function debugCookies() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const accessToken = cookieStore.get('access_token')
    const refreshToken = cookieStore.get('refresh_token')

    console.log(
      '🍪 Server Debug - All Cookies:',
      allCookies.map((c) => ({
        name: c.name,
        value: c.value.substring(0, 20) + '...',
        httpOnly: 'hidden',
      }))
    )

    return {
      accessToken: accessToken
        ? {
            exists: true,
            preview: accessToken.value.substring(0, 20) + '...',
          }
        : null,
      refreshToken: refreshToken
        ? {
            exists: true,
            preview: refreshToken.value.substring(0, 20) + '...',
          }
        : null,
      totalCookies: allCookies.length,
      cookieNames: allCookies.map((c) => c.name),
    }
  } catch (error) {
    console.error('Debug cookies error:', error)
    return { error: 'Failed to read cookies' }
  }
}
