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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  console.log('Middleware - Pathname:', pathname, 'Token:', !!token)

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  console.log(
    'Middleware - IsPublic:',
    isPublicRoute,
    'IsProtected:',
    isProtectedRoute
  )

  // If user is not authenticated and trying to access protected route
  if (!token && isProtectedRoute) {
    console.log('Middleware - Redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access public auth routes
  if (token && isPublicRoute) {
    console.log('Middleware - Redirecting to dashboard')
    return NextResponse.redirect(new URL('/', request.url))
  }

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
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
}
