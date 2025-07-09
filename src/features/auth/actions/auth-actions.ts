'use server'

import { cookies } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import { config } from '@/config/app'

interface LoginFormData {
  email: string
  password: string
  userType: 'admin' | 'doctor' | 'auto'
}

interface AuthResponse {
  success: boolean
  error?: string
  user?: unknown
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
    console.log('Full backend response:', responseData)

    // El backend devuelve: { statusCode: 200, data: { accessToken, refreshToken }, timestamp, lang }
    // Acceder a la estructura correcta
    const data = responseData.data

    console.log('Extracted data:', {
      hasAccessToken: !!data?.accessToken,
      hasRefreshToken: !!data?.refreshToken,
      accessTokenPreview: data?.accessToken
        ? `${data.accessToken.substring(0, 20)}...`
        : 'none',
      refreshTokenPreview: data?.refreshToken
        ? `${data.refreshToken.substring(0, 20)}...`
        : 'none',
    })

    // Verificar que tenemos los tokens necesarios
    if (!data || !data.accessToken) {
      console.error('❌ No access token in backend response!')
      console.error('Response structure:', responseData)
      return {
        success: false,
        error: 'No se recibió token de acceso del servidor',
      }
    }

    // Configurar cookies HttpOnly de forma segura siguiendo mejores prácticas Next.js 15
    const cookieStore = await cookies()

    // Obtener configuración para cookies
    const isProduction = process.env.NODE_ENV === 'production'

    console.log('Setting cookies...')
    console.log('Cookie config:', { isProduction })

    // Configurar access token (sin domain para evitar problemas en localhost)
    cookieStore.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
      // domain: NO especificar domain para que use el actual automáticamente
    })

    console.log(
      '✅ Access token cookie set successfully! Length:',
      data.accessToken.length,
      'Preview:',
      `${data.accessToken.substring(0, 30)}...`
    )

    // Configurar refresh token si existe
    if (data.refreshToken) {
      cookieStore.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
        // domain: NO especificar domain para que use el actual automáticamente
      })
      console.log(
        '✅ Refresh token cookie set successfully! Length:',
        data.refreshToken.length,
        'Preview:',
        `${data.refreshToken.substring(0, 30)}...`
      )
    }

    // Verificar que las cookies se configuraron - ARREGLADO
    const verifyToken = cookieStore.get('access_token')
    const verifyRefreshToken = cookieStore.get('refresh_token')
    console.log('🔍 Cookie verification after setting:')
    console.log('  - Access token cookie exists:', !!verifyToken)
    console.log('  - Access token has value:', !!verifyToken?.value)
    console.log('  - Access token length:', verifyToken?.value?.length || 0)
    console.log(
      '  - Access token preview:',
      verifyToken?.value
        ? `${verifyToken.value.substring(0, 30)}...`
        : 'no value'
    )
    console.log('  - Refresh token cookie exists:', !!verifyRefreshToken)
    console.log('  - Refresh token has value:', !!verifyRefreshToken?.value)

    // Verificar que las cookies se configuraron correctamente
    if (!verifyToken?.value) {
      console.error('❌ Failed to set access token cookie!')
      return {
        success: false,
        error: 'Error al configurar las cookies de autenticación',
      }
    }

    console.log('✅ Cookies set and verified successfully!')
    console.log('Proceeding with redirect to dashboard...')

    // IMPORTANTE: Pequeño delay para asegurar que las cookies se configuren completamente
    // Esto previene race conditions en Next.js 15
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Retornar éxito antes del redirect
    console.log('✅ Login successful, ready for redirect')
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

  // IMPORTANTE: redirect debe estar fuera del try/catch según mejores prácticas Next.js
  // redirect arroja un error internamente, por lo que debe estar fuera del try/catch
  //redirect('/', RedirectType.replace)
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
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    console.log('✅ Logout successful, cookies cleared')
  } catch (error) {
    console.error('Logout error:', error)
    // Limpiar cookies de todas formas
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
  }

  // IMPORTANTE: redirect debe estar fuera del try/catch según mejores prácticas Next.js
  redirect('/login', RedirectType.replace)
}

// Server Action para obtener perfil (para usar en Server Components)
export async function getProfileAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      console.log('❌ No access token found for profile request')
      return null
    }

    console.log('🔍 Fetching user profile from /auth/me...')
    console.log('Token preview:', `${token.substring(0, 30)}...`)

    const response = await fetch(`${config.API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`❌ Profile request failed with status: ${response.status}`)
      if (response.status === 401) {
        console.log('🔒 Token invalid, clearing cookies')
        // Token inválido, limpiar cookies
        const cookieStore = await cookies()
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')
      }
      return null
    }

    const responseData = await response.json()
    console.log('✅ Profile response received')
    console.log('Response structure:', {
      hasStatusCode: !!responseData.statusCode,
      hasData: !!responseData.data,
      hasTimestamp: !!responseData.timestamp,
      userEmail: responseData.data?.email,
      userRoles: responseData.data?.roles,
    })

    // Parsear la respuesta correctamente: responseData.data contiene la info del usuario
    return responseData.data
  } catch (error) {
    console.error('❌ Profile error:', error)
    return null
  }
}

// Función utilitaria para obtener token en Server Components
export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value || null
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
        httpOnly: 'hidden', // HttpOnly cookies no muestran su configuración
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
