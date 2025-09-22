'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  Activity,
  FileText,
  Stethoscope,
  Clock,
  Save,
  X,
  AlertCircle,
  Info,
  User,
  Calendar,
  Thermometer,
  Heart,
  Weight,
  Ruler,
  Wind,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  MedicalRecord,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordCategory,
  Priority,
  getCategoryText,
  getPriorityText,
} from '../types'
import {
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
} from '../hooks/use-medical-records'
import { MedicalRecordFormSkeleton } from './medical-records-skeleton'
import { PatientSelector } from './patient-selector'
import { PatientDisplay } from './patient-display'

// Enhanced validation schema with better error messages
const createMedicalRecordSchema = (isEditMode: boolean) =>
  z.object({
    patientProfileId: isEditMode
      ? z.string().optional()
      : z.string().min(1, 'Debes seleccionar un paciente'),
    date: z.string().min(1, 'La fecha de consulta es obligatoria'),
    category: z
      .nativeEnum(MedicalRecordCategory, {
        errorMap: () => ({ message: 'Selecciona una categoría válida' }),
      })
      .optional(),
    priority: z
      .nativeEnum(Priority, {
        errorMap: () => ({ message: 'Selecciona una prioridad válida' }),
      })
      .optional(),
    symptoms: z
      .string()
      .min(10, 'Los síntomas deben tener al menos 10 caracteres')
      .max(1000, 'Los síntomas no pueden exceder 1000 caracteres'),
    diagnosis: z
      .string()
      .min(10, 'El diagnóstico debe tener al menos 10 caracteres')
      .max(1000, 'El diagnóstico no puede exceder 1000 caracteres'),
    treatment: z
      .string()
      .max(2000, 'El tratamiento no puede exceder 2000 caracteres')
      .optional(),
    notes: z
      .string()
      .max(2000, 'Las notas no pueden exceder 2000 caracteres')
      .optional(),
    followUpDate: z.string().optional(),
    allergiesText: z
      .string()
      .max(500, 'Las alergias no pueden exceder 500 caracteres')
      .optional(),
    // Vital signs with better validation
    bloodPressure: z
      .string()
      .regex(/^\d{2,3}\/\d{2,3}$|^$/, 'Formato: 120/80')
      .optional(),
    heartRate: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 30 && parseFloat(val) <= 250),
        {
          message: 'La frecuencia cardíaca debe ser entre 30 y 250 bpm',
        }
      ),
    temperature: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 30 && parseFloat(val) <= 45),
        {
          message: 'La temperatura debe ser entre 30°C y 45°C',
        }
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 5 && parseFloat(val) <= 330),
        {
          message: 'El peso debe ser entre 5 y 330 lbs',
        }
      ),
    height: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 0.5 && parseFloat(val) <= 2.5),
        {
          message: 'La altura debe ser entre 0.5 y 2.5 m',
        }
      ),
    oxygenSaturation: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 70 && parseFloat(val) <= 100),
        {
          message: 'La saturación debe ser entre 70% y 100%',
        }
      ),
    respiratoryRate: z
      .string()
      .optional()
      .refine(
        (val) => !val || (parseFloat(val) >= 8 && parseFloat(val) <= 60),
        {
          message: 'La frecuencia respiratoria debe ser entre 8 y 60 rpm',
        }
      ),
    vitalSignsNotes: z
      .string()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional(),
  })

type MedicalRecordFormData = z.infer<
  ReturnType<typeof createMedicalRecordSchema>
>

interface MedicalRecordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: MedicalRecord | null
  patientId?: string
  onSuccess?: () => void
}

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

// Component for vital sign field
interface VitalSignFieldProps {
  label: string
  unit: string
  icon?: React.ReactNode
  placeholder: string
  register: Record<string, unknown>
  error?: string
  type?: string
  step?: string
}

const VitalSignField = ({
  label,
  unit,
  icon,
  placeholder,
  register,
  error,
  type = 'number',
  step,
}: VitalSignFieldProps) => (
  <FormField
    label={label}
    icon={icon}
    error={error}
    description={`Unidad: ${unit} | Rango: ${placeholder}`}
  >
    <Input
      type={type}
      placeholder={placeholder}
      step={step}
      {...register}
      className={error ? 'border-red-500 focus:border-red-500' : ''}
    />
  </FormField>
)

