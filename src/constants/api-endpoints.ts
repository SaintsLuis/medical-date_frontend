// constants/api-endpoints.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN_DOCTOR: '/auth/login/doctor',
    LOGIN_ADMIN: '/auth/login/admin',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  // Citas
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    DETAIL: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
    AVAILABILITY: (doctorId: string) =>
      `/appointments/availability/${doctorId}`,
    BULK_ACTIONS: '/appointments/bulk',
  },

  // Pacientes
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    DETAIL: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
    MEDICAL_RECORDS: (id: string) => `/patients/${id}/medical-records`,
    APPOINTMENTS: (id: string) => `/patients/${id}/appointments`,
  },

  // Médicos
  DOCTORS: {
    LIST: '/doctors',
    CREATE: '/auth/create-doctor',
    DETAIL: (id: string) => `/doctors/${id}`,
    UPDATE: (id: string) => `/doctors/${id}`,
    DELETE: (id: string) => `/doctors/${id}`,
    AVAILABILITY: (id: string) => `/doctors/${id}/availability`,
    SCHEDULE: (id: string) => `/doctors/${id}/schedule`,
  },

  // Registros médicos
  MEDICAL_RECORDS: {
    LIST: '/medical-records',
    CREATE: '/medical-records',
    DETAIL: (id: string) => `/medical-records/${id}`,
    UPDATE: (id: string) => `/medical-records/${id}`,
    DELETE: (id: string) => `/medical-records/${id}`,
    BY_PATIENT: (patientId: string) => `/medical-records/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/medical-records/doctor/${doctorId}`,
  },

  // Prescripciones
  PRESCRIPTIONS: {
    LIST: '/prescriptions',
    CREATE: '/prescriptions',
    DETAIL: (id: string) => `/prescriptions/${id}`,
    UPDATE: (id: string) => `/prescriptions/${id}`,
    DELETE: (id: string) => `/prescriptions/${id}`,
    MEDICATIONS: '/prescriptions/medications',
    INTERACTIONS: '/prescriptions/interactions',
  },

  // Facturación
  BILLING: {
    STATS: '/billing/stats',
    INVOICES: '/invoices',
    PAYMENTS: '/payments',
    REPORTS: '/billing/reports',
    PAYMENT_METHODS: '/billing/payment-methods',
  },

  // Clínicas
  CLINICS: {
    LIST: '/clinics',
    CREATE: '/clinics',
    DETAIL: (id: string) => `/clinics/${id}`,
    UPDATE: (id: string) => `/clinics/${id}`,
    DELETE: (id: string) => `/clinics/${id}`,
    DOCTORS: (id: string) => `/clinics/${id}/doctors`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    APPOINTMENTS: '/analytics/appointments',
    PATIENTS: '/analytics/patients',
    REVENUE: '/analytics/revenue',
    REPORTS: '/analytics/reports',
  },

  // Archivos
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}`,
    DELETE: (id: string) => `/files/${id}`,
  },

  // Configuración
  SETTINGS: {
    SYSTEM: '/settings/system',
    USERS: '/settings/users',
    ROLES: '/settings/roles',
    PERMISSIONS: '/settings/permissions',
  },
} as const
