export interface Doctor {
  id: string
  profileId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  specialtyId: string
  specialty: {
    id: string
    name: string
    description: string
    icon: string
  }
  licenseNumber: string
  experience: number
  education: string
  certifications: string[]
  biography: string
  consultationFee: number
  currency: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  profilePhoto?: string
  isActive: boolean
  isAvailable: boolean
  rating: number
  totalReviews: number
  totalAppointments: number
  createdAt: string
  updatedAt: string
}

export interface DoctorMetrics {
  totalDoctors: number
  activeDoctors: number
  availableDoctors: number
  doctorsWithAppointmentsToday: number
  averageRating: number
  averageExperience: number
  specialtyDistribution: Array<{
    specialtyName: string
    count: number
  }>
  topRatedDoctors: Array<{
    id: string
    name: string
    specialty: string
    rating: number
    totalReviews: number
  }>
}

export interface DoctorFilters {
  search?: string
  specialtyId?: string
  isActive?: boolean
  isAvailable?: boolean
  minRating?: number
  minExperience?: number
  maxConsultationFee?: number
  city?: string
  state?: string
}

export interface CreateDoctorData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  specialtyId: string
  licenseNumber: string
  experience: number
  education: string
  certifications: string[]
  biography: string
  consultationFee: number
  currency: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface UpdateDoctorData extends Partial<CreateDoctorData> {
  id: string
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isAvailable: boolean
}

export interface DoctorAvailability {
  doctorId: string
  date: string
  timeSlots: Array<{
    time: string
    isAvailable: boolean
    appointmentId?: string
  }>
}
