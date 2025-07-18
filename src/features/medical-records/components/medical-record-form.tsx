'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
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
import { Activity, FileText, Stethoscope, Clock, Save, X } from 'lucide-react'
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

// Form validation schema
const createMedicalRecordSchema = (isEditMode: boolean) =>
  z.object({
    patientProfileId: isEditMode
      ? z.string().optional()
      : z.string().min(1, 'Selecciona un paciente'),
    date: z.string().min(1, 'La fecha es requerida'),
    category: z.nativeEnum(MedicalRecordCategory).optional(),
    priority: z.nativeEnum(Priority).optional(),
    symptoms: z.string().min(1, 'Los síntomas son requeridos').max(1000),
    diagnosis: z.string().min(1, 'El diagnóstico es requerido').max(1000),
    treatment: z.string().max(2000).optional(),
    notes: z.string().max(2000).optional(),
    followUpDate: z.string().optional(),
    // Allergies as a single text field for simplicity
    allergiesText: z.string().optional(),
    // Vital signs
    bloodPressure: z.string().optional(),
    heartRate: z.number().min(30).max(250).optional(),
    temperature: z.number().min(30).max(45).optional(),
    weight: z.number().min(0.5).max(500).optional(),
    height: z.number().min(30).max(250).optional(),
    oxygenSaturation: z.number().min(50).max(100).optional(),
    respiratoryRate: z.number().min(8).max(60).optional(),
    vitalSignsNotes: z.string().max(500).optional(),
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

  const createMutation = useCreateMedicalRecord()
  const updateMutation = useUpdateMedicalRecord()

  const isEditMode = Boolean(record)
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Form setup
  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(createMedicalRecordSchema(isEditMode)),
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
      heartRate: undefined,
      temperature: undefined,
      weight: undefined,
      height: undefined,
      oxygenSaturation: undefined,
      respiratoryRate: undefined,
      vitalSignsNotes: '',
    },
  })

  // Load data for edit mode
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
        followUpDate: record.followUpDate
          ? record.followUpDate.split('T')[0]
          : '',
        allergiesText: allergiesText,
        bloodPressure: record.vitalSigns?.bloodPressure || '',
        heartRate: record.vitalSigns?.heartRate || undefined,
        temperature: record.vitalSigns?.temperature || undefined,
        weight: record.vitalSigns?.weight || undefined,
        height: record.vitalSigns?.height || undefined,
        oxygenSaturation: record.vitalSigns?.oxygenSaturation || undefined,
        respiratoryRate: record.vitalSigns?.respiratoryRate || undefined,
        vitalSignsNotes: record.vitalSigns?.notes || '',
      })
    } else if (!record && open) {
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
        heartRate: undefined,
        temperature: undefined,
        weight: undefined,
        height: undefined,
        oxygenSaturation: undefined,
        respiratoryRate: undefined,
        vitalSignsNotes: '',
      })
    }
  }, [record, open, patientId, form])

  const onSubmit = async (data: MedicalRecordFormData) => {
    console.log('🚀 [MedicalRecordForm] onSubmit called with data:', data)
    console.log('🚀 [MedicalRecordForm] Form state:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      isEditMode,
      recordId: record?.id,
    })

    // Verificar si hay errores de validación
    if (!form.formState.isValid) {
      console.error(
        '❌ [MedicalRecordForm] Form has validation errors:',
        form.formState.errors
      )
      return
    }

    try {
      if (!isDoctor) {
        console.error(
          '❌ [MedicalRecordForm] Solo los doctores pueden crear/editar registros médicos'
        )
        return
      }

      if (!user?.id) {
        console.error('❌ [MedicalRecordForm] Usuario no autenticado')
        return
      }

      console.log('✅ [MedicalRecordForm] User is doctor and authenticated:', {
        userId: user.id,
        isEditMode,
      })

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

      const vitalSigns =
        data.bloodPressure ||
        data.heartRate ||
        data.temperature ||
        data.weight ||
        data.height ||
        data.oxygenSaturation ||
        data.respiratoryRate ||
        data.vitalSignsNotes
          ? {
              bloodPressure: data.bloodPressure || undefined,
              heartRate: data.heartRate || undefined,
              temperature: data.temperature || undefined,
              weight: data.weight || undefined,
              height: data.height || undefined,
              oxygenSaturation: data.oxygenSaturation || undefined,
              respiratoryRate: data.respiratoryRate || undefined,
              notes: data.vitalSignsNotes || undefined,
            }
          : undefined

      if (isEditMode && record) {
        console.log('🔄 [MedicalRecordForm] Updating existing record:', {
          recordId: record.id,
          isEditMode,
          hasRecord: !!record,
        })

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

        console.log('📝 [MedicalRecordForm] Update data prepared:', updateData)

        const result = await updateMutation.mutateAsync({
          id: record.id,
          data: updateData,
        })

        console.log(
          '✅ [MedicalRecordForm] Record updated successfully:',
          result
        )
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

        console.log(
          '📝 [MedicalRecordForm] Creating new record with data:',
          createData
        )

        const result = await createMutation.mutateAsync(createData)

        console.log(
          '✅ [MedicalRecordForm] Record created successfully:',
          result
        )
      }

      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error(
        '❌ [MedicalRecordForm] Error al procesar el registro médico:',
        error
      )

      // Show user-friendly error message
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message)
      }
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  if (!isDoctor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceso Denegado</DialogTitle>
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
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            <FileText className='mr-2 h-5 w-5' />
            {isEditMode
              ? 'Editar Registro Médico'
              : 'Crear Nuevo Registro Médico'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica la información del registro médico'
              : 'Completa la información para crear un nuevo registro médico'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <MedicalRecordFormSkeleton />
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='basic' className='flex items-center'>
                    <FileText className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>Información Básica</span>
                    <span className='sm:hidden'>Básica</span>
                  </TabsTrigger>
                  <TabsTrigger value='vitals' className='flex items-center'>
                    <Activity className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>Signos Vitales</span>
                    <span className='sm:hidden'>Vitales</span>
                  </TabsTrigger>
                  <TabsTrigger value='treatment' className='flex items-center'>
                    <Stethoscope className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>Tratamiento</span>
                    <span className='sm:hidden'>Tratamiento</span>
                  </TabsTrigger>
                  <TabsTrigger value='followup' className='flex items-center'>
                    <Clock className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>Seguimiento</span>
                    <span className='sm:hidden'>Seguimiento</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value='basic' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Información del Paciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {/* Selector de paciente - Mostrar siempre pero con diferentes comportamientos */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Paciente *
                        </label>
                        {isEditMode ? (
                          // En modo de edición: mostrar paciente como solo lectura y agregar campo hidden
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
                          // En modo de creación: permitir seleccionar paciente
                          <PatientSelector
                            value={form.watch('patientProfileId') || ''}
                            onValueChange={(value) => {
                              console.log(
                                '🔄 [MedicalRecordForm] Patient selected:',
                                value
                              )
                              console.log(
                                '🔄 [MedicalRecordForm] Current form value before set:',
                                form.watch('patientProfileId')
                              )
                              form.setValue('patientProfileId', value)
                              form.clearErrors('patientProfileId')
                              console.log(
                                '🔄 [MedicalRecordForm] Current form value after set:',
                                form.watch('patientProfileId')
                              )
                              // Triggear validación para asegurar que el valor se actualice
                              form.trigger('patientProfileId')
                            }}
                            placeholder='Buscar y seleccionar paciente...'
                            disabled={isLoading}
                          />
                        )}
                        {form.formState.errors.patientProfileId && (
                          <p className='text-sm text-red-600'>
                            {form.formState.errors.patientProfileId.message}
                          </p>
                        )}
                        <p className='text-xs text-muted-foreground'>
                          {isEditMode
                            ? 'Información del paciente asociado a este registro médico.'
                            : 'Busca por nombre o email del paciente para seleccionar.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Información General
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Fecha de Consulta *
                          </label>
                          <Input type='date' {...form.register('date')} />
                          {form.formState.errors.date && (
                            <p className='text-sm text-red-600'>
                              {form.formState.errors.date.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Categoría
                          </label>
                          <Select
                            value={form.watch('category') || ''}
                            onValueChange={(value) =>
                              form.setValue(
                                'category',
                                value as MedicalRecordCategory
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Selecciona una categoría' />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(MedicalRecordCategory).map(
                                (category) => (
                                  <SelectItem key={category} value={category}>
                                    {getCategoryText(category)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Prioridad
                          </label>
                          <Select
                            value={form.watch('priority') || ''}
                            onValueChange={(value) =>
                              form.setValue('priority', value as Priority)
                            }
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
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Síntomas *
                        </label>
                        <Textarea
                          placeholder='Describe los síntomas presentados por el paciente...'
                          className='min-h-[100px]'
                          {...form.register('symptoms')}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Describe todos los síntomas relevantes que presenta el
                          paciente
                        </p>
                        {form.formState.errors.symptoms && (
                          <p className='text-sm text-red-600'>
                            {form.formState.errors.symptoms.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Diagnóstico *
                        </label>
                        <Textarea
                          placeholder='Diagnóstico médico basado en los síntomas y exámenes...'
                          className='min-h-[100px]'
                          {...form.register('diagnosis')}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Diagnóstico médico basado en la evaluación realizada
                        </p>
                        {form.formState.errors.diagnosis && (
                          <p className='text-sm text-red-600'>
                            {form.formState.errors.diagnosis.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vital Signs Tab */}
                <TabsContent value='vitals' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center'>
                        <Activity className='mr-2 h-5 w-5' />
                        Signos Vitales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Presión Arterial
                          </label>
                          <Input
                            placeholder='ej. 120/80'
                            {...form.register('bloodPressure')}
                          />
                          <p className='text-xs text-muted-foreground'>mmHg</p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Frecuencia Cardíaca
                          </label>
                          <Input
                            type='number'
                            placeholder='ej. 72'
                            {...form.register('heartRate', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>bpm</p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Frecuencia Respiratoria
                          </label>
                          <Input
                            type='number'
                            placeholder='ej. 18'
                            {...form.register('respiratoryRate', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>rpm</p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Temperatura
                          </label>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='ej. 36.5'
                            {...form.register('temperature', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>°C</p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Saturación de Oxígeno
                          </label>
                          <Input
                            type='number'
                            placeholder='ej. 98'
                            {...form.register('oxygenSaturation', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>%</p>
                        </div>
                      </div>

                      <Separator />

                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Peso</label>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='ej. 70.5'
                            {...form.register('weight', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>kg</p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Altura</label>
                          <Input
                            type='number'
                            placeholder='ej. 175'
                            {...form.register('height', {
                              valueAsNumber: true,
                            })}
                          />
                          <p className='text-xs text-muted-foreground'>cm</p>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Notas sobre Signos Vitales
                        </label>
                        <Textarea
                          placeholder='Observaciones adicionales sobre los signos vitales...'
                          {...form.register('vitalSignsNotes')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Treatment Tab */}
                <TabsContent value='treatment' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center'>
                        <Stethoscope className='mr-2 h-5 w-5' />
                        Tratamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Tratamiento
                        </label>
                        <Textarea
                          placeholder='Describe el plan de tratamiento recomendado...'
                          className='min-h-[120px]'
                          {...form.register('treatment')}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Incluye procedimientos, terapias y recomendaciones
                          generales
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Alergias Conocidas
                        </label>
                        <Textarea
                          placeholder='ej. Penicilina, Polen, etc. (separar con comas)'
                          {...form.register('allergiesText')}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Separa múltiples alergias con comas
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Notas Adicionales
                        </label>
                        <Textarea
                          placeholder='Cualquier observación adicional relevante...'
                          {...form.register('notes')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Follow-up Tab */}
                <TabsContent value='followup' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center'>
                        <Clock className='mr-2 h-5 w-5' />
                        Seguimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Fecha de Seguimiento
                        </label>
                        <Input type='date' {...form.register('followUpDate')} />
                        <p className='text-xs text-muted-foreground'>
                          Programa una fecha para evaluar la evolución del
                          paciente
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className='flex flex-col sm:flex-row gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className='mr-2 h-4 w-4' />
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  onClick={(e) => {
                    console.log(
                      '🖱️ [MedicalRecordForm] Submit button clicked:',
                      {
                        isEditMode,
                        recordId: record?.id,
                        isFormValid: form.formState.isValid,
                        formErrors: form.formState.errors,
                        patientProfileId: form.watch('patientProfileId'),
                        buttonType: e.currentTarget.type,
                        formElement: e.currentTarget.form,
                      }
                    )

                    // Force validation check
                    const isValid = form.trigger()
                    console.log(
                      '🔍 [MedicalRecordForm] Manual validation result:',
                      isValid
                    )
                  }}
                >
                  <Save className='mr-2 h-4 w-4' />
                  {isLoading
                    ? isEditMode
                      ? 'Actualizando...'
                      : 'Creando...'
                    : isEditMode
                    ? 'Actualizar Registro'
                    : 'Crear Registro'}
                </Button>
              </DialogFooter>

              {/* Debug info for form state */}
              {process.env.NODE_ENV === 'development' && (
                <div className='mt-4 p-2 bg-gray-100 text-xs'>
                  <strong>Form Debug:</strong>
                  <br />
                  isValid: {form.formState.isValid ? 'true' : 'false'}
                  <br />
                  isEditMode: {isEditMode ? 'true' : 'false'}
                  <br />
                  hasRecord: {record ? 'true' : 'false'}
                  <br />
                  patientProfileId: {form.watch('patientProfileId') || 'empty'}
                  <br />
                  errors: {JSON.stringify(form.formState.errors, null, 2)}
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
