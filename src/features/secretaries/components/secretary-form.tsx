'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { X, Search, Eye, EyeOff } from 'lucide-react'

import {
  useCreateSecretary,
  useUpdateSecretary,
} from '../hooks/use-secretaries'
import { useDoctors } from '../../doctors/hooks/use-doctors'
import type {
  Secretary,
  SecretaryFormData,
  CreateSecretaryData,
  UpdateSecretaryData,
} from '../types'
import { getSecretaryFormSchema, SECRETARY_FORM_DEFAULTS } from '../types'

// ==============================================
// Props del componente
// ==============================================

interface SecretaryFormProps {
  secretary?: Secretary | null
  onSuccess?: () => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ==============================================
// Componente principal
// ==============================================

export function SecretaryForm({
  secretary,
  onSuccess,
  onCancel,
  title = 'Crear Secretaria',
  description = 'Completa la información para crear una nueva secretaria',
}: SecretaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [doctorSearch, setDoctorSearch] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isEditing = !!secretary
  const createMutation = useCreateSecretary()
  const updateMutation = useUpdateSecretary()

  // Obtener todos los doctores para el selector
  const {
    data: doctorsData,
    isLoading: isLoadingDoctors,
    error: doctorsError,
  } = useDoctors({ limit: 100 })

  // ==============================================
  // React Hook Form Setup
  // ==============================================

  const form = useForm<SecretaryFormData>({
    resolver: zodResolver(getSecretaryFormSchema(isEditing)),
    defaultValues: SECRETARY_FORM_DEFAULTS,
    mode: 'onBlur' as const,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = form

  const selectedDoctorIds = watch('doctorProfileIds') || []

  // ==============================================
  // Efectos
  // ==============================================

  useEffect(() => {
    if (secretary) {
      // Para edición, mapear los datos existentes
      const assignedDoctorIds =
        secretary.assignedDoctors?.map((ad) => ad.id) || []

      reset({
        firstName: secretary.firstName || '',
        lastName: secretary.lastName || '',
        email: secretary.email || '',
        password: '', // No mostramos la contraseña actual
        phoneNumber: secretary.phoneNumber || '',
        doctorProfileIds: assignedDoctorIds,
        notes: '', // El backend no devuelve notes en la respuesta actual
      })
    }
  }, [secretary, reset])

  // ==============================================
  // Handlers
  // ==============================================

  const onSubmit = async (data: SecretaryFormData) => {
    setIsSubmitting(true)

    try {
      if (isEditing && secretary) {
        // Para edición, crear objeto de actualización
        const updateData: UpdateSecretaryData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          doctorProfileIds: data.doctorProfileIds,
          notes: data.notes,
        }

        // Solo incluir contraseña si se proporcionó una nueva
        if (data.password && data.password.trim()) {
          updateData.password = data.password
        }

        await updateMutation.mutateAsync({
          id: secretary.id,
          data: updateData,
        })
      } else {
        // Para creación, todos los campos requeridos ya fueron validados por el schema
        const createData: CreateSecretaryData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password!, // El schema garantiza que existe en creación
          phoneNumber: data.phoneNumber,
          doctorProfileIds: data.doctorProfileIds,
          notes: data.notes,
        }

        await createMutation.mutateAsync(createData)
      }

      onSuccess?.()
    } catch (error) {
      // Los errores se manejan en los hooks
      console.error('Error en el formulario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDoctorToggle = (doctorId: string) => {
    const currentIds = getValues('doctorProfileIds') || []
    const newIds = currentIds.includes(doctorId)
      ? currentIds.filter((id: string) => id !== doctorId)
      : [...currentIds, doctorId]
    setValue('doctorProfileIds', newIds)
  }

  const handleRemoveDoctor = (doctorId: string) => {
    const currentIds = getValues('doctorProfileIds') || []
    setValue(
      'doctorProfileIds',
      currentIds.filter((id: string) => id !== doctorId)
    )
  }

  // ==============================================
  // Componentes internos
  // ==============================================

  const renderDoctorSelection = () => {
    if (isLoadingDoctors) {
      return (
        <div className='space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-16 w-full' />
          ))}
        </div>
      )
    }

    if (doctorsError || !doctorsData?.data?.data) {
      return (
        <Alert variant='destructive'>
          <AlertDescription>
            Error al cargar doctores:{' '}
            {doctorsError?.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      )
    }

    const doctors = doctorsData.data.data

    if (doctors.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            No hay doctores disponibles para asignar.
          </AlertDescription>
        </Alert>
      )
    }

    // Filtrar doctores por búsqueda
    const filteredDoctors = doctors.filter((doctor) => {
      const fullName =
        `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase()
      const email = doctor.user.email.toLowerCase()
      const searchLower = doctorSearch.toLowerCase()

      return fullName.includes(searchLower) || email.includes(searchLower)
    })

    return (
      <div className='space-y-3'>
        {/* Buscador */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar doctores por nombre o email...'
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Doctores seleccionados */}
        {selectedDoctorIds.length > 0 && (
          <div className='mb-4'>
            <Label className='text-sm font-medium mb-2 block'>
              Doctores Asignados ({selectedDoctorIds.length})
            </Label>
            <div className='flex flex-wrap gap-2'>
              {selectedDoctorIds.map((doctorId: string) => {
                const doctor = doctors.find((d) => d.id === doctorId)
                if (!doctor) return null

                return (
                  <Badge
                    key={doctorId}
                    variant='default'
                    className='flex items-center gap-1'
                  >
                    {doctor.user.firstName} {doctor.user.lastName}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveDoctor(doctorId)
                      }}
                      className='ml-1 hover:bg-red-500 rounded-full p-0.5'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Lista de doctores filtrados */}
        {filteredDoctors.length === 0 ? (
          <Alert>
            <AlertDescription>
              {doctorSearch
                ? `No se encontraron doctores que coincidan con "${doctorSearch}"`
                : 'No hay doctores disponibles para asignar.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className='max-h-64 overflow-y-auto border rounded-md'>
            {filteredDoctors.map((doctor) => {
              const isSelected = selectedDoctorIds.includes(doctor.id)

              return (
                <div
                  key={doctor.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleDoctorToggle(doctor.id)
                  }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-gray-900'>
                        {doctor.user.firstName} {doctor.user.lastName}
                      </div>
                      <div className='text-sm text-muted-foreground truncate'>
                        {doctor.user.email}
                      </div>
                      {doctor.specialties && doctor.specialties.length > 0 && (
                        <div className='text-xs text-blue-600 mt-1'>
                          {Array.isArray(doctor.specialties)
                            ? doctor.specialties
                                .map(
                                  (specialty) => specialty?.name || specialty
                                )
                                .join(', ')
                            : doctor.specialties}
                        </div>
                      )}
                    </div>
                    <div className='ml-3 flex-shrink-0'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleDoctorToggle(doctor.id)
                        }}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ==============================================
  // Render principal
  // ==============================================

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Información Personal */}
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>
                Nombre <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='firstName'
                {...register('firstName')}
                placeholder='Ingresa el nombre'
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className='text-sm text-red-500'>
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>
                Apellido <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='lastName'
                {...register('lastName')}
                placeholder='Ingresa el apellido'
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className='text-sm text-red-500'>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='email'>
                Correo Electrónico <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                {...register('email')}
                placeholder='secretaria@clinica.com'
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>Teléfono</Label>
              <Input
                id='phoneNumber'
                type='tel'
                {...register('phoneNumber')}
                placeholder='+1809-555-0123'
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className='text-sm text-red-500'>
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='password'>
              {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              {!isEditing && <span className='text-red-500'>*</span>}
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder={
                  isEditing
                    ? 'Dejar vacío para mantener actual'
                    : 'Contraseña para la secretaria'
                }
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-500' />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className='text-sm text-red-500'>{errors.password.message}</p>
            )}
            {isEditing && (
              <p className='text-xs text-muted-foreground'>
                Deja este campo vacío si no quieres cambiar la contraseña actual
              </p>
            )}
          </div>

          {/* Asignación de Doctores */}
          <div className='space-y-2'>
            <Label>Asignación de Doctores</Label>
            <p className='text-sm text-muted-foreground mb-3'>
              Selecciona los doctores que estarán bajo la supervisión de esta
              secretaria
            </p>
            {renderDoctorSelection()}
          </div>

          {/* Notas */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Notas</Label>
            <Textarea
              id='notes'
              {...register('notes')}
              placeholder='Notas adicionales sobre responsabilidades, horarios especiales, etc.'
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className='text-sm text-red-500'>{errors.notes.message}</p>
            )}
          </div>

          {/* Botones de acción */}
          <div className='flex flex-col sm:flex-row gap-2 pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 sm:flex-none'
            >
              {isSubmitting
                ? isEditing
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditing
                ? 'Actualizar Secretaria'
                : 'Crear Secretaria'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='flex-1 sm:flex-none'
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
