import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login']

// Define protected routes that require authentication
const protectedRoutes = [
  '/', // Root path (dashboard from route group)
  '/appointments',
  '/patients',
  '/doctors',
  '/clinics',
  '/billing',
  '/medical-records',
  '/prescriptions',
  '/analytics',
  '/settings',
  '/profile',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  const allCookies = request.cookies.getAll()

  // También verificar Authorization header como fallback
  const authHeader = request.headers.get('Authorization')
  const hasAuthToken = token || authHeader?.startsWith('Bearer ')

  console.log('🔍 Middleware Debug:')
  console.log('  - Pathname:', pathname)
  console.log('  - Access Token Cookie:', !!token)
  console.log('  - Access Token Length:', token ? token.length : 0)
  console.log(
    '  - Access Token Preview:',
    token ? `${token.substring(0, 20)}...` : 'none'
  )
  console.log('  - Refresh Token Cookie:', !!refreshToken)
  console.log('  - Authorization Header:', !!authHeader)
  console.log('  - Has Auth (any method):', hasAuthToken)
  console.log('  - All Cookies Count:', allCookies.length)
  console.log(
    '  - All Cookies Details:',
    allCookies.map((c) => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value ? c.value.length : 0,
      valuePreview: c.value ? `${c.value.substring(0, 10)}...` : 'empty',
    }))
  )

  // Log raw cookie header para debug profundo
  const rawCookieHeader = request.headers.get('cookie')
  console.log('  - Raw Cookie Header:', rawCookieHeader)

  // Headers relevantes para debug
  const relevantHeaders = {
    cookie: rawCookieHeader,
    authorization: authHeader,
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
  }
  console.log('  - Relevant Headers:', relevantHeaders)

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  console.log('  - Is Public Route:', isPublicRoute)
  console.log('  - Is Protected Route:', isProtectedRoute)

  // If user is not authenticated and trying to access protected route
  if (!hasAuthToken && isProtectedRoute) {
    console.log('  - 🚫 No auth token found, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access public auth routes
  if (hasAuthToken && isPublicRoute) {
    console.log(
      '  - ✅ Has auth token but on public route, redirecting to home'
    )
    return NextResponse.redirect(new URL('/', request.url))
  }

  // For protected routes with token, verify the token is valid
  if (hasAuthToken && isProtectedRoute) {
    console.log('  - ✅ Auth token found, allowing access to protected route')
  }

  console.log('  - ➡️  Allowing request to continue')
  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR)
     * - _next/dev (development files)
     * - __nextjs_source-map (source maps)
     * - favicon.ico (favicon file)
     * - .well-known (well-known directory)
     * - public folder
     * - Any file with extension (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|__nextjs_source-map|\\.well-known|favicon\\.ico|public|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
