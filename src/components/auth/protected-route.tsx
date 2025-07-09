'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth'
import { Permission, UserRole } from '@/types/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuthStore()

  // Note: checkAuth is handled by AuthProvider at the root level

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(fallbackPath)
    }
  }, [isAuthenticated, isLoading, router, fallbackPath])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-sm text-muted-foreground'>
            Verificando autenticación...
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    )

    if (!hasRequiredPermissions) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center space-y-4'>
            <h1 className='text-2xl font-bold text-destructive'>
              Acceso Denegado
            </h1>
            <p className='text-muted-foreground'>
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => router.back()}
              className='text-primary hover:underline'
            >
              Volver atrás
            </button>
          </div>
        </div>
      )
    }
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role))

    if (!hasRequiredRole) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center space-y-4'>
            <h1 className='text-2xl font-bold text-destructive'>
              Acceso Denegado
            </h1>
            <p className='text-muted-foreground'>
              Tu rol no tiene acceso a esta página.
            </p>
            <button
              onClick={() => router.back()}
              className='text-primary hover:underline'
            >
              Volver atrás
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: Permission[],
  requiredRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredPermissions={requiredPermissions}
        requiredRoles={requiredRoles}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }
}
