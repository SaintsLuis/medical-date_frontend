import { z } from 'zod'

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'El paciente es requerido'),
  doctorId: z.string().min(1, 'El doctor es requerido'),
  clinicId: z.string().min(1, 'La clínica es requerida'),
  specialtyId: z.string().min(1, 'La especialidad es requerida'),
  appointmentDate: z.string().min(1, 'La fecha es requerida'),
  appointmentTime: z.string().min(1, 'La hora es requerida'),
  reason: z
    .string()
    .min(1, 'El motivo es requerido')
    .max(500, 'Máximo 500 caracteres'),
  notes: z.string().optional(),
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .default('SCHEDULED'),
})

export const appointmentUpdateSchema = appointmentSchema.partial()

export const appointmentFilterSchema = z.object({
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  clinicId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
export type AppointmentUpdateData = z.infer<typeof appointmentUpdateSchema>
export type AppointmentFilterData = z.infer<typeof appointmentFilterSchema>
