import { z } from 'zod'

// Esquema de validación para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingrese un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    ),
  userType: z.enum(['admin', 'doctor', 'secretary', 'auto'], {
    required_error: 'Seleccione un tipo de usuario',
  }),
  rememberMe: z.boolean().optional(),
})

// Tipos inferidos de los esquemas
export type LoginFormData = z.infer<typeof loginSchema>

// Mensajes de error personalizados
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  ACCOUNT_LOCKED: 'Su cuenta ha sido bloqueada por múltiples intentos fallidos',
  ACCOUNT_DISABLED:
    'Su cuenta ha sido deshabilitada. Contacte al administrador',
  EMAIL_NOT_VERIFIED:
    'Su email no ha sido verificado. Revise su bandeja de entrada',
  TOO_MANY_ATTEMPTS:
    'Demasiados intentos fallidos. Intente nuevamente en 15 minutos',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  SERVER_ERROR: 'Error del servidor. Intente nuevamente más tarde',
  UNKNOWN_ERROR: 'Error inesperado. Contacte al soporte técnico',
} as const

// Validaciones de contraseña
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const

// Función para validar contraseña en tiempo real
export const validatePassword = (
  password: string
): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} => {
  const errors: string[] = []
  let score = 0

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`)
  } else {
    score += 1
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Máximo ${PASSWORD_REQUIREMENTS.maxLength} caracteres`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una mayúscula')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una minúscula')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push('Al menos un número')
  } else {
    score += 1
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Al menos un carácter especial (@$!%*?&)')
  } else {
    score += 1
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) strength = 'medium'
  if (score >= 5) strength = 'strong'

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}
