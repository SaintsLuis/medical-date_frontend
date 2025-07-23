'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  appointmentSchema,
  type AppointmentFormData,
} from '@/lib/validations/appointment'
import {
  useCreateAppointment,
  useUpdateAppointment,
} from '@/hooks/api/use-appointments'
import { toast } from 'sonner'
import { AppointmentStatus, AppointmentType } from '@/types/appointment'

interface AppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  appointment?: AppointmentFormData & { id: string }
  doctors: Array<{ id: string; firstName: string; lastName: string }>
  patients: Array<{ id: string; firstName: string; lastName: string }>
  clinics: Array<{ id: string; name: string }>
  specialties: Array<{ id: string; name: string }>
}

export function AppointmentForm({
  isOpen,
  onClose,
  appointment,
  doctors,
  patients,
  clinics,
  specialties,
}: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!appointment

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment || {
      status: 'SCHEDULED',
    },
  })

  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateAppointment.mutateAsync({
          id: appointment.id,
          data: { ...data, status: data.status as AppointmentStatus },
        })
        toast.success('Cita actualizada correctamente')
      } else {
        // Transformar los datos del formulario al formato requerido por CreateAppointmentRequest
        const createData = {
          patientId: data.patientId,
          doctorId: data.doctorId,
          clinicId: data.clinicId,
          specialtyId: data.specialtyId,
          date: `${data.appointmentDate}T${data.appointmentTime}`,
          duration: 30, // O el valor que corresponda
          type: 'IN_PERSON' as AppointmentType, // O el valor que corresponda
          reason: data.reason,
          status: data.status as AppointmentStatus,
          notes: data.notes,
        }
        await createAppointment.mutateAsync(createData)
        toast.success('Cita creada correctamente')
      }
      onClose()
      form.reset()
    } catch {
      toast.error('Error al guardar la cita')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los detalles de la cita'
              : 'Completa la información para crear una nueva cita'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='patientId'>Paciente</Label>
              <Select
                value={form.watch('patientId')}
                onValueChange={(value) => form.setValue('patientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar paciente' />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.patientId && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.patientId.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='doctorId'>Doctor</Label>
              <Select
                value={form.watch('doctorId')}
                onValueChange={(value) => form.setValue('doctorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar doctor' />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.doctorId && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.doctorId.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='clinicId'>Clínica</Label>
              <Select
                value={form.watch('clinicId')}
                onValueChange={(value) => form.setValue('clinicId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar clínica' />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clinicId && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.clinicId.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='specialtyId'>Especialidad</Label>
              <Select
                value={form.watch('specialtyId')}
                onValueChange={(value) => form.setValue('specialtyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar especialidad' />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.specialtyId && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.specialtyId.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='appointmentDate'>Fecha</Label>
              <Input
                id='appointmentDate'
                type='date'
                {...form.register('appointmentDate')}
              />
              {form.formState.errors.appointmentDate && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.appointmentDate.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='appointmentTime'>Hora</Label>
              <Input
                id='appointmentTime'
                type='time'
                {...form.register('appointmentTime')}
              />
              {form.formState.errors.appointmentTime && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.appointmentTime.message}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reason'>Motivo de la consulta</Label>
            <Textarea
              id='reason'
              placeholder='Describe el motivo de la consulta'
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notas adicionales</Label>
            <Textarea
              id='notes'
              placeholder='Notas adicionales (opcional)'
              {...form.register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar Cita'
                : 'Crear Cita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
