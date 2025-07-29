'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Pill,
  FileText,
  Save,
  X,
  Plus,
  Minus,
  AlertCircle,
  Info,
  User,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import {
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionStatus,
  getPrescriptionStatusText,
} from '../types'
import { MedicalRecord } from '@/features/medical-records/types'
import {
  useCreatePrescription,
  useUpdatePrescription,
} from '../hooks/use-prescriptions'
import {
  usePatients,
  PatientResponseDto,
} from '@/features/medical-records/hooks/use-patients'
import { usePatientMedicalRecords } from '@/features/medical-records/hooks/use-medical-records'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

interface PrescriptionFormProps {
  isOpen: boolean
  onClose: () => void
  prescription?: Prescription
  selectedPatientId?: string
  medicalRecordId?: string
  onSuccess?: () => void
}

// Enhanced validation schema with better error messages
const createPrescriptionSchema = (isEditMode: boolean) =>
  z.object({
    medicalRecordId: isEditMode
      ? z.string().optional()
      : z.string().min(1, 'Debes seleccionar un registro médico'),
    doctorId: z.string().min(1, 'ID del doctor es requerido'),
    patientId: z.string().min(1, 'Debes seleccionar un paciente'),
    status: z.nativeEnum(PrescriptionStatus, {
      errorMap: () => ({ message: 'Selecciona un estado válido' }),
    }),
    validUntil: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
    notes: z
      .string()
      .max(1000, 'Las notas no pueden exceder 1000 caracteres')
      .optional(),
    appointmentId: z.string().optional().or(z.literal('')),
    medications: z
      .array(
        z.object({
          medicineName: z
            .string()
            .min(
              2,
              'El nombre del medicamento debe tener al menos 2 caracteres'
            )
            .max(
              100,
              'El nombre del medicamento no puede exceder 100 caracteres'
            ),
          concentration: z
            .string()
            .max(50, 'La concentración no puede exceder 50 caracteres')
            .optional(),
          form: z
            .string()
            .max(50, 'La forma no puede exceder 50 caracteres')
            .optional(),
          dosage: z
            .string()
            .min(2, 'La dosis debe tener al menos 2 caracteres')
            .max(100, 'La dosis no puede exceder 100 caracteres'),
          frequency: z
            .string()
            .min(2, 'La frecuencia debe tener al menos 2 caracteres')
            .max(100, 'La frecuencia no puede exceder 100 caracteres'),
          duration: z
            .string()
            .min(2, 'La duración debe tener al menos 2 caracteres')
            .max(100, 'La duración no puede exceder 100 caracteres'),
          instructions: z
            .string()
            .max(200, 'Las instrucciones no pueden exceder 200 caracteres')
            .optional(),
          quantity: z
            .string()
            .max(50, 'La cantidad no puede exceder 50 caracteres')
            .optional(),
        })
      )
      .min(1, 'Debes agregar al menos un medicamento')
      .max(20, 'No puedes agregar más de 20 medicamentos'),
  })

type PrescriptionFormData = z.infer<ReturnType<typeof createPrescriptionSchema>>

// Component for form field with error handling
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  description?: string
  icon?: React.ReactNode
}

const FormField = ({
  label,
  required,
  error,
  children,
  description,
  icon,
}: FormFieldProps) => (
  <div className='space-y-2'>
    <Label className='flex items-center gap-2 text-sm font-medium'>
      {icon && <span className='text-muted-foreground'>{icon}</span>}
      {label}
      {required && <span className='text-red-500'>*</span>}
    </Label>
    {children}
    {error && (
      <div className='flex items-center gap-1 text-sm text-red-600'>
        <AlertCircle className='h-4 w-4' />
        {error}
      </div>
    )}
    {description && !error && (
      <p className='text-xs text-muted-foreground'>{description}</p>
    )}
  </div>
)

// Component for medication field
interface MedicationFieldProps {
  label: string
  placeholder: string
  register: Record<string, unknown>
  error?: string
  description?: string
  icon?: React.ReactNode
}

const MedicationField = ({
  label,
  placeholder,
  register,
  error,
  description,
  icon,
}: MedicationFieldProps) => (
  <FormField label={label} icon={icon} error={error} description={description}>
    <Input
      placeholder={placeholder}
      {...register}
      className={error ? 'border-red-500 focus:border-red-500' : ''}
    />
  </FormField>
)

