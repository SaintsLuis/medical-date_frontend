// Environment configuration
export const config = {
  // Backend API URL - configurar según el entorno
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',

  // Use mock auth only if explicitly enabled (changed default to false)
  USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',

  // App settings
  APP_NAME: 'Medical Date',
  APP_DESCRIPTION: 'Comprehensive healthcare management platform',

  // Auth settings
  TOKEN_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  AUTH_STORAGE_KEY: 'auth-storage',

  // API settings
  REQUEST_TIMEOUT: 15000,
  MAX_RETRY_ATTEMPTS: 3,

  // Debug settings
  DEBUG_COOKIES: process.env.NODE_ENV === 'development',
  DEBUG_API: process.env.NODE_ENV === 'development',
} as const

// Mock data passwords for demo accounts (only used when USE_MOCK_AUTH is true)
export const DEMO_PASSWORDS = {
  'admin@medical-date.com': 'Admin123!',
  'doctor@medical-date.com': 'Doctor123!',
  'patient@medical-date.com': 'Patient123!',
} as const

// User role permissions mapping for UI (matches backend permissions)
export const ROLE_PERMISSIONS = {
  PATIENT: [
    'VIEW_OWN_APPOINTMENTS',
    'BOOK_APPOINTMENTS',
    'VIEW_OWN_RECORDS',
    'VIEW_OWN_PRESCRIPTIONS',
  ],
  DOCTOR: [
    'VIEW_APPOINTMENTS',
    'MANAGE_APPOINTMENTS',
    'VIEW_MEDICAL_RECORDS',
    'MANAGE_MEDICAL_RECORDS',
    'MANAGE_PRESCRIPTIONS',
    'VIEW_PATIENTS',
  ],
  ADMIN: [
    'MANAGE_SYSTEM',
    'MANAGE_DOCTORS',
    'MANAGE_PATIENTS',
    'MANAGE_CLINICS',
    'MANAGE_BILLING',
    'VIEW_ANALYTICS',
    'VIEW_APPOINTMENTS',
    'MANAGE_APPOINTMENTS',
    'VIEW_MEDICAL_RECORDS',
    'MANAGE_MEDICAL_RECORDS',
    'MANAGE_PRESCRIPTIONS',
    'VIEW_PATIENTS',
  ],
} as const
