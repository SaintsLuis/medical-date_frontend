'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import {
  useCreateSpecialty,
  useUpdateSpecialty,
} from '../hooks/use-specialties'
import type { Specialty } from '../types'
import { SPECIALTY_FORM_DEFAULTS, SpecialtyFormData } from '../types'
import { toast } from 'sonner'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { specialtyFormSchema } from '../types'

// ===================================
// Props del componente
// ===================================

interface SpecialtyFormProps {
  specialty?: Specialty | null
  onSuccess?: (specialty: Specialty) => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ===================================
// Componente SpecialtyForm
// ===================================

export function SpecialtyForm({
  specialty,
  onSuccess,
  onCancel,
  title,
  description,
}: SpecialtyFormProps) {
  const isEditing = !!specialty

  // React Hook Form setup
  const methods = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtyFormSchema),
    defaultValues: specialty
      ? {
          name: specialty.name,
          description: specialty.description || '',
        }
      : SPECIALTY_FORM_DEFAULTS,
    mode: 'onTouched',
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = methods

  // Hooks de mutación
  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty()

  // Resetear formulario cuando cambia la especialidad
  useEffect(() => {
    if (specialty) {
      reset({
        name: specialty.name,
        description: specialty.description || '',
      })
    } else {
      reset(SPECIALTY_FORM_DEFAULTS)
    }
  }, [specialty, reset])

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Submit handler
  const onSubmit = async (data: SpecialtyFormData) => {
    try {
      let result: Specialty
      if (isEditing && specialty) {
        // Solo enviar los campos que cambiaron
        const updateData: Record<string, string> = {}
        if (data.name !== specialty.name) updateData.name = data.name
        if ((data.description || '') !== (specialty.description || '')) {
          updateData.description = data.description
        }
        if (Object.keys(updateData).length === 0) {
          toast.error('No se han detectado cambios para actualizar')
          return
        }
        result = await updateMutation.mutateAsync({
          id: specialty.id,
          data: updateData,
        })
      } else {
        result = await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
        })
        reset(SPECIALTY_FORM_DEFAULTS)
      }
      onSuccess?.(result)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error inesperado'
      toast.error(errorMessage)
    }
  }

  // Cancel handler
  const handleCancel = () => {
    if (specialty) {
      reset({
        name: specialty.name,
        description: specialty.description || '',
      })
    } else {
      reset(SPECIALTY_FORM_DEFAULTS)
    }
    onCancel?.()
  }

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>
          {title || (isEditing ? 'Editar Especialidad' : 'Nueva Especialidad')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className='space-y-6'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Campo: Nombre */}
            <div className='space-y-2'>
              <Label htmlFor='name'>Nombre de la Especialidad *</Label>
              <Input
                id='name'
                placeholder='Ej: Cardiología'
                {...register('name')}
                disabled={isLoading}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
              )}
              <p className='text-sm text-muted-foreground'>
                El nombre de la especialidad médica (mín.{' '}
                {SPECIALTY_FORM_DEFAULTS.name.length}, máx.{' '}
                {SPECIALTY_FORM_DEFAULTS.name.length} caracteres)
              </p>
            </div>

            {/* Campo: Descripción */}
            <div className='space-y-2'>
              <Label htmlFor='description'>Descripción (Opcional)</Label>
              <Textarea
                id='description'
                placeholder='Descripción detallada de la especialidad médica...'
                rows={4}
                {...register('description')}
                disabled={isLoading}
                className={`resize-none ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className='text-sm text-red-500'>
                  {errors.description.message}
                </p>
              )}
              <p className='text-sm text-muted-foreground'>
                Descripción opcional de la especialidad (máx.{' '}
                {SPECIALTY_FORM_DEFAULTS.description.length} caracteres)
              </p>
            </div>

            {/* Botones de acción */}
            <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0'>
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isLoading}
                  className='w-full sm:w-auto'
                >
                  Cancelar
                </Button>
              )}
              <Button
                type='submit'
                disabled={isLoading || !isValid}
                className='w-full sm:w-auto'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {isEditing
                      ? 'Actualizar Especialidad'
                      : 'Crear Especialidad'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
