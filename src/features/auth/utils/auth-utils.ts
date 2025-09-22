import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types/auth'

/**
 * Utility functions for handling roles and permissions
 */

export const getUserPermissions = (roles: UserRole[]): Permission[] => {
  return roles.flatMap((role) => ROLE_PERMISSIONS[role] || [])
}

export const hasPermission = (
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const hasAnyPermission = (
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  )
}

export const hasAllPermissions = (
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  )
}

export const hasRole = (
  userRoles: UserRole[],
  requiredRole: UserRole
): boolean => {
  return userRoles.includes(requiredRole)
}

export const hasAnyRole = (
  userRoles: UserRole[],
  requiredRoles: UserRole[]
): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role))
}

export const isAdmin = (userRoles: UserRole[]): boolean => {
  return userRoles.includes(UserRole.ADMIN)
}

export const isDoctor = (userRoles: UserRole[]): boolean => {
  return userRoles.includes(UserRole.DOCTOR)
}

export const isPatient = (userRoles: UserRole[]): boolean => {
  return userRoles.includes(UserRole.PATIENT)
}

/**
 * Route permissions mapping
 * Define which permissions are required for each route
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '': [],
  '/appointments': [Permission.VIEW_APPOINTMENTS],
  '/patients': [Permission.VIEW_PATIENTS],
  '/doctors': [Permission.MANAGE_DOCTORS],
  '/medical-records': [Permission.VIEW_MEDICAL_RECORDS],
  '/prescriptions': [Permission.MANAGE_PRESCRIPTIONS],
  '/billing': [Permission.MANAGE_BILLING],
  '/billing/invoices': [Permission.MANAGE_BILLING],
  '/billing/payments': [Permission.MANAGE_BILLING],
  '/billing/reports': [Permission.MANAGE_BILLING],
  '/clinics': [Permission.MANAGE_CLINICS],
  '/clinics/schedules': [Permission.MANAGE_CLINICS],
  '/clinics/specialties': [Permission.MANAGE_CLINICS],
  '/analytics': [Permission.VIEW_ANALYTICS],
  '/analytics/reports': [Permission.VIEW_ANALYTICS],
  '/analytics/metrics': [Permission.VIEW_ANALYTICS],
}

/**
 * Route roles mapping
 * Define which roles can access each route
 */
export const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/doctors': [UserRole.ADMIN],
  '/billing': [UserRole.ADMIN],
  '/billing/invoices': [UserRole.ADMIN],
  '/billing/payments': [UserRole.ADMIN],
  '/billing/reports': [UserRole.ADMIN],
  '/clinics': [UserRole.ADMIN],
  '/clinics/schedules': [UserRole.ADMIN],
  '/clinics/specialties': [UserRole.ADMIN],
  '/analytics': [UserRole.ADMIN],
  '/analytics/reports': [UserRole.ADMIN],
  '/analytics/metrics': [UserRole.ADMIN],
}

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (
  route: string,
  userPermissions: Permission[],
  userRoles: UserRole[]
): boolean => {
  const requiredPermissions = ROUTE_PERMISSIONS[route] || []
  const requiredRoles = ROUTE_ROLES[route] || []

  // If no specific permissions or roles required, allow access
  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return true
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = hasAllPermissions(
      userPermissions,
      requiredPermissions
    )
    if (!hasRequiredPermissions) {
      return false
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(userRoles, requiredRoles)
    if (!hasRequiredRole) {
      return false
    }
  }

  return true
}
