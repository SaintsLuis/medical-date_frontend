'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Phone,
  MapPin,
  Droplets,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  Calendar,
  Shield,
  Info,
} from 'lucide-react'
import { useUpdatePatient } from '../hooks/use-patients'
import { updateUserAction } from '@/features/users/actions/user-actions'
import { useFormPersistence } from '@/hooks/use-form-persistence'
import type { Patient, UpdatePatientData } from '../types'
import { BLOOD_TYPES, formatBloodType } from '../types'

// ==============================================
// Schema de Validación con Zod
// ==============================================

const patientFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'El género es requerido',
  }),
  address: z.string().min(1, 'La dirección es requerida'),
  emergencyContact: z.string().min(1, 'El contacto de emergencia es requerido'),
  bloodType: z.enum([
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE',
  ]),
  allergies: z.array(z.string()),
})

type PatientFormData = z.infer<typeof patientFormSchema>

// ==============================================
// Valores por Defecto
// ==============================================

const defaultValues: PatientFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  gender: 'MALE',
  address: '',
  emergencyContact: '',
  bloodType: 'O_POSITIVE',
  allergies: [],
}

// ==============================================
// Interfaces
// ==============================================

interface PatientFormProps {
  patient: Patient
  onSuccess?: (patient: Patient) => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ==============================================
// Componente Principal
// ==============================================

export function PatientForm({
  patient,
  onSuccess,
  onCancel,
  title = 'Actualizar Paciente',
  description = 'Actualiza la información del paciente',
}: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allergies, setAllergies] = useState<string[]>([])
  const updatePatient = useUpdatePatient()

  // ==============================================
  // React Hook Form Setup
  // ==============================================

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = form

  // Persistencia del estado del formulario
  const formKey = `patient-form-${patient?.id || 'new'}`

  const { handleSuccess, handleCancel: handleFormCancel } = useFormPersistence({
    formKey,
    watch,
    reset,
    isDirty,
    enabled: false, // No habilitar para pacientes ya que solo es actualización
    onSuccess: () => onSuccess?.(patient),
    onCancel: onCancel,
  })

  // ==============================================
  // Efectos
  // ==============================================

  useEffect(() => {
    if (patient) {
      // Llenar el formulario con los datos del paciente
      reset({
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        phone: patient.user.phoneNumber,
        birthDate: patient.birthDate,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
      })
      setAllergies(patient.allergies || [])
    }
  }, [patient, reset])

  // ==============================================
  // Handlers
  // ==============================================

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true)

    try {
      // Actualizar datos del usuario (firstName, lastName, phone)
      if (
        data.firstName !== patient.user.firstName ||
        data.lastName !== patient.user.lastName ||
        data.phone !== patient.user.phoneNumber
      ) {
        const userUpdateResult = await updateUserAction(patient.user.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phone,
        })

        if (!userUpdateResult.success) {
          throw new Error(
            userUpdateResult.error || 'Error al actualizar datos del usuario'
          )
        }
      }

      // Actualizar datos del perfil del paciente
      const updateData: UpdatePatientData = {
        birthDate: data.birthDate,
        gender: data.gender,
        address: data.address,
        emergencyContact: data.emergencyContact,
        bloodType: data.bloodType,
        allergies: allergies,
      }

      const result = await updatePatient.mutateAsync({
        id: patient.id,
        data: updateData,
      })

      if (result.success && result.data) {
        handleSuccess()
        onSuccess?.(result.data)
      } else {
        throw new Error(result.error || 'Error al actualizar paciente')
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    handleFormCancel()
  }

  const addAllergy = () => {
    setAllergies([...allergies, ''])
  }

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const updateAllergy = (index: number, value: string) => {
    const newAllergies = [...allergies]
    newAllergies[index] = value
    setAllergies(newAllergies)
  }

  // ==============================================
  // Componentes de Renderizado
  // ==============================================

  const renderAllergiesSection = () => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium flex items-center gap-2'>
        <AlertTriangle className='h-4 w-4' />
        Alergias
      </Label>

      {allergies.map((allergy, index) => (
        <div key={index} className='flex gap-2'>
          <div className='flex-1'>
            <Input
              placeholder='Ej: Penicilina, Polen, etc.'
              value={allergy}
              onChange={(e) => updateAllergy(index, e.target.value)}
            />
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => removeAllergy(index)}
            className='px-2'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      ))}

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={addAllergy}
        className='w-full'
      >
        <Plus className='h-4 w-4 mr-2' />
        Agregar Alergia
      </Button>
    </div>
  )

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Información Personal */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Info className='h-5 w-5 text-blue-600' />
              Información Personal
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Nombre</Label>
                <Input placeholder='Juan' {...register('firstName')} />
                {errors.firstName && (
                  <p className='text-sm text-red-600'>
                    {String(errors.firstName?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Apellido</Label>
                <Input placeholder='García' {...register('lastName')} />
                {errors.lastName && (
                  <p className='text-sm text-red-600'>
                    {String(errors.lastName?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' />
                  Teléfono
                </Label>
                <Input placeholder='+1234567890' {...register('phone')} />
                {errors.phone && (
                  <p className='text-sm text-red-600'>
                    {String(errors.phone?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  Fecha de Nacimiento
                </Label>
                <Input type='date' {...register('birthDate')} />
                {errors.birthDate && (
                  <p className='text-sm text-red-600'>
                    {String(errors.birthDate?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Género</Label>
                <Select
                  onValueChange={(value) =>
                    setValue('gender', value as 'MALE' | 'FEMALE')
                  }
                  defaultValue={watch('gender')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar género' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MALE'>Masculino</SelectItem>
                    <SelectItem value='FEMALE'>Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className='text-sm text-red-600'>
                    {String(errors.gender?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Droplets className='h-4 w-4' />
                  Tipo de Sangre
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      'bloodType',
                      value as
                        | 'A_POSITIVE'
                        | 'A_NEGATIVE'
                        | 'B_POSITIVE'
                        | 'B_NEGATIVE'
                        | 'AB_POSITIVE'
                        | 'AB_NEGATIVE'
                        | 'O_POSITIVE'
                        | 'O_NEGATIVE'
                    )
                  }
                  defaultValue={watch('bloodType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo de sangre' />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono'>
                            {formatBloodType(type)}
                          </span>
                          <span className='text-gray-500'>({type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && (
                  <p className='text-sm text-red-600'>
                    {String(errors.bloodType?.message)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de Contacto */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-600' />
              Información de Contacto
            </h3>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  Dirección
                </Label>
                <Textarea
                  placeholder='Calle Principal 123, Ciudad, País'
                  rows={3}
                  {...register('address')}
                />
                {errors.address && (
                  <p className='text-sm text-red-600'>
                    {String(errors.address?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-red-600' />
                  Contacto de Emergencia
                </Label>
                <Input
                  placeholder='Nombre y teléfono del contacto de emergencia'
                  {...register('emergencyContact')}
                />
                {errors.emergencyContact && (
                  <p className='text-sm text-red-600'>
                    {String(errors.emergencyContact?.message)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Médica */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-orange-600' />
              Información Médica
            </h3>
            {renderAllergiesSection()}
          </div>

          {/* Botones de Acción */}
          <div className='flex justify-end space-x-2 pt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='min-w-[120px]'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Actualizando...
                </>
              ) : (
                'Actualizar Paciente'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
