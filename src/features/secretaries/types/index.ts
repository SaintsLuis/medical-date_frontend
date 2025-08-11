// src/features/secretaries/types/index.ts

import { z } from 'zod'

// ========================
// Tipos Principales
// ========================

/**
 * Representa una secretaria en el sistema.
 * Debe coincidir con SecretaryResponseDto del backend.
 */
export interface Secretary {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  assignedDoctors: Array<{
    id: string
    name: string
    email: string
    specialties: string[]
    notes?: string
    assignedAt: string
  }>
  roles: string[]
}

/**
 * Secretaria con información extendida para listas.
 */
export interface SecretaryWithDetails extends Secretary {
  statusDisplay: string
  doctorsDisplay: string
  assignedDoctorsCount: number
}

// ========================
// Tipos para API & Actions
// ========================

/**
 * Datos para crear una nueva secretaria.
 * Debe coincidir exactamente con CreateSecretaryDto del backend.
 */
export interface CreateSecretaryData {
  firstName: string
  lastName: string
  email: string
  password: string // Contraseña temporal para la secretaria
  phoneNumber?: string
  doctorProfileIds: string[] // IDs de los perfiles de doctores (no usuarios)
  notes?: string
}

/**
 * Datos para actualizar una secretaria existente.
 * Debe coincidir exactamente con UpdateSecretaryDto del backend.
 */
export interface UpdateSecretaryData {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phoneNumber?: string
  doctorProfileIds?: string[]
  notes?: string
}

/**
 * Parámetros para filtrar y paginar la lista de secretarias.
 */
export interface QuerySecretariesParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  includeDoctors?: boolean
  sortBy?: string
  sortOrder?: string
}

/**
 * Estructura de la respuesta paginada desde la API.
 */
export interface PaginatedSecretariesResponse {
  data: Secretary[]
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
 * Estadísticas clave sobre las secretarias.
 */
export interface BackendSecretaryStats {
  total: number
  active: number
  withAssignedDoctors: number
  averageDoctorsPerSecretary: number
  totalAssignments: number
}

// Tipo extendido para uso en el frontend
export interface SecretaryStats extends BackendSecretaryStats {
  recentHires: number
  topAssigned: Array<{
    secretary: string
    doctorsCount: number
  }>
}

// ========================
// Tipos para Formularios y UI
// ========================

/**
 * Datos del formulario para secretarias.
 * El password es opcional para permitir edición sin cambiar contraseña.
 */
export interface SecretaryFormData {
  firstName: string
  lastName: string
  email: string
  password?: string // Opcional para permitir edición sin cambiar contraseña
  phoneNumber: string
  doctorProfileIds: string[]
  notes: string
}

/**
 * Valores por defecto para el formulario de secretarias.
 */
export const SECRETARY_FORM_DEFAULTS: SecretaryFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '', // Opcional, se puede dejar vacío en edición
  phoneNumber: '',
  doctorProfileIds: [],
  notes: '',
}

/**
 * Constantes de validación para el formulario.
 */
export const SECRETARY_VALIDATION = {
  firstName: {
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    minLength: 2,
    maxLength: 50,
  },
  email: {
    minLength: 5,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    maxLength: 32,
  },
  phoneNumber: {
    maxLength: 20,
  },
  notes: {
    maxLength: 1000,
  },
} as const

/**
 * Schema Zod para validación de formularios de secretarias
 */
