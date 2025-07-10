'use client'

import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  useCreateSpecialty,
  useUpdateSpecialty,
} from '../hooks/use-specialties'
import type {
  Specialty,
  CreateSpecialtyData,
  UpdateSpecialtyData,
} from '../types'
import { SPECIALTY_VALIDATION } from '../types'

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>('')
  const isEditing = !!specialty

  // Hooks de mutación
  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty()

  // Inicializar formulario cuando cambia la especialidad
  useEffect(() => {
    if (specialty) {
      setFormData({
        name: specialty.name,
        description: specialty.description || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
      })
    }
    setErrors({})
    setError('')
  }, [specialty])

  // ===================================
  // Validación
  // ===================================

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < SPECIALTY_VALIDATION.name.minLength) {
      newErrors.name = `El nombre debe tener al menos ${SPECIALTY_VALIDATION.name.minLength} caracteres`
    } else if (formData.name.length > SPECIALTY_VALIDATION.name.maxLength) {
      newErrors.name = `El nombre no puede exceder ${SPECIALTY_VALIDATION.name.maxLength} caracteres`
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras y espacios'
    }

    // Validar descripción
    if (
      formData.description &&
      formData.description.length > SPECIALTY_VALIDATION.description.maxLength
    ) {
      newErrors.description = `La descripción no puede exceder ${SPECIALTY_VALIDATION.description.maxLength} caracteres`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ===================================
  // Handlers
  // ===================================

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      let result: Specialty

      if (isEditing && specialty) {
        // Actualizar especialidad existente
        const updateData: UpdateSpecialtyData = {}

        if (formData.name !== specialty.name) updateData.name = formData.name
        if (formData.description !== (specialty.description || '')) {
          updateData.description = formData.description || undefined
        }

        // Verificar que hay cambios
        if (Object.keys(updateData).length === 0) {
          setError('No se han detectado cambios para actualizar')
          return
        }

        result = await updateMutation.mutateAsync({
          id: specialty.id,
          data: updateData,
        })
      } else {
        // Crear nueva especialidad
        const createData: CreateSpecialtyData = {
          name: formData.name,
          description: formData.description || undefined,
        }

        result = await createMutation.mutateAsync(createData)
      }

      // Limpiar formulario si es creación
      if (!isEditing) {
        setFormData({ name: '', description: '' })
      }

      // Llamar callback de éxito
      onSuccess?.(result)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error inesperado'
      setError(errorMessage)
    }
  }

  const handleCancel = () => {
    if (specialty) {
      setFormData({
        name: specialty.name,
        description: specialty.description || '',
      })
    } else {
      setFormData({ name: '', description: '' })
    }
    setErrors({})
    setError('')
    onCancel?.()
  }

  // ===================================
  // Estados de carga
  // ===================================

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isFormValid =
    !errors.name && !errors.description && formData.name.trim()

  // ===================================
  // Render
  // ===================================

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>
          {title || (isEditing ? 'Editar Especialidad' : 'Nueva Especialidad')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Mensaje de error */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Campo: Nombre */}
          <div className='space-y-2'>
            <Label htmlFor='name'>Nombre de la Especialidad *</Label>
            <Input
              id='name'
              placeholder='Ej: Cardiología'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className='text-sm text-red-500'>{errors.name}</p>
            )}
            <p className='text-sm text-muted-foreground'>
              El nombre de la especialidad médica (mín.{' '}
              {SPECIALTY_VALIDATION.name.minLength}, máx.{' '}
              {SPECIALTY_VALIDATION.name.maxLength} caracteres)
            </p>
          </div>

          {/* Campo: Descripción */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Descripción (Opcional)</Label>
            <Textarea
              id='description'
              placeholder='Descripción detallada de la especialidad médica...'
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              className={`resize-none ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>{errors.description}</p>
            )}
            <p className='text-sm text-muted-foreground'>
              Descripción opcional de la especialidad (máx.{' '}
              {SPECIALTY_VALIDATION.description.maxLength} caracteres)
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
              disabled={isLoading || !isFormValid}
              className='w-full sm:w-auto'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Actualizar Especialidad' : 'Crear Especialidad'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