export function PrescriptionForm({
  isOpen,
  onClose,
  prescription,
  selectedPatientId: propSelectedPatientId,
  medicalRecordId,
  onSuccess,
}: PrescriptionFormProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreatePrescription()
  const updateMutation = useUpdatePrescription()

  const isEditMode = Boolean(prescription)
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Get necessary data
  const { data: patientsData } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    propSelectedPatientId || prescription?.patientId || ''
  )

  // Find selected patient to get patientProfileId
  const selectedPatient = patientsData?.data?.find(
    (patient: PatientResponseDto) => patient.id === selectedPatientId
  )

  // Use prescription.patient in edit mode, otherwise use selectedPatient from patientsData
  const displayPatient =
    isEditMode && prescription?.patient
      ? {
          id: prescription.patient.id,
          user: {
            firstName: prescription.patient.firstName,
            lastName: prescription.patient.lastName,
            email: prescription.patient.email,
          },
        }
      : selectedPatient

  // Use prescription.patientId in edit mode, otherwise use selectedPatientId
  const patientIdForRecords =
    isEditMode && prescription ? prescription.patientId : selectedPatientId

  const { data: medicalRecordsData, isLoading: medicalRecordsLoading } =
    usePatientMedicalRecords(patientIdForRecords, {}, !!patientIdForRecords)

  // Debug logs
  console.log('🏥 [PrescriptionForm] Debug data:', {
    patientsData: patientsData?.data?.length || 0,
    selectedPatientId,
    propSelectedPatientId,
    prescriptionPatientId: prescription?.patientId,
    prescriptionPatient: prescription?.patient
      ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
      : 'Not found',
    selectedPatient: selectedPatient?.id,
    selectedPatientName: selectedPatient
      ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`
      : 'Not found',
    displayPatient: displayPatient?.id,
    displayPatientName: displayPatient
      ? `${displayPatient.user.firstName} ${displayPatient.user.lastName}`
      : 'Not found',
    medicalRecordsData: medicalRecordsData?.data?.length || 0,
    medicalRecordsLoading,
    isEditMode,
  })

  // Form setup with better default values
  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(createPrescriptionSchema(isEditMode)),
    mode: 'onChange',
    defaultValues: {
      medicalRecordId: medicalRecordId || '',
      doctorId: user?.id || '',
      patientId: propSelectedPatientId || selectedPatient?.id || '',
      status: PrescriptionStatus.ACTIVE,
      validUntil: '',
      notes: '',
      appointmentId: undefined,
      medications: [
        {
          medicineName: '',
          concentration: '',
          form: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: '',
        },
      ],
    },
  })

  // Sync selectedPatientId with propSelectedPatientId or prescription.patientId
  useEffect(() => {
    if (propSelectedPatientId) {
      setSelectedPatientId(propSelectedPatientId)
    } else if (prescription?.patientId && isEditMode) {
      setSelectedPatientId(prescription.patientId)
    }
  }, [propSelectedPatientId, prescription?.patientId, isEditMode])

  // Enhanced data loading for edit mode
  useEffect(() => {
    if (prescription && isOpen) {
      // Update selectedPatientId when editing
      setSelectedPatientId(prescription.patientId)

      form.reset({
        medicalRecordId: prescription.medicalRecordId,
        doctorId: prescription.doctorId,
        patientId: prescription.patientId,
        status: prescription.status,
        validUntil: prescription.validUntil.split('T')[0],
        notes: prescription.notes || '',
        appointmentId: prescription.appointmentId || undefined,
        medications: prescription.medications.map((pm) => ({
          medicineName: pm.medicineName,
          concentration: pm.concentration || '',
          form: pm.form || '',
          dosage: pm.dosage,
          frequency: pm.frequency,
          duration: pm.duration,
          instructions: pm.instructions || '',
          quantity: pm.quantity || '',
        })),
      })
    } else if (!prescription && isOpen) {
      // Reset form for new prescription
      form.reset({
        medicalRecordId: medicalRecordId || '',
        doctorId: user?.id || '',
        patientId: propSelectedPatientId || selectedPatient?.id || '',
        status: PrescriptionStatus.ACTIVE,
        validUntil: '',
        notes: '',
        appointmentId: undefined,
        medications: [
          {
            medicineName: '',
            concentration: '',
            form: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: '',
          },
        ],
      })
    }
  }, [
    prescription,
    isOpen,
    medicalRecordId,
    user?.id,
    selectedPatient?.id,
    form,
  ])

  // Update selectedPatientId when propSelectedPatientId changes
  useEffect(() => {
    if (propSelectedPatientId && propSelectedPatientId !== selectedPatientId) {
      setSelectedPatientId(propSelectedPatientId)
    }
  }, [propSelectedPatientId, selectedPatientId])

  // Enhanced form submission with better error handling
  const onSubmit = useCallback(
    async (data: PrescriptionFormData) => {
      if (isSubmitting) return

      try {
        setIsSubmitting(true)

        if (!isDoctor) {
          toast.error('Solo los doctores pueden crear/editar prescripciones')
          return
        }
        if (!user?.id) {
          toast.error('Usuario no autenticado')
          return
        }

        // Validate form before submission
        const isValid = await form.trigger()
        if (!isValid) {
          toast.error('Por favor, corrige los errores en el formulario')
          return
        }

        if (isEditMode && prescription) {
          const updateData: UpdatePrescriptionDto = {
            status: data.status,
            validUntil: data.validUntil,
            notes: data.notes,
            medications: data.medications.map((med) => ({
              medicineName: med.medicineName,
              concentration: med.concentration || undefined,
              form: med.form || undefined,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions || undefined,
              quantity: med.quantity || undefined,
            })),
          }

          await updateMutation.mutateAsync({
            id: prescription.id,
            data: updateData,
          })
          toast.success('Prescripción actualizada correctamente')
        } else {
          const createData: CreatePrescriptionDto = {
            medicalRecordId: data.medicalRecordId!,
            doctorId: data.doctorId,
            patientId: data.patientId,
            status: data.status,
            validUntil: data.validUntil,
            notes: data.notes,
            appointmentId: data.appointmentId || undefined,
            medications: data.medications.map((med) => ({
              medicineName: med.medicineName,
              concentration: med.concentration || undefined,
              form: med.form || undefined,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions || undefined,
              quantity: med.quantity || undefined,
            })),
          }

          console.log(
            '🏥 [PrescriptionForm] Creating prescription with data:',
            createData
          )

          await createMutation.mutateAsync(createData)
          toast.success('Prescripción creada correctamente')
        }

        onClose()
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('Error submitting prescription:', error)
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error('Error al procesar la prescripción')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      isSubmitting,
      isDoctor,
      user?.id,
      form,
      isEditMode,
      prescription,
      updateMutation,
      createMutation,
      onClose,
      onSuccess,
      selectedPatient?.id,
    ]
  )

  const handleCancel = useCallback(() => {
    if (isSubmitting) return

    const hasChanges = form.formState.isDirty
    if (hasChanges) {
      const confirmed = window.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.'
      )
      if (!confirmed) return
    }

    onClose()
    form.reset()
  }, [isSubmitting, form, onClose])

  // Check if form has required fields filled
  const watchedValues = form.watch()
  const hasRequiredFields = (() => {
    const hasMedicalRecord =
      watchedValues.medicalRecordId &&
      watchedValues.medicalRecordId.trim() !== ''
    const hasPatient =
      watchedValues.patientId && watchedValues.patientId.trim() !== ''
    const hasValidUntil =
      watchedValues.validUntil && watchedValues.validUntil.trim() !== ''
    const hasMedications =
      watchedValues.medications && watchedValues.medications.length > 0
    const hasValidMedications = watchedValues.medications?.every(
      (med) =>
        med.medicineName.trim() !== '' &&
        med.dosage.trim() !== '' &&
        med.frequency.trim() !== '' &&
        med.duration.trim() !== ''
    )

    if (isEditMode) {
      return hasValidUntil && hasMedications && hasValidMedications
    } else {
      return (
        hasMedicalRecord &&
        hasPatient &&
        hasValidUntil &&
        hasMedications &&
        hasValidMedications
      )
    }
  })()

  const isFormValid = form.formState.isValid && hasRequiredFields

  // Trigger validation when required fields change
  useEffect(() => {
    const fieldsToValidate = isEditMode
      ? (['validUntil', 'medications'] as const)
      : (['medicalRecordId', 'patientId', 'validUntil', 'medications'] as const)

    form.trigger(fieldsToValidate)
  }, [
    watchedValues.medicalRecordId,
    watchedValues.patientId,
    watchedValues.validUntil,
    watchedValues.medications,
    isEditMode,
  ])

  // Add medication
  const addMedication = useCallback(() => {
    const currentMedications = form.getValues('medications')
    if (currentMedications.length < 20) {
      form.setValue('medications', [
        ...currentMedications,
        {
          medicineName: '',
          concentration: '',
          form: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: '',
        },
      ])
    } else {
      toast.error('No puedes agregar más de 20 medicamentos')
    }
  }, [form])

  // Remove medication
  const removeMedication = useCallback(
    (index: number) => {
      const currentMedications = form.getValues('medications')
      if (currentMedications.length > 1) {
        form.setValue(
          'medications',
          currentMedications.filter((_, i) => i !== index)
        )
      } else {
        toast.error('Debe haber al menos un medicamento')
      }
    },
    [form]
  )

  if (!isDoctor) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              Acceso Denegado
            </DialogTitle>
            <DialogDescription>
              Solo los doctores pueden crear y editar prescripciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-7xl max-h-[95vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Pill className='h-5 w-5' />
            {isEditMode ? 'Editar Prescripción' : 'Crear Nueva Prescripción'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica la información de la prescripción'
              : 'Completa la información para crear una nueva prescripción'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
              <p className='text-sm text-muted-foreground'>Cargando...</p>
            </div>
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger
                    value='basic'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Información Básica</span>
                    <span className='sm:hidden'>Básica</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='medications'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Medicamentos</span>
                    <span className='sm:hidden'>Medicamentos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='details'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Detalles</span>
                    <span className='sm:hidden'>Detalles</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value='basic' className='space-y-6'>
                  {/* Patient and Medical Record Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <User className='h-5 w-5' />
                        Información del Paciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {isEditMode ? (
                        // Display patient information in edit mode
                        <div className='space-y-4'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-blue-600' />
                            <label className='text-sm font-medium text-gray-700'>
                              Paciente
                            </label>
                          </div>
                          {displayPatient ? (
                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                              <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                  <User className='w-5 h-5 text-blue-600' />
                                </div>
                                <div className='flex-1'>
                                  <h4 className='font-semibold text-gray-900'>
                                    {displayPatient.user.firstName}{' '}
                                    {displayPatient.user.lastName}
                                  </h4>
                                  <p className='text-sm text-gray-600'>
                                    {displayPatient.user.email}
                                  </p>
                                </div>
                                <div className='text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full'>
                                  Paciente Asociado
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                              <div className='flex items-center gap-2 text-gray-500'>
                                <div className='w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                                <span className='text-sm'>
                                  Cargando información del paciente...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Patient selector for create mode
                        <FormField
                          label='Paciente'
                          required
                          error={form.formState.errors.patientId?.message}
                          description='Selecciona el paciente para la prescripción'
                        >
                          <Controller
                            name='patientId'
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ''}
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  setSelectedPatientId(value)
                                  form.clearErrors('patientId')
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona un paciente' />
                                </SelectTrigger>
                                <SelectContent>
                                  {patientsData?.data?.map(
                                    (patient: PatientResponseDto) => (
                                      <SelectItem
                                        key={patient.id}
                                        value={patient.id}
                                      >
                                        {patient.user.firstName}{' '}
                                        {patient.user.lastName} -{' '}
                                        {patient.user.email}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                      )}

                      {!isEditMode && (
                        <FormField
                          label='Registro Médico'
                          required
                          error={form.formState.errors.medicalRecordId?.message}
                          description='Selecciona el registro médico asociado'
                        >
                          <Controller
                            name='medicalRecordId'
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ''}
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  form.clearErrors('medicalRecordId')
                                }}
                                disabled={
                                  medicalRecordsLoading || !selectedPatientId
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      !selectedPatientId
                                        ? 'Primero selecciona un paciente'
                                        : medicalRecordsLoading
                                        ? 'Cargando registros...'
                                        : 'Selecciona un registro médico'
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicalRecordsLoading ? (
                                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                      Cargando registros médicos...
                                    </div>
                                  ) : medicalRecordsData?.data?.length === 0 ? (
                                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                      No hay registros médicos disponibles para
                                      este paciente
                                    </div>
                                  ) : (
                                    medicalRecordsData?.data?.map(
                                      (record: MedicalRecord) => (
                                        <SelectItem
                                          key={record.id}
                                          value={record.id}
                                        >
                                          {new Date(
                                            record.date
                                          ).toLocaleDateString('es-ES')}{' '}
                                          - {record.diagnosis.substring(0, 50)}
                                          ...
                                        </SelectItem>
                                      )
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                      )}
                    </CardContent>
                  </Card>

                  {/* Prescription Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Detalles de la Prescripción
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <FormField
                          label='Estado'
                          icon={<CheckCircle2 className='h-4 w-4' />}
                          error={form.formState.errors.status?.message}
                        >
                          <Controller
                            name='status'
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona un estado' />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(PrescriptionStatus).map(
                                    (status) => (
                                      <SelectItem key={status} value={status}>
                                        {getPrescriptionStatusText(status)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>

                        <FormField
                          label='Fecha de Vencimiento'
                          required
                          icon={<Calendar className='h-4 w-4' />}
                          error={form.formState.errors.validUntil?.message}
                          description='Fecha hasta la cual es válida la prescripción'
                        >
                          <Input
                            type='date'
                            {...form.register('validUntil')}
                            className={
                              form.formState.errors.validUntil
                                ? 'border-red-500'
                                : ''
                            }
                          />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value='medications' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Pill className='h-5 w-5' />
                        Medicamentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {form.watch('medications').map((medication, index) => (
                        <div
                          key={index}
                          className='border rounded-lg p-4 space-y-4'
                        >
                          <div className='flex items-center justify-between'>
                            <h4 className='font-medium'>
                              Medicamento {index + 1}
                            </h4>
                            {form.watch('medications').length > 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => removeMedication(index)}
                                className='text-red-600 hover:text-red-700'
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                            )}
                          </div>

                          <div className='grid gap-4 md:grid-cols-2'>
                            <MedicationField
                              label='Nombre del Medicamento'
                              placeholder='Ej: Amoxicilina, Acetaminofén'
                              register={form.register(
                                `medications.${index}.medicineName`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.medicineName?.message
                              }
                              icon={<Pill className='h-4 w-4' />}
                              description='Nombre comercial o genérico del medicamento'
                            />

                            <MedicationField
                              label='Concentración'
                              placeholder='Ej: 500mg, 250mg/5ml'
                              register={form.register(
                                `medications.${index}.concentration`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.concentration?.message
                              }
                              description='Concentración del medicamento'
                            />

                            <MedicationField
                              label='Forma'
                              placeholder='Ej: tabletas, jarabe, cápsulas'
                              register={form.register(
                                `medications.${index}.form`
                              )}
                              error={
                                form.formState.errors.medications?.[index]?.form
                                  ?.message
                              }
                              description='Forma farmacéutica'
                            />

                            <MedicationField
                              label='Dosis'
                              placeholder='Ej: 1 tableta, 5ml, 2 cápsulas'
                              register={form.register(
                                `medications.${index}.dosage`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.dosage?.message
                              }
                              description='Cantidad por toma'
                            />

                            <MedicationField
                              label='Frecuencia'
                              placeholder='Ej: cada 8 horas, dos veces al día'
                              register={form.register(
                                `medications.${index}.frequency`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.frequency?.message
                              }
                              description='Con qué frecuencia tomar'
                            />

                            <MedicationField
                              label='Duración'
                              placeholder='Ej: por 7 días, hasta terminar'
                              register={form.register(
                                `medications.${index}.duration`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.duration?.message
                              }
                              description='Por cuánto tiempo tomar'
                            />

                            <MedicationField
                              label='Cantidad'
                              placeholder='Ej: 30 tabletas, 120ml'
                              register={form.register(
                                `medications.${index}.quantity`
                              )}
                              error={
                                form.formState.errors.medications?.[index]
                                  ?.quantity?.message
                              }
                              description='Cantidad total a dispensar'
                            />
                          </div>

                          <FormField
                            label='Instrucciones Especiales'
                            error={
                              form.formState.errors.medications?.[index]
                                ?.instructions?.message
                            }
                            description='Instrucciones adicionales (ej: con las comidas, en ayunas)'
                          >
                            <Textarea
                              placeholder='Ej: tomar con las comidas, evitar alcohol...'
                              {...form.register(
                                `medications.${index}.instructions`
                              )}
                              className={
                                form.formState.errors.medications?.[index]
                                  ?.instructions
                                  ? 'border-red-500'
                                  : ''
                              }
                            />
                          </FormField>
                        </div>
                      ))}

                      <Button
                        type='button'
                        variant='outline'
                        onClick={addMedication}
                        className='w-full'
                        disabled={form.watch('medications').length >= 20}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Agregar Medicamento
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value='details' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Info className='h-5 w-5' />
                        Notas Adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        label='Notas del Doctor'
                        error={form.formState.errors.notes?.message}
                        description='Observaciones adicionales sobre la prescripción'
                      >
                        <Textarea
                          placeholder='Notas adicionales sobre la prescripción...'
                          className='min-h-[120px]'
                          {...form.register('notes')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Enhanced Footer */}
              <DialogFooter className='flex flex-col sm:flex-row gap-3 pt-6 border-t'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Info className='h-4 w-4' />
                  <span>Los campos marcados con * son obligatorios</span>
                </div>

                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                    disabled={isLoading || isSubmitting}
                  >
                    <X className='mr-2 h-4 w-4' />
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading || isSubmitting || !isFormValid}
                  >
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting
                      ? isEditMode
                        ? 'Actualizando...'
                        : 'Creando...'
                      : isEditMode
                      ? 'Actualizar Prescripción'
                      : 'Crear Prescripción'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