export const secretaryFormSchema = z.object({
  firstName: z
    .string()
    .min(SECRETARY_VALIDATION.firstName.minLength, {
      message: `El nombre debe tener al menos ${SECRETARY_VALIDATION.firstName.minLength} caracteres`,
    })
    .max(SECRETARY_VALIDATION.firstName.maxLength, {
      message: `El nombre no puede exceder ${SECRETARY_VALIDATION.firstName.maxLength} caracteres`,
    }),
  lastName: z
    .string()
    .min(SECRETARY_VALIDATION.lastName.minLength, {
      message: `El apellido debe tener al menos ${SECRETARY_VALIDATION.lastName.minLength} caracteres`,
    })
    .max(SECRETARY_VALIDATION.lastName.maxLength, {
      message: `El apellido no puede exceder ${SECRETARY_VALIDATION.lastName.maxLength} caracteres`,
    }),
  email: z
    .string()
    .min(SECRETARY_VALIDATION.email.minLength, {
      message: `El correo electrónico debe tener al menos ${SECRETARY_VALIDATION.email.minLength} caracteres`,
    })
    .max(SECRETARY_VALIDATION.email.maxLength, {
      message: `El correo electrónico no puede exceder ${SECRETARY_VALIDATION.email.maxLength} caracteres`,
    })
    .email('El correo electrónico no es válido'),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= SECRETARY_VALIDATION.password.minLength,
      {
        message: `La contraseña debe tener al menos ${SECRETARY_VALIDATION.password.minLength} caracteres`,
      }
    )
    .refine(
      (val) => !val || val.length <= SECRETARY_VALIDATION.password.maxLength,
      {
        message: `La contraseña no puede exceder ${SECRETARY_VALIDATION.password.maxLength} caracteres`,
      }
    ),
  phoneNumber: z.string().max(SECRETARY_VALIDATION.phoneNumber.maxLength, {
    message: `El teléfono no puede exceder ${SECRETARY_VALIDATION.phoneNumber.maxLength} caracteres`,
  }),
  notes: z.string().max(SECRETARY_VALIDATION.notes.maxLength, {
    message: `Las notas no pueden exceder ${SECRETARY_VALIDATION.notes.maxLength} caracteres`,
  }),
  doctorProfileIds: z.array(z.string()),
})

/**
 * Función para generar el schema de validación según el modo (crear/editar)
 */
export const getSecretaryFormSchema = (isEditing: boolean) => {
  return z.object({
    firstName: z
      .string()
      .min(SECRETARY_VALIDATION.firstName.minLength, {
        message: `El nombre debe tener al menos ${SECRETARY_VALIDATION.firstName.minLength} caracteres`,
      })
      .max(SECRETARY_VALIDATION.firstName.maxLength, {
        message: `El nombre no puede exceder ${SECRETARY_VALIDATION.firstName.maxLength} caracteres`,
      }),
    lastName: z
      .string()
      .min(SECRETARY_VALIDATION.lastName.minLength, {
        message: `El apellido debe tener al menos ${SECRETARY_VALIDATION.lastName.minLength} caracteres`,
      })
      .max(SECRETARY_VALIDATION.lastName.maxLength, {
        message: `El apellido no puede exceder ${SECRETARY_VALIDATION.lastName.maxLength} caracteres`,
      }),
    email: z
      .string()
      .min(SECRETARY_VALIDATION.email.minLength, {
        message: `El correo electrónico debe tener al menos ${SECRETARY_VALIDATION.email.minLength} caracteres`,
      })
      .max(SECRETARY_VALIDATION.email.maxLength, {
        message: `El correo electrónico no puede exceder ${SECRETARY_VALIDATION.email.maxLength} caracteres`,
      })
      .email('El correo electrónico no es válido'),
    password: isEditing
      ? z
          .string()
          .optional()
          .refine(
            (val) =>
              !val || val.length >= SECRETARY_VALIDATION.password.minLength,
            {
              message: `La contraseña debe tener al menos ${SECRETARY_VALIDATION.password.minLength} caracteres`,
            }
          )
          .refine(
            (val) =>
              !val || val.length <= SECRETARY_VALIDATION.password.maxLength,
            {
              message: `La contraseña no puede exceder ${SECRETARY_VALIDATION.password.maxLength} caracteres`,
            }
          )
      : z
          .string()
          .min(SECRETARY_VALIDATION.password.minLength, {
            message: `La contraseña debe tener al menos ${SECRETARY_VALIDATION.password.minLength} caracteres`,
          })
          .max(SECRETARY_VALIDATION.password.maxLength, {
            message: `La contraseña no puede exceder ${SECRETARY_VALIDATION.password.maxLength} caracteres`,
          }),
    phoneNumber: z.string().max(SECRETARY_VALIDATION.phoneNumber.maxLength, {
      message: `El teléfono no puede exceder ${SECRETARY_VALIDATION.phoneNumber.maxLength} caracteres`,
    }),
    notes: z.string().max(SECRETARY_VALIDATION.notes.maxLength, {
      message: `Las notas no pueden exceder ${SECRETARY_VALIDATION.notes.maxLength} caracteres`,
    }),
    doctorProfileIds: z.array(z.string()),
  })
}

// ========================
// Tipos para Filtros y Búsqueda
// ========================

export interface SecretaryFilters {
  search: string
  isActive: boolean | null
  hasAssignedDoctors: boolean | null
}

export const SECRETARY_FILTER_DEFAULTS: SecretaryFilters = {
  search: '',
  isActive: null,
  hasAssignedDoctors: null,
}
