'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole, Permission } from '@/types/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: UserRole[]
  fallbackPath?: string
  showLoading?: boolean
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated || !user) {
        router.push(fallbackPath)
        return
      }

      // Verificar roles si se especifican
      if (requiredRoles.length > 0) {
        const userRoles = user.roles || []
        const hasRequiredRole = requiredRoles.some((role) =>
          userRoles.includes(role)
        )

        if (!hasRequiredRole) {
          // Redirigir a dashboard si no tiene permisos
          router.push('/')
          return
        }
      }

      // Verificar permisos si se especifican
      if (requiredPermissions.length > 0) {
        const { permissions } = useAuthStore.getState()
        const hasRequiredPermission = requiredPermissions.some((permission) =>
          permissions.includes(permission as Permission)
        )

        if (!hasRequiredPermission) {
          // Redirigir a dashboard si no tiene permisos
          router.push('/')
          return
        }
      }

      setIsChecking(false)
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    requiredRoles,
    requiredPermissions,
    router,
    fallbackPath,
  ])

  // Mostrar loading mientras se verifica autenticación
  if (isLoading || isChecking) {
    if (!showLoading) return null

    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Verificando permisos...</span>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}

// HOC para proteger componentes con roles específicos
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: string[],
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

// Componentes específicos para cada rol
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
  )
}

export function DoctorOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
      {children}
    </ProtectedRoute>
  )
}

export function SecretaryOnlyRoute({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.SECRETARY]}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminOrDoctorRoute({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.DOCTOR]}>
      {children}
    </ProtectedRoute>
  )
}
