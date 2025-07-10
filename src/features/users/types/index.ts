// src/features/users/types/index.ts

// ========================
// Tipos Principales
// ========================

/**
 * Representa un usuario en el sistema.
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phoneNumber: string | null
  isActive: boolean
  otpEnabled: boolean
  lastLoginAt: string | null
  userType: string
  hasPatientProfile: boolean
  hasDoctorProfile: boolean
  roles: Array<{
    roleId: string
    roleName: string
    roleDescription: string
  }>
  createdAt: string
  updatedAt: string
  patientProfile?: {
    id: string
    userId: string
    bloodType: string | null
    gender: string | null
    allergies: string[]
    profilePhoto: string | null
  } | null
  doctorProfile?: {
    id: string
    userId: string
    license: string
    experience: number | null
    consultationFee: number | null
    profilePhoto: string | null
    specialties: Array<{
      specialtyId: string
      specialty: {
        id: string
        name: string
      }
    }>
  } | null
}

/**
 * Usuario con información extendida para listas.
 */
export interface UserWithDetails extends User {
  roleDisplay: string
  statusDisplay: string
  lastActivity: string
}

// ========================
// Tipos para API & Actions
// ========================

/**
 * Datos para actualizar un usuario existente (según endpoint PATCH /api/users/{id}).
 */
export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  isActive?: boolean
  otpEnabled?: boolean
}

/**
 * Parámetros para filtrar y paginar la lista de usuarios.
 */
export interface QueryUsersParams {
  page?: number
  limit?: number
  search?: string
  userType?: string
  isActive?: boolean
  includePatientProfile?: boolean
  includeDoctorProfile?: boolean
  includeRoles?: boolean
  sortBy?: string
  sortOrder?: string
}

/**
 * Estructura de la respuesta paginada desde la API.
 */
export interface PaginatedUsersResponse {
  data: User[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

/**
 * Estadísticas clave sobre los usuarios.
 */
export interface BackendUserStats {
  total: number
  active: number
  patients: number
  doctors: number
  byRole: Array<{
    roleName: string
    count: number
  }>
}

// Tipo extendido para uso en el frontend
export interface UserStats extends BackendUserStats {
  recentRegistrations: number
  topRoles: Array<{
    role: string
    count: number
    percentage: number
  }>
}

// ========================
// Tipos para Formularios y UI
// ========================

/**
 * Datos del formulario para editar un usuario.
 */
export interface UserFormData {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  isActive: boolean
  otpEnabled: boolean
}

/**
 * Valores por defecto para el formulario de usuarios.
 */
export const USER_FORM_DEFAULTS: UserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  isActive: true,
  otpEnabled: false,
}

/**
 * Constantes de validación para el formulario.
 */
export const USER_VALIDATION = {
  email: {
    minLength: 5,
    maxLength: 255,
  },
  firstName: {
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    minLength: 2,
    maxLength: 50,
  },
  phoneNumber: {
    maxLength: 20,
  },
} as const

// ========================
// Tipos para Filtros y Búsqueda
// ========================

export interface UserFilters {
  search: string
  role: string
  isActive: boolean | null
  userType: string
}

export const USER_FILTER_DEFAULTS: UserFilters = {
  search: '',
  role: '',
  isActive: null,
  userType: '',
}

// ========================
// Tipos para Gráficos y Analytics
// ========================

export interface UserAnalytics {
  registrationTrend: Array<{
    date: string
    count: number
  }>
  roleDistribution: Array<{
    role: string
    count: number
    percentage: number
  }>
  activityStatus: Array<{
    status: string
    count: number
  }>
  topUsers: Array<{
    id: string
    name: string
    role: string
    activity: number
  }>
}
