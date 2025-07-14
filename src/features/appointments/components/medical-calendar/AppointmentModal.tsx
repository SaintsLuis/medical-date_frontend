'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
  Calendar,
  User,
  Stethoscope,
  Video,
  MapPin,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'

// Types
import type { AppointmentFormProps, RecurringAppointmentPattern } from './types'

import type {
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from '../../types'

// ==============================================
// Interfaces
// ==============================================

interface AppointmentFormData {
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  notes: string
  price?: number
  videoLink?: string
  meetingId?: string
  meetingPassword?: string
  isRecurring: boolean
  recurringPattern?: RecurringAppointmentPattern
  reminderMinutes: number[]
  notifyPatient: boolean
  notifyDoctor: boolean
}

// ==============================================
// Constantes
// ==============================================

const DEFAULT_FORM_DATA: AppointmentFormData = {
  patientId: '',
  doctorId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '09:00',
  duration: 30,
  type: 'IN_PERSON',
  status: 'SCHEDULED',
  notes: '',
  price: 0,
  videoLink: '',
  meetingId: '',
  meetingPassword: '',
  isRecurring: false,
  recurringPattern: undefined,
  reminderMinutes: [15],
  notifyPatient: true,
  notifyDoctor: true,
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
]

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 día antes' },
]

// ==============================================
// Componente Principal
// ==============================================

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  timeSlot,
  doctors = [],
  patients = [],
  onSave,
  enableRecurring = true,
}: AppointmentFormProps) {
  // ==============================================
  // Estado del Formulario
  // ==============================================

  const [formData, setFormData] = useState<AppointmentFormData>(() => {
    // Manejar tanto CalendarEvent como Appointment directo
    let apt: Appointment | undefined

    if (appointment) {
      if ('appointment' in appointment) {
        // Es un CalendarEvent
        apt = appointment.appointment
      } else {
        // Es un Appointment directo
        apt = appointment as unknown as Appointment
      }
    }

    if (apt) {
      return {
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        date: format(new Date(apt.date), 'yyyy-MM-dd'),
        time: format(new Date(apt.date), 'HH:mm'),
        duration: apt.duration,
        type: apt.type,
        status: apt.status,
        notes: apt.notes || '',
        price: apt.price || 0,
        videoLink: apt.videoLink || '',
        meetingId: apt.meetingId || '',
        meetingPassword: apt.meetingPassword || '',
        isRecurring: apt.isRecurring,
        recurringPattern: apt.recurringPattern
          ? {
              type: apt.recurringPattern.toLowerCase() as
                | 'daily'
                | 'weekly'
                | 'biweekly'
                | 'monthly'
                | 'yearly',
              interval: 1,
            }
          : undefined,
        reminderMinutes: [15],
        notifyPatient: true,
        notifyDoctor: true,
      }
    }

    if (timeSlot) {
      return {
        ...DEFAULT_FORM_DATA,
        date: format(timeSlot.start, 'yyyy-MM-dd'),
        time: format(timeSlot.start, 'HH:mm'),
        doctorId: timeSlot.doctorId || '',
      }
    }

    return DEFAULT_FORM_DATA
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // ==============================================
  // Computed Values
  // ==============================================

  const isEditing = useMemo(() => {
    return (
      appointment &&
      typeof appointment === 'object' &&
      'appointment' in appointment
    )
  }, [appointment])

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === formData.doctorId)
  }, [doctors, formData.doctorId])

  const selectedPatient = useMemo(() => {
    return patients?.find((p) => p.id === formData.patientId)
  }, [patients, formData.patientId])

  // ==============================================
  // Handlers
  // ==============================================

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: unknown
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleTimeChange = (time: string) => {
    setFormData((prev) => ({ ...prev, time }))
  }

  const handleDurationChange = (duration: number) => {
    setFormData((prev) => ({ ...prev, duration }))
  }

  const handleReminderToggle = (minutes: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderMinutes: prev.reminderMinutes.includes(minutes)
        ? prev.reminderMinutes.filter((m) => m !== minutes)
        : [...prev.reminderMinutes, minutes],
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) {
      newErrors.patientId = 'Seleccione un paciente'
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Seleccione un doctor'
    }

    if (!formData.date) {
      newErrors.date = 'Seleccione una fecha'
    }

    if (!formData.time) {
      newErrors.time = 'Seleccione una hora'
    }

    if (formData.duration < 15) {
      newErrors.duration = 'La duración mínima es 15 minutos'
    }

    if (formData.type === 'VIRTUAL' && !formData.videoLink) {
      newErrors.videoLink =
        'El enlace de video es requerido para citas virtuales'
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const appointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: formData.duration,
        type: formData.type,
        status: formData.status,
        notes: formData.notes,
        price: formData.price,
        videoLink: formData.videoLink,
        meetingId: formData.meetingId,
        meetingPassword: formData.meetingPassword,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern?.type.toUpperCase() as
          | 'DAILY'
          | 'WEEKLY'
          | 'BIWEEKLY'
          | 'MONTHLY'
          | 'QUARTERLY',
      }

      await onSave(appointmentData)
      onClose()
    } catch (error) {
      console.error('Error saving appointment:', error)
      setErrors({ submit: 'Error al guardar la cita' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(DEFAULT_FORM_DATA)
    setErrors({})
    onClose()
  }

  const generateMeetingLink = () => {
    const meetingId = `meeting-${Date.now()}`
    const baseUrl = 'https://meet.google.com/'
    const meetingLink = `${baseUrl}${meetingId}`

    setFormData((prev) => ({
      ...prev,
      videoLink: meetingLink,
      meetingId,
      meetingPassword: Math.random().toString(36).substring(7),
    }))
  }

  // ==============================================
  // Render Helpers
  // ==============================================

  const renderBasicTab = () => (
    <div className='space-y-6'>
      {/* Patient Selection */}
      <div className='space-y-2'>
        <Label htmlFor='patient'>Paciente *</Label>
        <select
          id='patient'
          value={formData.patientId}
          onChange={(e) => handleInputChange('patientId', e.target.value)}
          className='w-full p-2 border rounded-md'
          disabled={isSubmitting}
        >
          <option value=''>Seleccionar paciente...</option>
          {patients?.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
        {errors.patientId && (
          <p className='text-sm text-red-600'>{errors.patientId}</p>
        )}
      </div>

      {/* Doctor Selection */}
      <div className='space-y-2'>
        <Label htmlFor='doctor'>Doctor *</Label>
        <select
          id='doctor'
          value={formData.doctorId}
          onChange={(e) => handleInputChange('doctorId', e.target.value)}
          className='w-full p-2 border rounded-md'
          disabled={isSubmitting}
        >
          <option value=''>Seleccionar doctor...</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.firstName} {doctor.lastName}
              {doctor.specialties &&
                doctor.specialties.length > 0 &&
                ` - ${doctor.specialties[0].name}`}
            </option>
          ))}
        </select>
        {errors.doctorId && (
          <p className='text-sm text-red-600'>{errors.doctorId}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='date'>Fecha *</Label>
          <Input
            id='date'
            type='date'
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.date && <p className='text-sm text-red-600'>{errors.date}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='time'>Hora *</Label>
          <Input
            id='time'
            type='time'
            value={formData.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.time && <p className='text-sm text-red-600'>{errors.time}</p>}
        </div>
      </div>

      {/* Duration */}
      <div className='space-y-2'>
        <Label>Duración *</Label>
        <div className='flex gap-2 flex-wrap'>
          {DURATION_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={
                formData.duration === option.value ? 'default' : 'outline'
              }
              size='sm'
              onClick={() => handleDurationChange(option.value)}
              disabled={isSubmitting}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {errors.duration && (
          <p className='text-sm text-red-600'>{errors.duration}</p>
        )}
      </div>

      {/* Type */}
      <div className='space-y-2'>
        <Label>Tipo de cita *</Label>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant={formData.type === 'IN_PERSON' ? 'default' : 'outline'}
            onClick={() => handleInputChange('type', 'IN_PERSON')}
            disabled={isSubmitting}
            className='flex items-center gap-2'
          >
            <MapPin className='h-4 w-4' />
            Presencial
          </Button>
          <Button
            type='button'
            variant={formData.type === 'VIRTUAL' ? 'default' : 'outline'}
            onClick={() => handleInputChange('type', 'VIRTUAL')}
            disabled={isSubmitting}
            className='flex items-center gap-2'
          >
            <Video className='h-4 w-4' />
            Virtual
          </Button>
        </div>
      </div>

      {/* Virtual Meeting Setup */}
      {formData.type === 'VIRTUAL' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='space-y-4 p-4 border rounded-lg bg-blue-50'
        >
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>
              Configuración de Reunión Virtual
            </Label>
            <Button
              type='button'
              size='sm'
              onClick={generateMeetingLink}
              disabled={isSubmitting}
            >
              Generar enlace
            </Button>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='videoLink'>Enlace de video *</Label>
            <Input
              id='videoLink'
              value={formData.videoLink}
              onChange={(e) => handleInputChange('videoLink', e.target.value)}
              placeholder='https://meet.google.com/...'
              disabled={isSubmitting}
            />
            {errors.videoLink && (
              <p className='text-sm text-red-600'>{errors.videoLink}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='meetingId'>ID de reunión</Label>
              <Input
                id='meetingId'
                value={formData.meetingId}
                onChange={(e) => handleInputChange('meetingId', e.target.value)}
                placeholder='meeting-id'
                disabled={isSubmitting}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='meetingPassword'>Contraseña</Label>
              <Input
                id='meetingPassword'
                value={formData.meetingPassword}
                onChange={(e) =>
                  handleInputChange('meetingPassword', e.target.value)
                }
                placeholder='password'
                disabled={isSubmitting}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes */}
      <div className='space-y-2'>
        <Label htmlFor='notes'>Notas</Label>
        <Textarea
          id='notes'
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder='Notas adicionales sobre la cita...'
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Price */}
      <div className='space-y-2'>
        <Label htmlFor='price'>Precio (opcional)</Label>
        <Input
          id='price'
          type='number'
          value={formData.price || ''}
          onChange={(e) =>
            handleInputChange('price', parseFloat(e.target.value) || 0)
          }
          placeholder='0.00'
          min='0'
          step='0.01'
          disabled={isSubmitting}
        />
        {errors.price && <p className='text-sm text-red-600'>{errors.price}</p>}
      </div>
    </div>
  )

  const renderAdvancedTab = () => (
    <div className='space-y-6'>
      {/* Status */}
      <div className='space-y-2'>
        <Label>Estado de la cita</Label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className='w-full p-2 border rounded-md'
          disabled={isSubmitting}
        >
          <option value='SCHEDULED'>Programada</option>
          <option value='CONFIRMED'>Confirmada</option>
          <option value='COMPLETED'>Completada</option>
          <option value='CANCELLED'>Cancelada</option>
          <option value='NO_SHOW'>No Show</option>
        </select>
      </div>

      {/* Reminders */}
      <div className='space-y-3'>
        <Label>Recordatorios</Label>
        <div className='space-y-2'>
          {REMINDER_OPTIONS.map((option) => (
            <div key={option.value} className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id={`reminder-${option.value}`}
                checked={formData.reminderMinutes.includes(option.value)}
                onChange={() => handleReminderToggle(option.value)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`reminder-${option.value}`} className='text-sm'>
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className='space-y-3'>
        <Label>Notificaciones</Label>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='notifyPatient' className='text-sm'>
              Notificar al paciente
            </Label>
            <Switch
              id='notifyPatient'
              checked={formData.notifyPatient}
              onCheckedChange={(checked) =>
                handleInputChange('notifyPatient', checked)
              }
              disabled={isSubmitting}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='notifyDoctor' className='text-sm'>
              Notificar al doctor
            </Label>
            <Switch
              id='notifyDoctor'
              checked={formData.notifyDoctor}
              onCheckedChange={(checked) =>
                handleInputChange('notifyDoctor', checked)
              }
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Recurring Options */}
      {enableRecurring && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='isRecurring'>Cita recurrente</Label>
            <Switch
              id='isRecurring'
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                handleInputChange('isRecurring', checked)
              }
              disabled={isSubmitting}
            />
          </div>

          {formData.isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='space-y-4 p-4 border rounded-lg bg-gray-50'
            >
              <div className='space-y-2'>
                <Label>Patrón de repetición</Label>
                <select
                  value={formData.recurringPattern?.type || 'weekly'}
                  onChange={(e) =>
                    handleInputChange('recurringPattern', {
                      type: e.target.value as
                        | 'daily'
                        | 'weekly'
                        | 'biweekly'
                        | 'monthly'
                        | 'yearly',
                      interval: 1,
                    })
                  }
                  className='w-full p-2 border rounded-md'
                  disabled={isSubmitting}
                >
                  <option value='daily'>Diario</option>
                  <option value='weekly'>Semanal</option>
                  <option value='biweekly'>Bisemanal</option>
                  <option value='monthly'>Mensual</option>
                  <option value='yearly'>Anual</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                {isEditing ? 'Editar Cita' : 'Nueva Cita'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los detalles de la cita médica'
                  : 'Programa una nueva cita médica para el paciente'}
              </DialogDescription>
            </DialogHeader>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Selected Information */}
            {(selectedDoctor || selectedPatient) && (
              <div className='flex gap-4 p-3 bg-muted rounded-lg'>
                {selectedPatient && (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </Badge>
                )}
                {selectedDoctor && (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Stethoscope className='h-3 w-3' />
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </Badge>
                )}
              </div>
            )}

            {/* Form Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='basic'>Información Básica</TabsTrigger>
                <TabsTrigger value='advanced'>
                  Configuración Avanzada
                </TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-4'>
                {renderBasicTab()}
              </TabsContent>

              <TabsContent value='advanced' className='space-y-4'>
                {renderAdvancedTab()}
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className='flex justify-end gap-2 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className='h-4 w-4 mr-2' />
                Cancelar
              </Button>
              <Button
                type='button'
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='min-w-[120px]'
              >
                {isSubmitting ? (
                  <>
                    <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    {isEditing ? 'Actualizar' : 'Crear Cita'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
