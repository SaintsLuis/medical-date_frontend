// src/features/specialties/types/index.ts

// ========================
// Tipos Principales
// ========================

/**
 * Representa una especialidad médica en el sistema.
 */
export interface Specialty {
  id: string
  name: string
  description: string | null
  doctorCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Especialidad con la lista de doctores asociados.
 */
export interface SpecialtyWithDoctors extends Specialty {
  doctors: Array<{
    id: string
    firstName: string
    lastName: string
    licenseNumber: string
  }>
}

// ========================
// Tipos para API & Actions
// ========================

/**
 * Datos necesarios para crear una nueva especialidad.
 */
export interface CreateSpecialtyData {
  name: string
  description?: string
}

/**
 * Datos para actualizar una especialidad existente.
 * Todos los campos son opcionales.
 */
export interface UpdateSpecialtyData {
  name?: string
  description?: string
}

/**
 * Parámetros para filtrar y paginar la lista de especialidades.
 */
export interface QuerySpecialtiesParams {
  page?: number
  limit?: number
  search?: string
  includeDoctorCount?: boolean
}

/**
 * Estructura de la respuesta paginada desde la API.
 */
export interface PaginatedSpecialtiesResponse {
  data: Specialty[]
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
 * Estadísticas clave sobre las especialidades.
 */
// Tipos que coinciden con lo que el backend actualmente devuelve
export interface BackendSpecialtyStats {
  total: number
  active: number
  deleted: number
  withDoctors: number
}

// Tipo extendido para uso en el frontend (con valores calculados)
export interface SpecialtyStats extends BackendSpecialtyStats {
  averageDoctorsPerSpecialty: number
  topSpecialties: Array<{
    id: string
    name: string
    doctorCount: number
  }>
  specialtiesWithoutDoctors: Array<{
    id: string
    name: string
    doctorCount: number
  }>
}

// ========================
// Tipos para Formularios y UI
// ========================

/**
 * Datos del formulario para crear/editar una especialidad.
 */
export interface SpecialtyFormData {
  name: string
  description: string
}

/**
 * Valores por defecto para el formulario de especialidades.
 */
export const SPECIALTY_FORM_DEFAULTS: SpecialtyFormData = {
  name: '',
  description: '',
}

/**
 * Constantes de validación para el formulario, usadas en el frontend con Zod
 * y como referencia para la lógica de validación manual.
 */
export const SPECIALTY_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
} as const
