// Constants for all API endpoints pointing to the NestJS backend
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_DOCTOR: '/auth/login/doctor',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users endpoints
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
  },

  // Doctors endpoints
  DOCTORS: {
    LIST: '/users/doctors',
    DETAIL: (id: string) => `/users/doctors/${id}`,
    CREATE: '/auth/doctors/create',
    UPDATE: (id: string) => `/users/doctors/${id}`,
    DELETE: (id: string) => `/users/doctors/${id}`,
    AVAILABILITY: (id: string) => `/users/doctors/${id}/availability`,
    SCHEDULES: (id: string) => `/users/doctors/${id}/schedules`,
  },

  // Patients endpoints
  PATIENTS: {
    LIST: '/users/patients',
    DETAIL: (id: string) => `/users/patients/${id}`,
    UPDATE: (id: string) => `/users/patients/${id}`,
    DELETE: (id: string) => `/users/patients/${id}`,
    MEDICAL_PROFILE: (id: string) => `/users/patients/${id}/medical-profile`,
  },

  // Appointments endpoints
  APPOINTMENTS: {
    LIST: '/appointments',
    DETAIL: (id: string) => `/appointments/${id}`,
    CREATE: '/appointments',
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    CONFIRM: (id: string) => `/appointments/${id}/confirm`,
    RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
    BY_DOCTOR: (doctorId: string) => `/appointments/doctor/${doctorId}`,
    BY_PATIENT: (patientId: string) => `/appointments/patient/${patientId}`,
    RECURRENT: '/appointments/recurrent',
  },

  // Medical Records endpoints
  MEDICAL_RECORDS: {
    LIST: '/medical-records',
    DETAIL: (id: string) => `/medical-records/${id}`,
    CREATE: '/medical-records',
    UPDATE: (id: string) => `/medical-records/${id}`,
    DELETE: (id: string) => `/medical-records/${id}`,
    BY_PATIENT: (patientId: string) => `/medical-records/patient/${patientId}`,
    VITAL_SIGNS: (recordId: string) =>
      `/medical-records/${recordId}/vital-signs`,
    ATTACHMENTS: (recordId: string) =>
      `/medical-records/${recordId}/attachments`,
  },

  // Prescriptions endpoints
  PRESCRIPTIONS: {
    LIST: '/prescriptions',
    DETAIL: (id: string) => `/prescriptions/${id}`,
    CREATE: '/prescriptions',
    UPDATE: (id: string) => `/prescriptions/${id}`,
    DELETE: (id: string) => `/prescriptions/${id}`,
    BY_PATIENT: (patientId: string) => `/prescriptions/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/prescriptions/doctor/${doctorId}`,
    MEDICATIONS: '/prescriptions/medications',
    PDF: (id: string) => `/prescriptions/${id}/pdf`,
  },

  // Clinics endpoints
  CLINICS: {
    LIST: '/clinics',
    DETAIL: (id: string) => `/clinics/${id}`,
    CREATE: '/clinics',
    UPDATE: (id: string) => `/clinics/${id}`,
    DELETE: (id: string) => `/clinics/${id}`,
    DOCTORS: (id: string) => `/clinics/${id}/doctors`,
    ASSIGN_DOCTOR: (id: string) => `/clinics/${id}/assign-doctor`,
    REMOVE_DOCTOR: (id: string) => `/clinics/${id}/remove-doctor`,
  },

  // Specialties endpoints
  SPECIALTIES: {
    LIST: '/specialties',
    DETAIL: (id: string) => `/specialties/${id}`,
    CREATE: '/specialties',
    UPDATE: (id: string) => `/specialties/${id}`,
    DELETE: (id: string) => `/specialties/${id}`,
    DOCTORS: (id: string) => `/specialties/${id}/doctors`,
  },

  // Billing endpoints
  BILLING: {
    PAYMENTS: '/billing/payments',
    PAYMENT_DETAIL: (id: string) => `/billing/payments/${id}`,
    CREATE_PAYMENT: '/billing/payments',
    REFUND_PAYMENT: (id: string) => `/billing/payments/${id}/refund`,
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id: string) => `/billing/invoices/${id}`,
    METRICS: '/billing/metrics',
    REPORTS: '/billing/reports',
  },

  // Files endpoints
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}`,
    DELETE: (id: string) => `/files/${id}`,
    BY_TYPE: (type: string) => `/files/type/${type}`,
    MEDICAL: '/files/medical',
    PROFILES: '/files/profiles',
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    APPOINTMENTS: '/analytics/appointments',
    REVENUE: '/analytics/revenue',
    USERS: '/analytics/users',
    SPECIALTIES: '/analytics/specialties',
    REPORTS: '/analytics/reports',
  },

  // System/Admin endpoints
  SYSTEM: {
    HEALTH: '/health',
    CONFIG: '/system/config',
    BACKUP: '/system/backup',
    LOGS: '/system/logs',
  },
} as const

// Type-safe endpoint access
export type ApiEndpoints = typeof API_ENDPOINTS
