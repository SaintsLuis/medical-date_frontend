export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // Dashboard routes (sin /dashboard/ porque (dashboard) es un route group)
  DASHBOARD: {
    HOME: '/',
    APPOINTMENTS: '/appointments',
    PATIENTS: '/patients',
    DOCTORS: '/doctors',
    CLINICS: '/clinics',
    BILLING: '/billing',
    MEDICAL_RECORDS: '/medical-records',
    PRESCRIPTIONS: '/prescriptions',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',
  },

  // API routes
  API: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    APPOINTMENTS: '/appointments',
    PATIENTS: '/patients',
    DOCTORS: '/doctors',
    CLINICS: '/clinics',
    BILLING: '/billing',
    MEDICAL_RECORDS: '/medical-records',
    PRESCRIPTIONS: '/prescriptions',
    SPECIALTIES: '/specialties',
    FILES: '/files',
  },
} as const

import { type IconName } from './icons'
import { type NavigationItem } from '@/types/navigation'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD.HOME,
    icon: 'BarChart3' as IconName,
    description: 'Resumen general del sistema',
  },
  {
    name: 'Citas',
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    icon: 'Calendar' as IconName,
    description: 'Gestionar citas médicas',
  },
  {
    name: 'Pacientes',
    href: ROUTES.DASHBOARD.PATIENTS,
    icon: 'Users' as IconName,
    description: 'Administrar pacientes',
  },
  {
    name: 'Doctores',
    href: ROUTES.DASHBOARD.DOCTORS,
    icon: 'UserCheck' as IconName,
    description: 'Gestionar doctores',
  },
  {
    name: 'Clínicas',
    href: ROUTES.DASHBOARD.CLINICS,
    icon: 'Building2' as IconName,
    description: 'Administrar clínicas',
  },
  {
    name: 'Facturación',
    href: ROUTES.DASHBOARD.BILLING,
    icon: 'CreditCard' as IconName,
    description: 'Gestión de pagos',
  },
  {
    name: 'Expedientes',
    href: ROUTES.DASHBOARD.MEDICAL_RECORDS,
    icon: 'FileText' as IconName,
    description: 'Expedientes médicos',
  },
  {
    name: 'Recetas',
    href: ROUTES.DASHBOARD.PRESCRIPTIONS,
    icon: 'Pill' as IconName,
    description: 'Prescripciones médicas',
  },
  {
    name: 'Analíticas',
    href: ROUTES.DASHBOARD.ANALYTICS,
    icon: 'BarChart3' as IconName,
    description: 'Reportes y estadísticas',
  },
  {
    name: 'Configuración',
    href: ROUTES.DASHBOARD.SETTINGS,
    icon: 'Settings' as IconName,
    description: 'Configuración del sistema',
  },
] as const
