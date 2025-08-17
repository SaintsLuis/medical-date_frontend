'use client'

import { useState, useMemo, useEffect } from 'react'
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
  Monitor,
} from 'lucide-react'

// Types
import type { AppointmentFormProps, RecurringAppointmentPattern } from './types'

import type { AppointmentType, AppointmentStatus } from '../../types'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

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
  type: 'IN_PERSON', // Por defecto presencial (seguro para todos los roles)
  status: 'SCHEDULED',
  notes: '',
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

// Helpers para pacientes que pueden venir planos o con .user

type PatientLike =
  | {
      id: string
      firstName: string
      lastName: string
      email: string
      phoneNumber?: string
      isActive?: boolean
      user?: undefined
    }
  | {
      user: {
        id: string
        firstName: string
        lastName: string
        email: string
        phoneNumber?: string
        isActive?: boolean
      }
      id?: string
      firstName?: string
      lastName?: string
      email?: string
      phoneNumber?: string
      isActive?: boolean
    }

function getPatientId(p: PatientLike) {
  return p.user?.id || ''
}
function getPatientFirstName(p: PatientLike) {
  return p.user?.firstName ?? p.firstName ?? 'N/A'
}
function getPatientLastName(p: PatientLike) {
  return p.user?.lastName ?? p.lastName ?? ''
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  timeSlot,
  doctors = [],
  patients = [], // PatientLike[]
  onSave,
  enableRecurring = true,
}: AppointmentFormProps) {
  // ==============================================
  // Auth y Permisos
  // ==============================================

  const { user } = useAuthStore()

  // Determinar permisos basados en el rol del usuario
  const permissions = useMemo(() => {
    if (!user) return { canCreateVirtual: false, canCreateInPerson: false }

    const isDoctor = user.roles.includes(UserRole.DOCTOR)
    const isAdmin = user.roles.includes(UserRole.ADMIN)
    const isPatient = user.roles.includes(UserRole.PATIENT)

    return {
      canCreateVirtual: isAdmin || isPatient, // Solo admins y pacientes pueden crear citas virtuales
      canCreateInPerson: true, // Todos pueden crear citas presenciales
      isDoctor,
      isAdmin,
      isPatient,
    }
  }, [user])

  // ==============================================
  // Estado del Formulario
  // ==============================================

  const [formData, setFormData] = useState<AppointmentFormData>(() => {
    console.log('🔍 AppointmentModal: Initializing with:', {
      appointment,
      timeSlot,
      userRole: permissions.isDoctor ? 'DOCTOR' : 'OTHER',
    })

    if (appointment) {
      console.log(
        '📝 AppointmentModal: Using existing appointment:',
        appointment
      )

      // Validar y parsear la fecha de la cita existente
      let appointmentDate = new Date()
      if (appointment.date) {
        const parsedDate = new Date(appointment.date)
        if (!isNaN(parsedDate.getTime())) {
          appointmentDate = parsedDate
        } else {
          console.error('❌ Invalid appointment.date:', appointment.date)
        }
      }

      return {
        patientId: appointment.patient?.id || '', // Cambiar a appointment.patient?.id (que es userId en backend)
        doctorId: appointment.doctor?.id || '',
        date: appointment.date ? format(appointmentDate, 'yyyy-MM-dd') : '',
        time: appointment.date ? format(appointmentDate, 'HH:mm') : '',
        duration: appointment.duration || 30,
        type: appointment.type || 'IN_PERSON',
        status: appointment.status || 'SCHEDULED',
        notes: appointment.notes || '',
        isRecurring: appointment.isRecurring || false,
        recurringPattern: appointment.recurringPattern
          ? {
              type: appointment.recurringPattern.toLowerCase() as
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
      console.log('⏰ AppointmentModal: Using time slot:', timeSlot)

      // Validar que timeSlot.start sea una fecha válida
      const slotDate =
        timeSlot.start instanceof Date
          ? timeSlot.start
          : new Date(timeSlot.start)

      if (isNaN(slotDate.getTime())) {
        console.error('❌ Invalid timeSlot.start:', timeSlot.start)
        // Usar fecha actual como fallback
        const fallbackDate = new Date()
        return {
          ...DEFAULT_FORM_DATA,
          date: format(fallbackDate, 'yyyy-MM-dd'),
          time: format(fallbackDate, 'HH:mm'),
          doctorId:
            timeSlot.doctorId || (permissions.isDoctor ? user?.id || '' : ''),
        }
      }

      return {
        ...DEFAULT_FORM_DATA,
        date: format(slotDate, 'yyyy-MM-dd'),
        time: format(slotDate, 'HH:mm'),
        doctorId:
          timeSlot.doctorId || (permissions.isDoctor ? user?.id || '' : ''),
      }
    }

    console.log('📝 AppointmentModal: Using default form data')
    // Si es doctor, auto-asignar su ID
    return {
      ...DEFAULT_FORM_DATA,
      doctorId: permissions.isDoctor ? user?.id || '' : '',
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // ==============================================
  // Effects
  // ==============================================

  // Actualizar formulario cuando cambie la cita seleccionada
  useEffect(() => {
    console.log('🔄 AppointmentModal useEffect triggered:', {
      appointment,
      timeSlot,
    })

    if (appointment) {
      console.log('📝 AppointmentModal: Processing appointment:', appointment)
      console.log(
        '📝 AppointmentModal: Appointment keys:',
        Object.keys(appointment)
      )

      // Validar y parsear la fecha de la cita existente
      let appointmentDate = new Date()
      if (appointment.date) {
        const parsedDate = new Date(appointment.date)
        if (!isNaN(parsedDate.getTime())) {
          appointmentDate = parsedDate
        } else {
          console.error(
            '❌ Invalid appointment.date in useEffect:',
            appointment.date
          )
        }
      }

      const newFormData = {
        patientId: appointment.patient?.id || '', // Cambiar a appointment.patient?.id (que es userId en backend)
        doctorId: appointment.doctor?.id || '',
        date: appointment.date ? format(appointmentDate, 'yyyy-MM-dd') : '',
        time: appointment.date ? format(appointmentDate, 'HH:mm') : '',
        duration: appointment.duration || 30,
        type: appointment.type || 'IN_PERSON',
        status: appointment.status || 'SCHEDULED',
        notes: appointment.notes || '',
        isRecurring: appointment.isRecurring || false,
        recurringPattern: appointment.recurringPattern
          ? {
              type: appointment.recurringPattern.toLowerCase() as
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

      console.log('📝 AppointmentModal: Setting form data:', newFormData)
      setFormData(newFormData)
    } else if (timeSlot) {
      console.log(
        '🔄 AppointmentModal: Updating form with time slot:',
        timeSlot
      )

      // Validar que timeSlot.start sea una fecha válida
      const slotDate =
        timeSlot.start instanceof Date
          ? timeSlot.start
          : new Date(timeSlot.start)

      if (isNaN(slotDate.getTime())) {
        console.error('❌ Invalid timeSlot.start in useEffect:', timeSlot.start)
        // Usar fecha actual como fallback
        const fallbackDate = new Date()
        setFormData({
          ...DEFAULT_FORM_DATA,
          date: format(fallbackDate, 'yyyy-MM-dd'),
          time: format(fallbackDate, 'HH:mm'),
          doctorId:
            timeSlot.doctorId || (permissions.isDoctor ? user?.id || '' : ''),
        })
      } else {
        setFormData({
          ...DEFAULT_FORM_DATA,
          date: format(slotDate, 'yyyy-MM-dd'),
          time: format(slotDate, 'HH:mm'),
          doctorId:
            timeSlot.doctorId || (permissions.isDoctor ? user?.id || '' : ''),
        })
      }
    } else {
      console.log('🔄 AppointmentModal: Resetting to default form data')
      setFormData({
        ...DEFAULT_FORM_DATA,
        doctorId: permissions.isDoctor ? user?.id || '' : '',
      })
    }
  }, [appointment, timeSlot, permissions.isDoctor, user?.id])

  // ==============================================
  // Computed Values
  // ==============================================

  const isEditing = useMemo(() => {
    const result = Boolean(appointment && appointment.id)
    console.log('🔄 AppointmentModal: isEditing computed:', {
      result,
      hasAppointment: Boolean(appointment),
      appointmentId: appointment?.id,
      appointment: appointment,
    })
    return result
  }, [appointment])

  // Efecto para ajustar el tipo de cita basado en permisos
  useEffect(() => {
    if (
      !isEditing &&
      formData.type === 'VIRTUAL' &&
      !permissions.canCreateVirtual
    ) {
      console.log(
        '🔄 AppointmentModal: Resetting type to IN_PERSON due to permissions'
      )
      setFormData((prev) => ({ ...prev, type: 'IN_PERSON' }))
    }
  }, [formData.type, permissions.canCreateVirtual, isEditing])

  // Efecto para auto-asignar doctor si es un doctor el que está creando la cita
  useEffect(() => {
    if (!isEditing && permissions.isDoctor && user?.id && !formData.doctorId) {
      console.log('🔄 AppointmentModal: Auto-assigning doctor ID:', user.id)
      setFormData((prev) => ({ ...prev, doctorId: user.id }))
    }
  }, [permissions.isDoctor, user?.id, formData.doctorId, isEditing])

  const doctorOptions = useMemo(() => {
    const allDoctors = [...(doctors || [])]
    if (isEditing && appointment?.doctor) {
      if (!allDoctors.some((d) => d.id === appointment.doctor?.id)) {
        allDoctors.unshift({ ...appointment.doctor, isActive: true })
      }
    }
    return allDoctors
  }, [doctors, appointment, isEditing])

  const patientOptions = useMemo(() => {
    const allPatients = [...(patients || [])]
    if (isEditing && appointment?.patient) {
      const id = getPatientId(appointment.patient as PatientLike)
      if (!allPatients.some((p) => getPatientId(p as PatientLike) === id)) {
        const safePatient = {
          ...appointment.patient,
          isActive:
            (appointment.patient as { isActive?: boolean }).isActive ?? true,
        }
        allPatients.unshift(safePatient)
      }
    }
    return allPatients
  }, [patients, appointment, isEditing])

  const selectedDoctor = useMemo(() => {
    // En modo edición, el doctor viene en el objeto appointment
    if (isEditing && appointment?.doctor) {
      return appointment.doctor
    }
    // Para nuevas citas, lo buscamos en la lista
    return doctors.find((d) => d.id === formData.doctorId)
  }, [doctors, formData.doctorId, appointment, isEditing])

  const selectedPatient = useMemo(() => {
    if (isEditing && appointment?.patient) {
      const id = getPatientId(appointment.patient as PatientLike)
      const found = patients?.find((p) => getPatientId(p as PatientLike) === id)
      if (found) return found
      // Fallback: si appointment.patient tiene user, úsalo; si no, crea un objeto user con los datos planos
      if ('user' in appointment.patient && appointment.patient.user) {
        return { ...appointment.patient, user: appointment.patient.user }
      }
      // Si no tiene user, crea un objeto user a partir de los datos planos
      return {
        ...appointment.patient,
        user: {
          id: appointment.patient.id,
          firstName: appointment.patient.firstName,
          lastName: appointment.patient.lastName,
          email: appointment.patient.email,
          phoneNumber: appointment.patient.phoneNumber,
          isActive: true,
        },
      }
    }
    return null
  }, [isEditing, appointment, patients])

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

    // En modo edición, solo validar campos esenciales para el doctor
    if (isEditing) {
      // Solo validar notas si están presentes (opcional)
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    // Validación completa para nuevas citas
    if (!formData.patientId) {
      newErrors.patientId = 'Seleccione un paciente'
    }

    // Solo validar doctor si no es un doctor creando la cita
    if (!formData.doctorId) {
      newErrors.doctorId = permissions.isDoctor
        ? 'Error: No se pudo asignar doctor automáticamente'
        : 'Seleccione un doctor'
    }

    if (!formData.date || formData.date.trim() === '') {
      newErrors.date = 'Seleccione una fecha'
    }

    if (!formData.time || formData.time.trim() === '') {
      newErrors.time = 'Seleccione una hora'
    }

    // Validar que la combinación de fecha y hora sea válida
    if (
      formData.date &&
      formData.time &&
      formData.date.trim() &&
      formData.time.trim()
    ) {
      const testDate = new Date(`${formData.date}T${formData.time}`)
      if (isNaN(testDate.getTime())) {
        newErrors.date = 'La fecha y hora seleccionadas no son válidas'
      }
    }

    if (formData.duration < 15) {
      newErrors.duration = 'La duración mínima es 15 minutos'
    }

    // Validación de tipo de cita basada en permisos
    if (formData.type === 'VIRTUAL' && !permissions.canCreateVirtual) {
      newErrors.type = permissions.isDoctor
        ? 'Los doctores solo pueden crear citas presenciales. Las citas virtuales deben ser creadas por el paciente desde la app móvil.'
        : 'No tiene permisos para crear citas virtuales'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    console.log('🚀 AppointmentModal: handleSubmit called')
    console.log('📋 Current form data:', formData)
    // Log extra para depuración de paciente
    const selectedPatientDebug = patients?.find(
      (p) => getPatientId(p as PatientLike) === formData.patientId
    )
    console.log('🧑‍⚕️ [DEBUG] patientId enviado:', formData.patientId)
    console.log(
      '🧑‍⚕️ [DEBUG] Paciente encontrado en lista:',
      selectedPatientDebug
    )
    if (!selectedPatientDebug) {
      console.warn(
        '⚠️ [DEBUG] El paciente con ese ID no está en la lista de pacientes. Puede haber un desajuste de IDs.'
      )
    }

    // Prevenir doble envío
    if (isSubmitting) {
      console.log('🔄 Already submitting, ignoring...')
      return
    }

    if (!validateForm()) {
      console.log('❌ AppointmentModal: Validation failed, errors:', errors)
      return
    }

    console.log('✅ AppointmentModal: Validation passed')
    setIsSubmitting(true)

    try {
      let appointmentData: Record<string, unknown>

      if (isEditing) {
        // En modo edición, solo enviar campos que el doctor puede cambiar
        appointmentData = {
          id: appointment?.id,
          status: formData.status,
          notes: formData.notes,
        }
        console.log(
          '📝 AppointmentModal: Update data prepared:',
          appointmentData
        )
      } else {
        // Modo creación - enviar todos los campos
        console.log('🔍 Date construction values:', {
          date: formData.date,
          time: formData.time,
          combined: `${formData.date}T${formData.time}`,
        })

        // Validar que tengamos fecha y hora válidas
        if (
          !formData.date ||
          !formData.time ||
          formData.date.trim() === '' ||
          formData.time.trim() === ''
        ) {
          console.error('❌ Missing date or time:', {
            date: formData.date,
            time: formData.time,
          })
          throw new Error('Fecha y hora son requeridas')
        }

        // Validación adicional del formato
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        const timeRegex = /^\d{2}:\d{2}$/

        if (!dateRegex.test(formData.date.trim())) {
          console.error('❌ Invalid date format:', formData.date)
          throw new Error('Formato de fecha inválido')
        }

        if (!timeRegex.test(formData.time.trim())) {
          console.error('❌ Invalid time format:', formData.time)
          throw new Error('Formato de hora inválido')
        }

        // Construir fecha de forma segura considerando zona horaria
        // Crear fecha en formato ISO pero asegurándonos que sea válida
        let dateTimeString = `${formData.date.trim()}T${formData.time.trim()}`

        // Asegurar que el tiempo tenga formato completo (HH:MM:SS)
        if (formData.time.trim().length === 5) {
          // HH:MM format
          dateTimeString += ':00'
        }

        console.log('🔍 DateTime string:', dateTimeString)

        const appointmentDate = new Date(dateTimeString)

        // Verificar que la fecha sea válida antes de continuar
        if (isNaN(appointmentDate.getTime())) {
          console.error('❌ Invalid date constructed:', {
            date: formData.date,
            time: formData.time,
            combined: dateTimeString,
            result: appointmentDate,
          })
          throw new Error('Fecha y hora inválidas')
        }

        // Convertir a zona horaria de República Dominicana (UTC-4)
        // Nota: En la mayoría de casos, el backend se encarga de esto,
        // pero nos aseguramos de enviar una fecha válida en ISO
        const isoDate = appointmentDate.toISOString()
        console.log('✅ Valid date constructed:', isoDate)

        appointmentData = {
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          date: isoDate,
          duration: formData.duration,
          type: formData.type,
          status: formData.status,
          notes: formData.notes,
          isRecurring: formData.isRecurring,
          recurringPattern: formData.recurringPattern?.type.toUpperCase() as
            | 'DAILY'
            | 'WEEKLY'
            | 'BIWEEKLY'
            | 'MONTHLY'
            | 'QUARTERLY',
        }
        console.log(
          '📝 AppointmentModal: Create data prepared:',
          appointmentData
        )
      }

      console.log('🔄 AppointmentModal: Calling onSave with:', appointmentData)
      console.log(
        '🔄 AppointmentModal: onSave function:',
        typeof onSave,
        onSave
      )

      await onSave(appointmentData)
      console.log('✅ AppointmentModal: onSave completed successfully')
      onClose()
    } catch (error) {
      console.error('❌ AppointmentModal: Error saving appointment:', error)

      // Mostrar mensaje de error más específico
      if (error instanceof Error) {
        if (error.message === 'Fecha y hora inválidas') {
          setErrors({
            submit:
              'Por favor, seleccione una fecha y hora válidas para la cita',
            date: 'Fecha inválida',
            time: 'Hora inválida',
          })
        } else if (error.message === 'Fecha y hora son requeridas') {
          setErrors({
            submit: 'Debe completar todos los campos requeridos',
            date: 'Fecha requerida',
            time: 'Hora requerida',
          })
        } else if (error.message === 'Formato de fecha inválido') {
          setErrors({
            submit: 'El formato de fecha es incorrecto',
            date: 'Use formato AAAA-MM-DD',
          })
        } else if (error.message === 'Formato de hora inválido') {
          setErrors({
            submit: 'El formato de hora es incorrecto',
            time: 'Use formato HH:MM',
          })
        } else {
          setErrors({ submit: 'Error al guardar la cita: ' + error.message })
        }
      } else {
        setErrors({ submit: 'Error desconocido al guardar la cita' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(DEFAULT_FORM_DATA)
    setErrors({})
    onClose()
  }

  // ==============================================
  // Render Helpers
  // ==============================================

  const renderBasicTab = () => {
    // En modo edición, mostrar vista simplificada para cambio de estado
    if (isEditing) {
      return (
        <div className='space-y-6'>
          {/* Información de la cita (solo lectura) */}
          <div className='p-4 bg-gray-50 rounded-lg space-y-3'>
            <h3 className='font-medium text-gray-900'>
              Información de la cita
            </h3>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Paciente:</span>
                <p className='font-medium'>
                  {selectedPatient
                    ? getPatientFirstName(selectedPatient as PatientLike) +
                      ' ' +
                      getPatientLastName(selectedPatient as PatientLike)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className='text-gray-600'>Doctor:</span>
                <p className='font-medium'>
                  {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </p>
              </div>
              <div>
                <span className='text-gray-600'>Fecha:</span>
                <p className='font-medium'>{formData.date}</p>
              </div>
              <div>
                <span className='text-gray-600'>Hora:</span>
                <p className='font-medium'>{formData.time}</p>
              </div>
              <div>
                <span className='text-gray-600'>Duración:</span>
                <p className='font-medium'>{formData.duration} minutos</p>
              </div>
              <div>
                <span className='text-gray-600'>Tipo:</span>
                <p className='font-medium'>
                  {formData.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                </p>
              </div>
            </div>
          </div>

          {/* Estado de la cita - PRINCIPAL PARA DOCTORES */}
          <div className='space-y-3'>
            <Label className='text-base font-medium'>Estado de la cita</Label>
            <div className='grid grid-cols-2 gap-3'>
              <Button
                type='button'
                variant={
                  formData.status === 'SCHEDULED' ? 'default' : 'outline'
                }
                onClick={() => handleInputChange('status', 'SCHEDULED')}
                disabled={isSubmitting}
                className='flex items-center gap-2 h-12'
              >
                <Calendar className='h-4 w-4' />
                <div className='text-left'>
                  <div className='text-sm font-medium'>Programada</div>
                  <div className='text-xs text-gray-500'>
                    Pendiente confirmación
                  </div>
                </div>
              </Button>

              <Button
                type='button'
                variant={
                  formData.status === 'CONFIRMED' ? 'default' : 'outline'
                }
                onClick={() => handleInputChange('status', 'CONFIRMED')}
                disabled={isSubmitting}
                className='flex items-center gap-2 h-12'
              >
                <Save className='h-4 w-4' />
                <div className='text-left'>
                  <div className='text-sm font-medium'>Confirmada</div>
                  <div className='text-xs text-gray-500'>
                    Lista para la cita
                  </div>
                </div>
              </Button>

              <Button
                type='button'
                variant={
                  formData.status === 'COMPLETED' ? 'default' : 'outline'
                }
                onClick={() => handleInputChange('status', 'COMPLETED')}
                disabled={isSubmitting}
                className='flex items-center gap-2 h-12'
              >
                <Save className='h-4 w-4' />
                <div className='text-left'>
                  <div className='text-sm font-medium'>Completada</div>
                  <div className='text-xs text-gray-500'>Cita finalizada</div>
                </div>
              </Button>

              <Button
                type='button'
                variant={formData.status === 'NO_SHOW' ? 'default' : 'outline'}
                onClick={() => handleInputChange('status', 'NO_SHOW')}
                disabled={isSubmitting}
                className='flex items-center gap-2 h-12'
              >
                <X className='h-4 w-4' />
                <div className='text-left'>
                  <div className='text-sm font-medium'>No Show</div>
                  <div className='text-xs text-gray-500'>
                    Paciente no asistió
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Botón de cancelación especial */}
          <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium text-red-900'>Cancelar cita</h4>
                <p className='text-sm text-red-700'>
                  Esta acción enviará notificación al paciente
                </p>
              </div>
              <Button
                type='button'
                variant={
                  formData.status === 'CANCELLED' ? 'default' : 'outline'
                }
                onClick={() => handleInputChange('status', 'CANCELLED')}
                disabled={isSubmitting}
                className='border-red-300 text-red-700 hover:bg-red-100'
              >
                {formData.status === 'CANCELLED' ? 'Cancelada' : 'Cancelar'}
              </Button>
            </div>
          </div>

          {/* Notas para el doctor */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Notas clínicas</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder='Agregar notas sobre la consulta...'
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )
    }

    // Modo creación - vista completa
    return (
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
            {patientOptions
              .filter((patient) => getPatientId(patient as PatientLike))
              .map((patient) => (
                <option
                  key={getPatientId(patient as PatientLike)}
                  value={getPatientId(patient as PatientLike)}
                >
                  {getPatientFirstName(patient as PatientLike) +
                    ' ' +
                    getPatientLastName(patient as PatientLike)}
                </option>
              ))}
            {patientOptions.filter((patient) =>
              getPatientId(patient as PatientLike)
            ).length === 0 && (
              <option disabled>No hay pacientes válidos</option>
            )}
          </select>
          {errors.patientId && (
            <p className='text-sm text-red-600'>{errors.patientId}</p>
          )}
        </div>

        {/* Doctor Selection */}
        <div className='space-y-2'>
          <Label htmlFor='doctor'>Doctor *</Label>
          {permissions.isDoctor ? (
            // Si es doctor, mostrar información en modo solo lectura
            <div className='w-full p-3 border rounded-md bg-gray-50'>
              <div className='flex items-center gap-2'>
                <Stethoscope className='h-4 w-4 text-blue-600' />
                <span className='font-medium'>
                  {user?.firstName || 'N/A'} {user?.lastName || ''}
                </span>
                <Badge variant='outline' className='ml-auto'>
                  Usted
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Como doctor, las citas se asignan automáticamente a usted
              </p>
            </div>
          ) : (
            // Si no es doctor (admin), mostrar selector
            <select
              id='doctor'
              value={formData.doctorId}
              onChange={(e) => handleInputChange('doctorId', e.target.value)}
              className='w-full p-2 border rounded-md'
              disabled={isSubmitting}
            >
              <option value=''>Seleccionar doctor...</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                  {doctor.specialties &&
                    doctor.specialties.length > 0 &&
                    ` - ${doctor.specialties[0].name}`}
                </option>
              ))}
            </select>
          )}
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
              min={format(new Date(), 'yyyy-MM-dd')} // No permitir fechas pasadas
              max={format(
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                'yyyy-MM-dd'
              )} // Máximo 1 año en el futuro
            />
            {errors.date && (
              <p className='text-sm text-red-600'>{errors.date}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='time'>Hora *</Label>
            <Input
              id='time'
              type='time'
              value={formData.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={isSubmitting}
              min='06:00' // Horario mínimo 6 AM
              max='22:00' // Horario máximo 10 PM
              step='900' // Intervalos de 15 minutos
            />
            {errors.time && (
              <p className='text-sm text-red-600'>{errors.time}</p>
            )}
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
              disabled={isSubmitting || !permissions.canCreateVirtual}
              className='flex items-center gap-2'
              title={
                !permissions.canCreateVirtual
                  ? permissions.isDoctor
                    ? 'Los doctores solo pueden crear citas presenciales'
                    : 'Sin permisos para citas virtuales'
                  : undefined
              }
            >
              <Video className='h-4 w-4' />
              Virtual
              {!permissions.canCreateVirtual && (
                <span className='text-xs text-muted-foreground ml-1'>
                  (No disponible)
                </span>
              )}
            </Button>
          </div>

          {/* Mensaje explicativo para doctores */}
          {permissions.isDoctor && !permissions.canCreateVirtual && (
            <div className='text-xs text-muted-foreground bg-blue-50 p-2 rounded-md border border-blue-200'>
              <div className='flex items-start gap-2'>
                <Video className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-blue-900'>Citas Virtuales</p>
                  <p>
                    Las citas virtuales deben ser creadas por el paciente desde
                    la aplicación móvil. Como doctor, solo puede crear citas
                    presenciales que requieren su presencia física en la
                    clínica.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.type && <p className='text-sm text-red-600'>{errors.type}</p>}
        </div>

        {/* Virtual Meeting Setup */}
        {formData.type === 'VIRTUAL' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='space-y-4 p-4 border rounded-lg bg-blue-50'
          >
            <div className='flex items-center gap-2'>
              <Monitor className='h-5 w-5 text-blue-600' />
              <Label className='text-sm font-medium text-blue-800'>
                Cita Virtual
              </Label>
            </div>
            <p className='text-sm text-blue-700'>
              {appointment?.videoLink
                ? 'El enlace de la reunión virtual estará disponible cuando la cita sea confirmada.'
                : 'Esta es una cita virtual. El enlace de reunión se generará automáticamente usando el enlace permanente del doctor cuando la cita sea confirmada.'}
            </p>
            {appointment?.videoLink && appointment.status === 'CONFIRMED' && (
              <div className='p-3 bg-white rounded border'>
                <Label className='text-sm font-medium'>
                  Enlace de reunión:
                </Label>
                <div className='flex items-center gap-2 mt-1'>
                  <Input
                    value={appointment.videoLink}
                    readOnly
                    className='text-sm'
                  />
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => window.open(appointment.videoLink, '_blank')}
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            )}
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
      </div>
    )
  }

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
                {(() => {
                  const title = isEditing ? 'Editar Cita' : 'Nueva Cita'
                  console.log('🎯 Modal Title Render:', {
                    isEditing,
                    title,
                    appointment: appointment?.id,
                  })
                  return title
                })()}
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
                    {selectedPatient
                      ? getPatientFirstName(selectedPatient as PatientLike) +
                        ' ' +
                        getPatientLastName(selectedPatient as PatientLike)
                      : 'N/A'}
                  </Badge>
                )}
                {selectedDoctor && (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Stethoscope className='h-3 w-3' />
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </Badge>
                )}
              </div>
            )}

            {/* Form Tabs */}
            {isEditing ? (
              // En modo edición, solo mostrar contenido simplificado
              <div className='space-y-4'>{renderBasicTab()}</div>
            ) : (
              // En modo creación, mostrar pestañas completas
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
            )}

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
