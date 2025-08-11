// types/auth.ts

// Enums que coinciden exactamente con el backend
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  SECRETARY = 'secretary',
}

export enum Permission {
  // Admin permissions
  MANAGE_DOCTORS = 'MANAGE_DOCTORS',
  MANAGE_PATIENTS = 'MANAGE_PATIENTS',
  MANAGE_CLINICS = 'MANAGE_CLINICS',
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',

  // Doctor permissions
  VIEW_APPOINTMENTS = 'VIEW_APPOINTMENTS',
  MANAGE_APPOINTMENTS = 'MANAGE_APPOINTMENTS',
  VIEW_MEDICAL_RECORDS = 'VIEW_MEDICAL_RECORDS',
  MANAGE_MEDICAL_RECORDS = 'MANAGE_MEDICAL_RECORDS',
  MANAGE_PRESCRIPTIONS = 'MANAGE_PRESCRIPTIONS',
  VIEW_PATIENTS = 'VIEW_PATIENTS',

  // Secretary permissions
  SECRETARY_MANAGE_APPOINTMENTS = 'SECRETARY_MANAGE_APPOINTMENTS',
  SECRETARY_MANAGE_PATIENTS = 'SECRETARY_MANAGE_PATIENTS',
  SECRETARY_VIEW_BILLING = 'SECRETARY_VIEW_BILLING',
  SECRETARY_MANAGE_BILLING = 'SECRETARY_MANAGE_BILLING',

  // Patient permissions
  VIEW_OWN_APPOINTMENTS = 'VIEW_OWN_APPOINTMENTS',
  BOOK_APPOINTMENTS = 'BOOK_APPOINTMENTS',
  VIEW_OWN_RECORDS = 'VIEW_OWN_RECORDS',
  VIEW_OWN_PRESCRIPTIONS = 'VIEW_OWN_PRESCRIPTIONS',
}

// Estructura de usuario que coincide con el backend
export interface BackendUserRole {
  role: {
    id: string
    name: UserRole
    description: string
    permissions?: Array<{
      permission: {
        id: string
        name: string
        description: string
        resource: string
        action: string
      }
    }>
  }
}

export interface BackendUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isActive: boolean
  emailVerified?: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  roles: string[] // El backend devuelve array de strings: ["admin", "doctor"]
  patientProfile?: PatientProfile
  doctorProfile?: DoctorProfile
}

// Interface simplificada para el frontend (transformada del backend)
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isActive: boolean
  emailVerified?: boolean
  roles: UserRole[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  // Perfiles específicos
  patientProfile?: PatientProfile
  doctorProfile?: DoctorProfile
}

// Respuestas específicas del backend
export interface BackendAuthResponse {
  accessToken: string
  refreshToken: string
  user?: BackendUser
  expiresIn?: number
}

export interface BackendLoginResponse {
  accessToken: string
  refreshToken: string
}

// Type alias en lugar de interface vacía
export type BackendProfileResponse = BackendUser

// DTOs para requests (coinciden con el backend)
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPatientRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  acceptTerms: boolean
  // Campos opcionales del perfil médico
  address?: string
  emergencyContact?: string
  bloodType?: string
  allergies?: string[]
  medicalConditions?: string[]
  insuranceProvider?: string
}

export interface CreateDoctorRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  specialtyId: string
  licenseNumber: string
  yearsOfExperience?: number
  consultationFee?: number
  biography?: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  register: (data: RegisterPatientRequest) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  checkAuth: () => Promise<void>
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_DOCTORS,
    Permission.MANAGE_PATIENTS,
    Permission.MANAGE_CLINICS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.MANAGE_MEDICAL_RECORDS,
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.VIEW_PATIENTS,
  ],
  [UserRole.DOCTOR]: [
    Permission.VIEW_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.MANAGE_MEDICAL_RECORDS,
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.VIEW_PATIENTS,
  ],
  [UserRole.SECRETARY]: [
    Permission.SECRETARY_MANAGE_APPOINTMENTS,
    Permission.SECRETARY_MANAGE_PATIENTS,
    Permission.SECRETARY_VIEW_BILLING,
    Permission.SECRETARY_MANAGE_BILLING,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_PATIENTS,
  ],
  [UserRole.PATIENT]: [
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.BOOK_APPOINTMENTS,
    Permission.VIEW_OWN_RECORDS,
    Permission.VIEW_OWN_PRESCRIPTIONS,
  ],
} as const

export interface DoctorProfile {
  id: string
  userId: string
  license: string
  phone?: string
  address?: string
  bio?: string
  consultationFee?: number
  education: string[]
  experience?: number
  languages: string[]
  timeZone: string
  profilePhoto?: string
  meetingLink?: string
  specialties: DoctorSpecialty[]
  clinics: DoctorClinic[]
}

export interface PatientProfile {
  id: string
  userId: string
  birthDate?: string
  gender?: 'MALE' | 'FEMALE'
  address?: string
  emergencyContact?: string
  bloodType?: string
  allergies: string[]
  medicalConditions: string[]
  insuranceProvider?: string
  profilePhoto?: string
}

export interface DoctorSpecialty {
  specialtyId: string
  specialty: {
    id: string
    name: string
    description?: string
  }
}

export interface DoctorClinic {
  clinicId: string
  clinic: {
    id: string
    name: string
    address: string
    phone?: string
    email?: string
  }
  officeNumber?: string
  isPrimary: boolean
}
