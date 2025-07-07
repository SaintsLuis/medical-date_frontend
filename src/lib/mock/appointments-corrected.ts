import type { Appointment } from '@/types/appointment'
import { AppointmentType, AppointmentStatus } from '@/types/appointment'

// Datos mock para citas
export const mockAppointments: Appointment[] = [
  {
    id: 'appointment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    duration: 30,
    type: AppointmentType.VIRTUAL,
    status: AppointmentStatus.CONFIRMED,
    notes: 'Consulta de seguimiento',
    videoLink: 'https://meet.google.com/abc-defg-hij',
    patient: {
      id: 'patient-1',
      firstName: 'María',
      lastName: 'García',
      email: 'patient@medicaldate.com',
    },
    doctor: {
      id: 'doctor-1',
      firstName: 'John',
      lastName: 'Smith',
      specialties: ['Cardiología'],
    },
    clinic: {
      id: 'clinic-1',
      name: 'Clínica Central',
      address: 'Calle Principal 123',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'appointment-2',
    patientId: 'patient-2',
    doctorId: 'doctor-1',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días
    duration: 45,
    type: AppointmentType.IN_PERSON,
    status: AppointmentStatus.SCHEDULED,
    notes: 'Primera consulta',
    patient: {
      id: 'patient-2',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos@example.com',
    },
    doctor: {
      id: 'doctor-1',
      firstName: 'John',
      lastName: 'Smith',
      specialties: ['Cardiología'],
    },
    clinic: {
      id: 'clinic-1',
      name: 'Clínica Central',
      address: 'Calle Principal 123',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'appointment-3',
    patientId: 'patient-3',
    doctorId: 'doctor-2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
    duration: 30,
    type: AppointmentType.VIRTUAL,
    status: AppointmentStatus.COMPLETED,
    notes: 'Consulta completada exitosamente',
    patient: {
      id: 'patient-3',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana@example.com',
    },
    doctor: {
      id: 'doctor-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialties: ['Dermatología'],
    },
    clinic: {
      id: 'clinic-2',
      name: 'Clínica Especializada',
      address: 'Avenida Salud 456',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'appointment-4',
    patientId: 'patient-4',
    doctorId: 'doctor-1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // En una semana
    duration: 60,
    type: AppointmentType.IN_PERSON,
    status: AppointmentStatus.SCHEDULED,
    notes: 'Consulta de emergencia',
    patient: {
      id: 'patient-4',
      firstName: 'Roberto',
      lastName: 'Fernández',
      email: 'roberto@example.com',
    },
    doctor: {
      id: 'doctor-1',
      firstName: 'John',
      lastName: 'Smith',
      specialties: ['Cardiología'],
    },
    clinic: {
      id: 'clinic-1',
      name: 'Clínica Central',
      address: 'Calle Principal 123',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Función para simular delay de red
export const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Función para obtener citas mock
export const getMockAppointments = async (
  filters?: Record<string, unknown>
) => {
  await simulateNetworkDelay()

  let filteredAppointments = [...mockAppointments]

  // Aplicar filtros si existen
  if (filters) {
    if (filters.status) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) =>
          appointment.status.toLowerCase() ===
          (filters.status as string).toLowerCase()
      )
    }

    if (filters.type) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) =>
          appointment.type.toLowerCase() ===
          (filters.type as string).toLowerCase()
      )
    }

    if (filters.search) {
      const searchTerm = (filters.search as string).toLowerCase()
      filteredAppointments = filteredAppointments.filter(
        (appointment) =>
          appointment.patient?.firstName.toLowerCase().includes(searchTerm) ||
          appointment.patient?.lastName.toLowerCase().includes(searchTerm) ||
          appointment.doctor?.firstName.toLowerCase().includes(searchTerm) ||
          appointment.doctor?.lastName.toLowerCase().includes(searchTerm)
      )
    }
  }

  return filteredAppointments
}

// Función para obtener una cita específica
export const getMockAppointment = async (id: string) => {
  await simulateNetworkDelay()

  const appointment = mockAppointments.find((app) => app.id === id)
  if (!appointment) {
    throw new Error('Cita no encontrada')
  }

  return appointment
}

// Función para cancelar una cita mock
export const cancelMockAppointment = async (id: string, reason?: string) => {
  await simulateNetworkDelay()

  const appointmentIndex = mockAppointments.findIndex((app) => app.id === id)
  if (appointmentIndex === -1) {
    throw new Error('Cita no encontrada')
  }

  mockAppointments[appointmentIndex] = {
    ...mockAppointments[appointmentIndex],
    status: AppointmentStatus.CANCELLED,
    cancelledReason: reason,
    notes: reason
      ? `${mockAppointments[appointmentIndex].notes} - Cancelada: ${reason}`
      : `${mockAppointments[appointmentIndex].notes} - Cancelada`,
    updatedAt: new Date().toISOString(),
  }

  return mockAppointments[appointmentIndex]
}
