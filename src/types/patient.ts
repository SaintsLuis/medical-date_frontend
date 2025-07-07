export interface Patient {
  id: string
  profileId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodType: string
  allergies: string[]
  medicalConditions: string[]
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  insurance: {
    provider: string
    policyNumber: string
    groupNumber?: string
  }
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  profilePhoto?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientMetrics {
  totalPatients: number
  newPatientsThisMonth: number
  activePatients: number
  patientsWithUpcomingAppointments: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  bloodTypeDistribution: Record<string, number>
  topMedicalConditions: Array<{
    condition: string
    count: number
  }>
}

export interface PatientFilters {
  search?: string
  gender?: string
  bloodType?: string
  ageRange?: {
    min: number
    max: number
  }
  hasInsurance?: boolean
  isActive?: boolean
  medicalCondition?: string
}

export interface CreatePatientData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodType: string
  allergies: string[]
  medicalConditions: string[]
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  insurance: {
    provider: string
    policyNumber: string
    groupNumber?: string
  }
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string
}
