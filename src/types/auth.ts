// types/auth.ts
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
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

  // Patient permissions
  VIEW_OWN_APPOINTMENTS = 'VIEW_OWN_APPOINTMENTS',
  BOOK_APPOINTMENTS = 'BOOK_APPOINTMENTS',
  VIEW_OWN_RECORDS = 'VIEW_OWN_RECORDS',
  VIEW_OWN_PRESCRIPTIONS = 'VIEW_OWN_PRESCRIPTIONS',
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
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
  [UserRole.ADMIN]: [
    Permission.MANAGE_DOCTORS,
    Permission.MANAGE_PATIENTS,
    Permission.MANAGE_CLINICS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_ANALYTICS,
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
  [UserRole.PATIENT]: [
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.BOOK_APPOINTMENTS,
    Permission.VIEW_OWN_RECORDS,
    Permission.VIEW_OWN_PRESCRIPTIONS,
  ],
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isActive: boolean
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

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

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  role?: UserRole
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
  register: (data: RegisterRequest) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  checkAuth: () => Promise<void>
}
