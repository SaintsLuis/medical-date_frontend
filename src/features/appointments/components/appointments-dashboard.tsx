'use client'

import { AppointmentsList } from '@/features/appointments/components/appointments-list'
import { MedicalCalendar } from '@/features/appointments/components/medical-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
} from '@/features/appointments/hooks/use-appointments'
import { useDoctors } from '@/features/doctors/hooks/use-doctors'
import { usePatients } from '@/features/patients/hooks/use-patients'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  CreateAppointmentData,
  UpdateAppointmentData,
} from '@/features/appointments/types'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AppointmentsDashboard() {
  const { user } = useAuthStore()

  // Appointment mutation hooks
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  // Determinar qué parámetros de filtrado usar basado en el rol del usuario
  const getFilterParams = () => {
    const baseParams = {
      page: 1,
      limit: 100, // Respeta el límite del backend
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

  const { data: patientsResponse, isLoading: patientsLoading } = usePatients({
    page: 1,
    limit: 100,
    includeUser: true,
  })

  // Extraer datos de las respuestas
  const appointments = appointmentsResponse?.data?.data || []
  const doctorsData = doctorsResponse?.data?.data || []
  const patientsData = patientsResponse?.data?.data || []
  const isLoading = appointmentsLoading || doctorsLoading || patientsLoading

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

  // Mapear pacientes al formato esperado por el calendario
  const patients = patientsData.map((patient) => ({
    id: patient.id,
    firstName: patient.user.firstName,
    lastName: patient.user.lastName,
    email: patient.user.email,
    phoneNumber: patient.user.phoneNumber,
    birthDate: patient.birthDate,
    gender: patient.gender,
    bloodType: patient.bloodType,
    allergies: patient.allergies || [],
    isActive: patient.user.isActive,
    user: patient.user, // <-- AGREGADO
  }))

  // Callback functions for appointment management
  const handleAppointmentCreate = async (
    appointmentData: Record<string, unknown>
  ) => {
    try {
      console.log(
        '🔄 AppointmentsPage: Creating appointment with data:',
        appointmentData
      )

      // Transform appointmentData to CreateAppointmentData format
      const createData: CreateAppointmentData = {
        patientId: appointmentData.patientId as string,
        doctorId: appointmentData.doctorId as string,
        date: appointmentData.date as string, // Already in ISO format from AppointmentModal
        duration: appointmentData.duration as number,
        type: appointmentData.type as 'IN_PERSON' | 'VIRTUAL',
        notes: appointmentData.notes as string,
        price: appointmentData.price as number,
        videoLink: appointmentData.videoLink as string,
        meetingId: appointmentData.meetingId as string,
        meetingPassword: appointmentData.meetingPassword as string,
      }

      console.log('📝 AppointmentsPage: Transformed create data:', createData)

      const result = await createAppointment.mutateAsync(createData)

      if (result.success) {
        toast.success('Cita creada exitosamente', {
          description: (
            <span className='text-gray-800'>
              La cita fue registrada correctamente.
            </span>
          ),
          icon: <CheckCircle className='text-green-600' />,
        })
        console.log(
          '✅ AppointmentsPage: Appointment created successfully:',
          result.data
        )
      } else {
        toast.error('Error al crear la cita', {
          description: (
            <span className='text-gray-800'>
              {result.error || 'Intenta de nuevo o contacta soporte.'}
            </span>
          ),
          icon: <XCircle className='text-red-600' />,
        })
        throw new Error(result.error || 'Error al crear la cita')
      }
    } catch (error) {
      console.error('❌ AppointmentsPage: Error creating appointment:', error)
      toast.error('Error al crear la cita', {
        description: (
          <span className='text-gray-800'>
            Intenta de nuevo o contacta soporte.
          </span>
        ),
        icon: <XCircle className='text-red-600' />,
      })
      throw error
    }
  }

  const handleAppointmentUpdate = async (
    appointmentId: string,
    appointmentData: Record<string, unknown>
  ) => {
    try {
      console.log(
        '🔄 AppointmentsPage: Updating appointment:',
        appointmentId,
        'with data:',
        appointmentData
      )

      // Transform appointmentData to UpdateAppointmentData format
      const updateData: UpdateAppointmentData = {
        date: appointmentData.date
          ? (appointmentData.date as string)
          : undefined, // Already in ISO format from AppointmentModal
        duration: appointmentData.duration as number,
        type: appointmentData.type as 'IN_PERSON' | 'VIRTUAL',
        status: appointmentData.status as
          | 'SCHEDULED'
          | 'CONFIRMED'
          | 'COMPLETED'
          | 'CANCELLED'
          | 'NO_SHOW',
        notes: appointmentData.notes as string,
        price: appointmentData.price as number,
        videoLink: appointmentData.videoLink as string,
        meetingId: appointmentData.meetingId as string,
        meetingPassword: appointmentData.meetingPassword as string,
      }

      console.log(
        '📝 AppointmentsPage: Transformed update data before cleanup:',
        updateData
      )

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateAppointmentData] === undefined) {
          delete updateData[key as keyof UpdateAppointmentData]
        }
      })

      const result = await updateAppointment.mutateAsync({
        id: appointmentId,
        data: updateData,
      })

      if (result.success) {
        toast.success('Cita actualizada exitosamente', {
          description: (
            <span className='text-gray-800'>
              Los cambios fueron guardados correctamente.
            </span>
          ),
          icon: <CheckCircle className='text-green-600' />,
        })
        console.log(
          '✅ AppointmentsPage: Appointment updated successfully:',
          result.data
        )
      } else {
        toast.error('Error al actualizar la cita', {
          description: (
            <span className='text-gray-800'>
              {result.error || 'Intenta de nuevo o contacta soporte.'}
            </span>
          ),
          icon: <XCircle className='text-red-600' />,
        })
        throw new Error(result.error || 'Error al actualizar la cita')
      }
    } catch (error) {
      console.error('❌ AppointmentsPage: Error updating appointment:', error)
      toast.error('Error al actualizar la cita', {
        description: (
          <span className='text-gray-800'>
            Intenta de nuevo o contacta soporte.
          </span>
        ),
        icon: <XCircle className='text-red-600' />,
      })
      throw error
    }
  }

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
              patients={patients}
              isLoading={isLoading}
              enableAnimations={true}
              showConflicts={true}
              enableRecurringAppointments={true}
              enableExport={true}
              enablePrint={true}
              onAppointmentCreate={handleAppointmentCreate}
              onAppointmentUpdate={handleAppointmentUpdate}
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
