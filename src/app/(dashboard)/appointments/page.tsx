'use client'

import { AppointmentsList } from '@/features/appointments/components/appointments-list'
import { MedicalCalendar } from '@/features/appointments/components/medical-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppointments } from '@/features/appointments/hooks/use-appointments'
import { useDoctors } from '@/features/doctors/hooks/use-doctors'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

export default function AppointmentsPage() {
  const { user } = useAuthStore()

  // Determinar qué parámetros de filtrado usar basado en el rol del usuario
  const getFilterParams = () => {
    const baseParams = {
      includePatient: true,
      includeDoctor: true,
      sortByDate: 'asc' as const,
    }

    if (!user) return baseParams

    // Si es doctor, filtrar por doctorId
    if (user.roles.includes(UserRole.DOCTOR)) {
      return {
        ...baseParams,
        doctorId: user.id,
      }
    }

    // Si es paciente, filtrar por patientId
    if (user.roles.includes(UserRole.PATIENT)) {
      return {
        ...baseParams,
        patientId: user.id,
      }
    }

    // Si es admin, mostrar todas las citas
    return baseParams
  }

  const { data: appointmentsResponse, isLoading: appointmentsLoading } =
    useAppointments(getFilterParams())

  const { data: doctorsResponse, isLoading: doctorsLoading } = useDoctors({
    page: 1,
    limit: 100,
  })

  // Extraer datos de las respuestas
  const appointments = appointmentsResponse?.data?.data || []
  const doctorsData = doctorsResponse?.data?.data || []
  const isLoading = appointmentsLoading || doctorsLoading

  // Mapear doctores al formato esperado por el calendario
  const doctors = doctorsData.map((doctor) => ({
    id: doctor.id,
    firstName: doctor.user.firstName,
    lastName: doctor.user.lastName,
    email: doctor.user.email,
    phoneNumber: doctor.user.phoneNumber,
    specialties: doctor.specialties,
    license: doctor.license,
    consultationFee: doctor.consultationFee,
    isActive: doctor.user.isActive,
    user: doctor.user,
    profilePhoto: doctor.profilePhoto,
    address: doctor.address,
    bio: doctor.bio,
    education: doctor.education,
    experience: doctor.experience,
    languages: doctor.languages,
    timeZone: doctor.timeZone,
    publicEmail: doctor.publicEmail,
    publicPhone: doctor.publicPhone,
    certifications: doctor.certifications,
    awards: doctor.awards,
    publications: doctor.publications,
    clinics: doctor.clinics,
  }))

  return (
    <div className='h-full flex flex-col space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Citas Médicas</h1>
        <p className='text-muted-foreground'>
          Gestiona todas las citas del sistema con calendario avanzado
        </p>
      </div>

      <Tabs defaultValue='calendar' className='flex-1 flex flex-col'>
        <TabsList className='grid w-full grid-cols-2 mb-4'>
          <TabsTrigger value='calendar'>📅 Calendario Médico</TabsTrigger>
          <TabsTrigger value='list'>📋 Lista de Citas</TabsTrigger>
        </TabsList>

        <TabsContent value='calendar' className='flex-1 mt-0'>
          <div className='h-[calc(100vh-200px)] border rounded-lg bg-card'>
            <MedicalCalendar
              appointments={appointments}
              doctors={doctors}
              isLoading={isLoading}
              enableAnimations={true}
              showConflicts={true}
              enableRecurringAppointments={true}
              enableExport={true}
              enablePrint={true}
            />
          </div>
        </TabsContent>

        <TabsContent value='list' className='flex-1 mt-0'>
          <AppointmentsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