// Helper conversions between metric/imperial for interoperability with backend
const metersToInches = (meters: number): number => meters * 39.3700787
const inchesToMeters = (inches: number): number => inches / 39.3700787

export function MedicalRecordForm({
  open,
  onOpenChange,
  record,
  patientId,
  onSuccess,
}: MedicalRecordFormProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateMedicalRecord()
  const updateMutation = useUpdateMedicalRecord()

  const isEditMode = Boolean(record)
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Form setup with better default values
  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(createMedicalRecordSchema(isEditMode)),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      patientProfileId: patientId || '',
      date: new Date().toISOString().split('T')[0],
      category: undefined,
      priority: undefined,
      symptoms: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      followUpDate: '',
      allergiesText: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: '',
      respiratoryRate: '',
      vitalSignsNotes: '',
    },
  })

  // Extraer control para useWatch
  const { control } = form
  // Observaciones de campos requeridos
  const [symptoms, diagnosis, patientProfileId, date] = useWatch({
    control,
    name: ['symptoms', 'diagnosis', 'patientProfileId', 'date'],
  })
  // Observaciones de signos vitales
  const [
    bloodPressure,
    heartRate,
    temperature,
    weight,
    height,
    oxygenSaturation,
    respiratoryRate,
  ] = useWatch({
    control,
    name: [
      'bloodPressure',
      'heartRate',
      'temperature',
      'weight',
      'height',
      'oxygenSaturation',
      'respiratoryRate',
    ],
  })

  // Enhanced data loading for edit mode
  useEffect(() => {
    if (record && open) {
      const symptomsText = Array.isArray(record.symptoms)
        ? record.symptoms.join(', ')
        : record.symptoms || ''

      const allergiesText = Array.isArray(record.allergies)
        ? record.allergies.join(', ')
        : ''

      form.reset({
        patientProfileId: record.patientProfileId,
        date: record.date.split('T')[0],
        category: record.category || undefined,
        priority: record.priority || undefined,
        symptoms: symptomsText,
        diagnosis: record.diagnosis,
        treatment: record.treatment || '',
        notes: record.notes || '',
        followUpDate:
          record.followUpDate && record.followUpDate !== 'null'
            ? record.followUpDate.split('T')[0]
            : '',
        allergiesText: allergiesText,
        bloodPressure: record.vitalSigns?.bloodPressure || '',
        heartRate: record.vitalSigns?.heartRate?.toString() || '',
        temperature: record.vitalSigns?.temperature?.toString() || '',
        weight: record.vitalSigns?.weight?.toString() || '',
        // Convert backend inches -> meters for UI
        height:
          record.vitalSigns?.height !== undefined &&
          record.vitalSigns?.height !== null
            ? inchesToMeters(Number(record.vitalSigns.height)).toFixed(2)
            : '',
        oxygenSaturation: record.vitalSigns?.oxygenSaturation?.toString() || '',
        respiratoryRate: record.vitalSigns?.respiratoryRate?.toString() || '',
        vitalSignsNotes: record.vitalSigns?.notes || '',
      })
    } else if (!record && open) {
      // Reset form for new record
      form.reset({
        patientProfileId: patientId || '',
        date: new Date().toISOString().split('T')[0],
        category: undefined,
        priority: undefined,
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        followUpDate: '',
        allergiesText: '',
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
        respiratoryRate: '',
        vitalSignsNotes: '',
      })
    }
  }, [record, open, patientId, form])

  // Enhanced form submission with better error handling
  const onSubmit = useCallback(
    async (data: MedicalRecordFormData) => {
      if (isSubmitting) return

      try {
        setIsSubmitting(true)

        if (!isDoctor) {
          toast.error('Solo los doctores pueden crear/editar registros médicos')
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

        // Convert form data to DTO format
        const symptoms = data.symptoms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        const allergies = data.allergiesText
          ? data.allergiesText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : []

        // Helper function to clean vital signs values
        const cleanVitalSignValue = (
          value: number | string | undefined
        ): number | undefined => {
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            value === 0 ||
            (typeof value === 'number' && isNaN(value))
          ) {
            return undefined
          }
          // Convert string to number if needed
          const numValue = typeof value === 'string' ? parseFloat(value) : value
          return isNaN(numValue) ? undefined : numValue
        }

        const vitalSigns =
          data.bloodPressure ||
          cleanVitalSignValue(data.heartRate) ||
          cleanVitalSignValue(data.temperature) ||
          cleanVitalSignValue(data.weight) ||
          cleanVitalSignValue(data.height) ||
          cleanVitalSignValue(data.oxygenSaturation) ||
          cleanVitalSignValue(data.respiratoryRate) ||
          data.vitalSignsNotes
            ? {
                bloodPressure: data.bloodPressure || undefined,
                heartRate: cleanVitalSignValue(data.heartRate),
                temperature: cleanVitalSignValue(data.temperature),
                weight: cleanVitalSignValue(data.weight),
                // Convert UI meters -> backend inches
                height: (() => {
                  const v = cleanVitalSignValue(data.height)
                  return v !== undefined
                    ? Number(metersToInches(v).toFixed(2))
                    : undefined
                })(),
                oxygenSaturation: cleanVitalSignValue(data.oxygenSaturation),
                respiratoryRate: cleanVitalSignValue(data.respiratoryRate),
                notes: data.vitalSignsNotes || undefined,
              }
            : undefined

        if (isEditMode && record) {
          const updateData: UpdateMedicalRecordDto = {
            category: data.category,
            priority: data.priority,
            symptoms,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            notes: data.notes,
            allergies,
            followUpDate: data.followUpDate || undefined,
            vitalSigns,
          }

          await updateMutation.mutateAsync({
            id: record.id,
            data: updateData,
          })
          toast.success('Registro médico actualizado correctamente')
        } else {
          const createData: CreateMedicalRecordDto = {
            patientProfileId: data.patientProfileId!,
            doctorId: user.id,
            category: data.category,
            priority: data.priority,
            symptoms,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            notes: data.notes,
            allergies,
            followUpDate: data.followUpDate || undefined,
            vitalSigns,
          }

          await createMutation.mutateAsync(createData)
          toast.success('Registro médico creado correctamente')
        }

        onOpenChange(false)
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('Error submitting medical record:', error)

        // Handle specific validation errors from backend
        if (error instanceof Error) {
          const errorMessage = error.message

          // Check for specific vital signs errors
          if (errorMessage.includes('saturación')) {
            toast.error(
              'Error en saturación de oxígeno: Debe ser entre 70% y 100%'
            )
          } else if (errorMessage.includes('frecuencia cardíaca')) {
            toast.error(
              'Error en frecuencia cardíaca: Debe ser entre 30 y 250 bpm'
            )
          } else if (errorMessage.includes('temperatura')) {
            toast.error('Error en temperatura: Debe ser entre 30°C y 45°C')
          } else if (errorMessage.includes('peso')) {
            toast.error('Error en peso: Debe ser entre 5 y 330 lbs')
          } else if (errorMessage.includes('altura')) {
            // Backend puede devolver mensaje en pulgadas; traducimos a metros para UI
            if (errorMessage.includes('pulgadas')) {
              toast.error('Error en altura: Debe ser entre 0.5 y 2.5 m')
            } else {
              toast.error('Error en altura')
            }
          } else if (errorMessage.includes('frecuencia respiratoria')) {
            toast.error(
              'Error en frecuencia respiratoria: Debe ser entre 8 y 60 rpm'
            )
          } else if (errorMessage.includes('vitalSigns')) {
            // Parse multiple vital signs errors
            const errors = errorMessage.split(',').map((e) => e.trim())
            const vitalSignErrors = errors.filter((e) =>
              e.includes('vitalSigns.')
            )

            if (vitalSignErrors.length > 0) {
              const errorMessages = vitalSignErrors.map((e) => {
                if (e.includes('altura')) return 'Altura: entre 0.5-2.5 m'
                if (e.includes('frecuencia respiratoria'))
                  return 'Frecuencia respiratoria: entre 8-60 rpm'
                if (e.includes('peso')) return 'Peso: entre 5-330 lbs'
                if (e.includes('saturación')) return 'Saturación: entre 70-100%'
                if (e.includes('frecuencia cardíaca'))
                  return 'Frecuencia cardíaca: entre 30-250 bpm'
                if (e.includes('temperatura'))
                  return 'Temperatura: entre 30-45°C'
                return e.replace('vitalSigns.', '')
              })

              toast.error(
                `Errores en signos vitales: ${errorMessages.join(', ')}`
              )
            } else {
              toast.error(errorMessage)
            }
          } else {
            toast.error(errorMessage)
          }
        } else {
          toast.error('Error al procesar el registro médico')
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
      record,
      updateMutation,
      createMutation,
      onOpenChange,
      onSuccess,
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

    onOpenChange(false)
    form.reset()
  }, [isSubmitting, form, onOpenChange])

  // Check required fields based on mode (sin objetos, solo primitivos)
  const hasRequiredFields = useMemo(() => {
    const hasSymptoms = symptoms && symptoms.length >= 10
    const hasDiagnosis = diagnosis && diagnosis.length >= 10

    if (isEditMode) {
      return hasSymptoms && hasDiagnosis
    } else {
      const hasPatient = patientProfileId && patientProfileId.trim() !== ''
      const hasDate = date && date.trim() !== ''
      return !!hasPatient && hasSymptoms && hasDiagnosis && !!hasDate
    }
  }, [symptoms, diagnosis, patientProfileId, date, isEditMode])

  const isFormValid = form.formState.isValid && hasRequiredFields

  // Trigger validation when required fields change
  useEffect(() => {
    const fieldsToValidate = isEditMode
      ? (['symptoms', 'diagnosis'] as const)
      : (['patientProfileId', 'symptoms', 'diagnosis', 'date'] as const)

    form.trigger(fieldsToValidate)
  }, [symptoms, diagnosis, patientProfileId, date, isEditMode, form])

  // Trigger validation for vital signs when they change
  useEffect(() => {
    const values = [
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      oxygenSaturation,
      respiratoryRate,
    ]
    const names = [
      'bloodPressure',
      'heartRate',
      'temperature',
      'weight',
      'height',
      'oxygenSaturation',
      'respiratoryRate',
    ] as const

    const toValidate = names.filter(
      (_, i) => values[i] !== undefined && values[i] !== ''
    )
    if (toValidate.length > 0) {
      form.trigger(toValidate)
    }
  }, [
    bloodPressure,
    heartRate,
    temperature,
    weight,
    height,
    oxygenSaturation,
    respiratoryRate,
    form,
  ])

  if (!isDoctor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              Acceso Denegado
            </DialogTitle>
            <DialogDescription>
              Solo los doctores pueden crear y editar registros médicos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-7xl max-h-[95vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            {isEditMode
              ? 'Editar Registro Médico'
              : 'Crear Nuevo Registro Médico'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica la información del registro médico del paciente'
              : 'Completa la información para crear un nuevo registro médico'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <MedicalRecordFormSkeleton />
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Form Progress Indicator */}
              {/* <div className='flex items-center justify-between p-4 bg-muted/50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  {isFormValid ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : (
                    <AlertCircle className='h-4 w-4 text-orange-500' />
                  )}
                  <span className='text-sm font-medium'>
                    {isFormValid
                      ? 'Formulario completo - Puedes guardar el registro'
                      : `Completa los campos requeridos: ${
                          !watchedValues.patientProfileId && !isEditMode
                            ? 'Paciente, '
                            : ''
                        }${
                          !watchedValues.symptoms ||
                          watchedValues.symptoms.length < 10
                            ? 'Síntomas (mín. 10 chars), '
                            : ''
                        }${
                          !watchedValues.diagnosis ||
                          watchedValues.diagnosis.length < 10
                            ? 'Diagnóstico (mín. 10 chars)'
                            : ''
                        }`.replace(/,\s*$/, '')}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={isFormValid ? 'default' : 'secondary'}>
                    {Object.keys(form.formState.errors).length} errores
                  </Badge>
                  {!isFormValid && (
                    <Badge variant='outline' className='text-xs'>
                      {isEditMode ? 'Edición' : 'Creación'}
                    </Badge>
                  )}
                </div>
              </div> */}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger
                    value='basic'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Información Básica</span>
                    <span className='sm:hidden'>Básica</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='vitals'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Signos Vitales</span>
                    <span className='sm:hidden'>Vitales</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='treatment'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Tratamiento</span>
                    <span className='sm:hidden'>Tratamiento</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='followup'
                    className='flex items-center gap-2'
                  >
                    <span className='hidden sm:inline'>Seguimiento</span>
                    <span className='sm:hidden'>Seguimiento</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value='basic' className='space-y-6'>
                  {/* Patient Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <User className='h-5 w-5' />
                        Información del Paciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <FormField
                        label='Paciente'
                        required={!isEditMode}
                        error={form.formState.errors.patientProfileId?.message}
                        description={
                          isEditMode
                            ? 'Información del paciente asociado a este registro médico.'
                            : 'Busca por nombre o email del paciente para seleccionar.'
                        }
                      >
                        {isEditMode ? (
                          <>
                            <PatientDisplay
                              patientId={record?.patientProfileId || ''}
                              className='w-full'
                            />
                            <input
                              type='hidden'
                              {...form.register('patientProfileId')}
                              value={record?.patientProfileId || ''}
                            />
                          </>
                        ) : (
                          <PatientSelector
                            value={form.watch('patientProfileId') || ''}
                            onValueChange={(value) => {
                              form.setValue('patientProfileId', value)
                              form.clearErrors('patientProfileId')
                              form.trigger('patientProfileId')
                            }}
                            placeholder='Buscar y seleccionar paciente...'
                            disabled={isLoading}
                          />
                        )}
                      </FormField>
                    </CardContent>
                  </Card>

                  {/* General Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Info className='h-5 w-5' />
                        Información General
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='space-y-4'>
                        <FormField
                          label='Fecha de Consulta'
                          required
                          icon={<Calendar className='h-4 w-4' />}
                          error={form.formState.errors.date?.message}
                        >
                          <Input
                            type='date'
                            {...form.register('date')}
                            className={
                              form.formState.errors.date ? 'border-red-500' : ''
                            }
                          />
                        </FormField>

                        <FormField
                          label='Categoría'
                          icon={<FileText className='h-4 w-4' />}
                          error={form.formState.errors.category?.message}
                        >
                          <Controller
                            name='category'
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona una categoría' />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(MedicalRecordCategory).map(
                                    (category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                      >
                                        {getCategoryText(category)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>

                        <FormField
                          label='Prioridad'
                          icon={<AlertCircle className='h-4 w-4' />}
                          error={form.formState.errors.priority?.message}
                        >
                          <Controller
                            name='priority'
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona una prioridad' />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(Priority).map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                      {getPriorityText(priority)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                      </div>

                      <Separator />

                      <FormField
                        label='Síntomas'
                        required
                        error={form.formState.errors.symptoms?.message}
                        description='Describe todos los síntomas relevantes que presenta el paciente'
                      >
                        <Textarea
                          placeholder='Describe los síntomas presentados por el paciente...'
                          className={`min-h-[120px] ${
                            form.formState.errors.symptoms
                              ? 'border-red-500'
                              : ''
                          }`}
                          {...form.register('symptoms')}
                        />
                      </FormField>

                      <FormField
                        label='Diagnóstico'
                        required
                        error={form.formState.errors.diagnosis?.message}
                        description='Diagnóstico médico basado en la evaluación realizada'
                      >
                        <Textarea
                          placeholder='Diagnóstico médico basado en los síntomas y exámenes...'
                          className={`min-h-[120px] ${
                            form.formState.errors.diagnosis
                              ? 'border-red-500'
                              : ''
                          }`}
                          {...form.register('diagnosis')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vital Signs Tab */}
                <TabsContent value='vitals' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Activity className='h-5 w-5' />
                        Signos Vitales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {/* Signos Vitales Principales */}
                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <VitalSignField
                          label='Presión Arterial'
                          unit='mmHg'
                          placeholder='120/80'
                          register={form.register('bloodPressure')}
                          error={form.formState.errors.bloodPressure?.message}
                          type='text'
                        />

                        <VitalSignField
                          label='Frecuencia Cardíaca'
                          unit='bpm'
                          icon={<Heart className='h-4 w-4' />}
                          placeholder='30-250'
                          register={form.register('heartRate')}
                          error={form.formState.errors.heartRate?.message}
                        />

                        <VitalSignField
                          label='Temperatura'
                          unit='°C'
                          icon={<Thermometer className='h-4 w-4' />}
                          placeholder='30-45'
                          register={form.register('temperature')}
                          error={form.formState.errors.temperature?.message}
                          step='0.1'
                        />
                      </div>

                      {/* Signos Vitales Secundarios */}
                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <VitalSignField
                          label='Frecuencia Respiratoria'
                          unit='rpm'
                          icon={<Wind className='h-4 w-4' />}
                          placeholder='8-60'
                          register={form.register('respiratoryRate')}
                          error={form.formState.errors.respiratoryRate?.message}
                        />

                        <VitalSignField
                          label='Saturación de Oxígeno'
                          unit='%'
                          icon={<Activity className='h-4 w-4' />}
                          placeholder='70-100'
                          register={form.register('oxygenSaturation')}
                          error={
                            form.formState.errors.oxygenSaturation?.message
                          }
                        />
                      </div>

                      <Separator />

                      {/* Medidas Corporales */}
                      <div className='grid gap-4 md:grid-cols-2'>
                        <VitalSignField
                          label='Peso'
                          unit='lbs'
                          icon={<Weight className='h-4 w-4' />}
                          placeholder='5-330'
                          register={form.register('weight')}
                          error={form.formState.errors.weight?.message}
                          step='0.1'
                        />

                        <VitalSignField
                          label='Altura'
                          unit='m'
                          icon={<Ruler className='h-4 w-4' />}
                          placeholder='0.5-2.5'
                          register={form.register('height')}
                          error={form.formState.errors.height?.message}
                          step='0.01'
                        />
                      </div>

                      <FormField
                        label='Notas sobre Signos Vitales'
                        error={form.formState.errors.vitalSignsNotes?.message}
                        description='Observaciones adicionales sobre los signos vitales'
                      >
                        <Textarea
                          placeholder='Observaciones adicionales sobre los signos vitales...'
                          {...form.register('vitalSignsNotes')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Treatment Tab */}
                <TabsContent value='treatment' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Stethoscope className='h-5 w-5' />
                        Tratamiento y Notas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <FormField
                        label='Plan de Tratamiento'
                        error={form.formState.errors.treatment?.message}
                        description='Incluye procedimientos, terapias y recomendaciones generales'
                      >
                        <Textarea
                          placeholder='Describe el plan de tratamiento recomendado...'
                          className='min-h-[120px]'
                          {...form.register('treatment')}
                        />
                      </FormField>

                      <FormField
                        label='Alergias Conocidas'
                        error={form.formState.errors.allergiesText?.message}
                        description='Separa múltiples alergias con comas'
                      >
                        <Textarea
                          placeholder='ej. Penicilina, Polen, etc. (separar con comas)'
                          {...form.register('allergiesText')}
                        />
                      </FormField>

                      <FormField
                        label='Notas Adicionales'
                        error={form.formState.errors.notes?.message}
                        description='Cualquier observación adicional relevante'
                      >
                        <Textarea
                          placeholder='Cualquier observación adicional relevante...'
                          {...form.register('notes')}
                        />
                      </FormField>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Follow-up Tab */}
                <TabsContent value='followup' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Clock className='h-5 w-5' />
                        Seguimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <FormField
                        label='Fecha de Seguimiento'
                        icon={<Calendar className='h-4 w-4' />}
                        description='Programa una fecha para evaluar la evolución del paciente'
                      >
                        <Input type='date' {...form.register('followUpDate')} />
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
                      ? 'Actualizar Registro'
                      : 'Crear Registro'}
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
