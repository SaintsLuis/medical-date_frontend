'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Languages,
  Clock,
  DollarSign,
  Plus,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAllActiveSpecialties } from '@/features/specialties/hooks/use-specialties'
import type {
  Doctor,
  DoctorFormData,
  CreateDoctorData,
  UpdateDoctorData,
} from '../types'
import { DOCTOR_FORM_DEFAULTS, DOCTOR_VALIDATION } from '../types'
import {
  createDoctorAction,
  updateDoctorAction,
  getDoctorById,
} from '../actions/doctor-actions'

// ==============================================
// Interfaces
// ==============================================

interface DoctorFormProps {
  doctor?: Doctor | null
  onSuccess?: (doctor: Doctor) => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ==============================================
// Componente Principal
// ==============================================

export function DoctorForm({
  doctor,
  onSuccess,
  onCancel,
  title = 'Crear Doctor',
  description = 'Completa la información para crear un nuevo doctor',
}: DoctorFormProps) {
  const [formData, setFormData] = useState<DoctorFormData>(DOCTOR_FORM_DEFAULTS)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obtener especialidades disponibles
  const { data: specialties, isLoading: isLoadingSpecialties } =
    useAllActiveSpecialties()

  // ==============================================
  // Efectos
  // ==============================================

  useEffect(() => {
    if (doctor) {
      // Si es edición, llenar el formulario con los datos del doctor
      setFormData({
        email: doctor.user.email,
        password: '', // No mostrar contraseña en edición
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        license: doctor.license,
        phone: doctor.phone,
        address: doctor.address,
        bio: doctor.bio,
        consultationFee: doctor.consultationFee,
        education: doctor.education.length > 0 ? doctor.education : [''],
        experience: doctor.experience,
        languages: doctor.languages.length > 0 ? doctor.languages : ['Español'],
        timeZone: doctor.timeZone,
        publicEmail: doctor.publicEmail || '',
        publicPhone: doctor.publicPhone || '',
        certifications: doctor.certifications?.length
          ? doctor.certifications
          : [''],
        awards: doctor.awards?.length ? doctor.awards : [''],
        publications: doctor.publications?.length ? doctor.publications : [''],
        specialtyIds: doctor.specialties.map((s) => s.id),
      })
    }
  }, [doctor])

  // ==============================================
  // Validación
  // ==============================================

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (formData.email.length < DOCTOR_VALIDATION.email.minLength) {
      newErrors.email = `El email debe tener al menos ${DOCTOR_VALIDATION.email.minLength} caracteres`
    } else if (formData.email.length > DOCTOR_VALIDATION.email.maxLength) {
      newErrors.email = `El email no puede exceder ${DOCTOR_VALIDATION.email.maxLength} caracteres`
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar contraseña (solo para creación)
    if (!doctor && !formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!doctor && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    // Validar nombre
    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es requerido'
    } else if (
      formData.firstName.length < DOCTOR_VALIDATION.firstName.minLength
    ) {
      newErrors.firstName = `El nombre debe tener al menos ${DOCTOR_VALIDATION.firstName.minLength} caracteres`
    }

    // Validar apellido
    if (!formData.lastName) {
      newErrors.lastName = 'El apellido es requerido'
    } else if (
      formData.lastName.length < DOCTOR_VALIDATION.lastName.minLength
    ) {
      newErrors.lastName = `El apellido debe tener al menos ${DOCTOR_VALIDATION.lastName.minLength} caracteres`
    }

    // Validar licencia
    if (!formData.license) {
      newErrors.license = 'La licencia es requerida'
    } else if (formData.license.length < DOCTOR_VALIDATION.license.minLength) {
      newErrors.license = `La licencia debe tener al menos ${DOCTOR_VALIDATION.license.minLength} caracteres`
    }

    // Validar teléfono
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido'
    }

    // Validar dirección
    if (!formData.address) {
      newErrors.address = 'La dirección es requerida'
    }

    // Validar bio
    if (!formData.bio) {
      newErrors.bio = 'La biografía es requerida'
    } else if (formData.bio.length > DOCTOR_VALIDATION.bio.maxLength) {
      newErrors.bio = `La biografía no puede exceder ${DOCTOR_VALIDATION.bio.maxLength} caracteres`
    }

    // Validar tarifa de consulta
    if (formData.consultationFee < DOCTOR_VALIDATION.consultationFee.min) {
      newErrors.consultationFee = `La tarifa debe ser al menos ${DOCTOR_VALIDATION.consultationFee.min}`
    }

    // Validar experiencia
    if (formData.experience < DOCTOR_VALIDATION.experience.min) {
      newErrors.experience = `La experiencia debe ser al menos ${DOCTOR_VALIDATION.experience.min} años`
    }

    // Validar especialidades
    if (formData.specialtyIds.length === 0) {
      newErrors.specialtyIds = 'Debe seleccionar al menos una especialidad'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ==============================================
  // Handlers
  // ==============================================

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayInputChange = (
    field: keyof DoctorFormData,
    index: number,
    value: string
  ) => {
    const array = [...(formData[field] as string[])]
    array[index] = value
    setFormData((prev) => ({ ...prev, [field]: array }))
  }

  const addArrayItem = (field: keyof DoctorFormData) => {
    const array = [...(formData[field] as string[]), '']
    setFormData((prev) => ({ ...prev, [field]: array }))
  }

  const removeArrayItem = (field: keyof DoctorFormData, index: number) => {
    const array = (formData[field] as string[]).filter((_, i) => i !== index)
    if (array.length === 0) {
      array.push('')
    }
    setFormData((prev) => ({ ...prev, [field]: array }))
  }

  const handleSpecialtyToggle = (specialtyId: string) => {
    const currentSpecialties = [...formData.specialtyIds]
    const index = currentSpecialties.indexOf(specialtyId)

    if (index > -1) {
      currentSpecialties.splice(index, 1)
    } else {
      currentSpecialties.push(specialtyId)
    }

    setFormData((prev) => ({ ...prev, specialtyIds: currentSpecialties }))

    if (errors.specialtyIds) {
      setErrors((prev) => ({ ...prev, specialtyIds: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (doctor) {
        // Actualizar doctor existente
        const updateData: UpdateDoctorData = {
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          consultationFee: formData.consultationFee,
          education: formData.education,
          experience: formData.experience,
          languages: formData.languages,
          timeZone: formData.timeZone,
          specialtyIds: formData.specialtyIds,
        }

        console.log('🔄 Updating doctor:', updateData)
        const result = await updateDoctorAction(doctor.id, updateData)

        if (result.success && result.data) {
          onSuccess?.(result.data)
        } else {
          throw new Error(result.error || 'Error al actualizar doctor')
        }
      } else {
        // Crear nuevo doctor
        const createData: CreateDoctorData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          license: formData.license,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          consultationFee: formData.consultationFee,
          education: formData.education,
          experience: formData.experience,
          languages: formData.languages,
          timeZone: formData.timeZone,
        }

        console.log('🆕 Creating doctor with data:', createData)
        const result = await createDoctorAction(createData)

        console.log('📋 Create doctor result:', result)

        if (result.success && result.data) {
          // Si la creación fue exitosa, asignar especialidades usando la acción de actualizar
          if (formData.specialtyIds.length > 0) {
            console.log(
              '🏷️ Assigning specialties via update action:',
              formData.specialtyIds
            )
            await updateDoctorAction(result.data.doctorId, {
              specialtyIds: formData.specialtyIds,
            })
          }

          // Obtener el doctor creado para pasarlo al callback
          const doctorResult = await getDoctorById(result.data.doctorId)
          if (doctorResult.success && doctorResult.data) {
            onSuccess?.(doctorResult.data)
          } else {
            // Fallback: crear un objeto doctor básico con los datos del formulario
            const fallbackDoctor: Doctor = {
              id: result.data.doctorId,
              user: {
                id: '',
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phone,
                isActive: true,
              },
              license: formData.license,
              phone: formData.phone,
              address: formData.address,
              bio: formData.bio,
              consultationFee: formData.consultationFee,
              education: formData.education,
              experience: formData.experience,
              languages: formData.languages,
              timeZone: formData.timeZone,
              specialties: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            onSuccess?.(fallbackDoctor)
          }
        } else {
          throw new Error(result.error || 'Error al crear doctor')
        }
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      // Aquí podrías mostrar un toast o alert con el error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  // ==============================================
  // Componentes de Renderizado
  // ==============================================

  const renderArrayInput = (
    field: keyof DoctorFormData,
    label: string,
    placeholder: string,
    icon: React.ReactNode
  ) => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium flex items-center gap-2'>
        {icon}
        {label}
      </Label>
      {(formData[field] as string[]).map((item, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            placeholder={placeholder}
            value={item}
            onChange={(e) =>
              handleArrayInputChange(field, index, e.target.value)
            }
            className='flex-1'
          />
          {(formData[field] as string[]).length > 1 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => removeArrayItem(field, index)}
              className='px-2'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => addArrayItem(field)}
        className='w-full'
      >
        <Plus className='h-4 w-4 mr-2' />
        Agregar {label.toLowerCase()}
      </Button>
    </div>
  )

  const renderSpecialtiesSelection = () => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium flex items-center gap-2'>
        <Stethoscope className='h-4 w-4' />
        Especialidades
      </Label>
      {errors.specialtyIds && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{errors.specialtyIds}</AlertDescription>
        </Alert>
      )}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {isLoadingSpecialties ? (
          <div className='col-span-full flex items-center justify-center py-4'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span className='ml-2'>Cargando especialidades...</span>
          </div>
        ) : (
          specialties?.map((specialty) => (
            <div key={specialty.id} className='flex items-center space-x-2'>
              <Checkbox
                id={specialty.id}
                checked={formData.specialtyIds.includes(specialty.id)}
                onCheckedChange={() => handleSpecialtyToggle(specialty.id)}
              />
              <Label
                htmlFor={specialty.id}
                className='text-sm font-normal cursor-pointer'
              >
                {specialty.name}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  )

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Stethoscope className='h-5 w-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Información Básica */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Información Básica</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Mail className='h-4 w-4' />
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='doctor@ejemplo.com'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!!doctor} // No permitir cambiar email en edición
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email}</p>
                )}
              </div>

              {!doctor && (
                <div className='space-y-2'>
                  <Label htmlFor='password' className='text-sm font-medium'>
                    Contraseña
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Contraseña temporal'
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className='text-sm text-red-600'>{errors.password}</p>
                  )}
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='firstName' className='text-sm font-medium'>
                  Nombre
                </Label>
                <Input
                  id='firstName'
                  placeholder='Dr. Juan'
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className='text-sm text-red-600'>{errors.firstName}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-sm font-medium'>
                  Apellido
                </Label>
                <Input
                  id='lastName'
                  placeholder='García'
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className='text-sm text-red-600'>{errors.lastName}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='license' className='text-sm font-medium'>
                  Número de Licencia
                </Label>
                <Input
                  id='license'
                  placeholder='LIC-12345'
                  value={formData.license}
                  onChange={(e) => handleInputChange('license', e.target.value)}
                  className={errors.license ? 'border-red-500' : ''}
                />
                {errors.license && (
                  <p className='text-sm text-red-600'>{errors.license}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='phone'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Phone className='h-4 w-4' />
                  Teléfono
                </Label>
                <Input
                  id='phone'
                  placeholder='+1234567890'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className='text-sm text-red-600'>{errors.phone}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='address'
                className='text-sm font-medium flex items-center gap-2'
              >
                <MapPin className='h-4 w-4' />
                Dirección
              </Label>
              <Input
                id='address'
                placeholder='Calle Principal 123, Ciudad'
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className='text-sm text-red-600'>{errors.address}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio' className='text-sm font-medium'>
                Biografía
              </Label>
              <Textarea
                id='bio'
                placeholder='Especialista en cardiología con 10 años de experiencia...'
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className='text-sm text-red-600'>{errors.bio}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Información Profesional */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Información Profesional</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='consultationFee'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <DollarSign className='h-4 w-4' />
                  Tarifa de Consulta (USD)
                </Label>
                <Input
                  id='consultationFee'
                  type='number'
                  placeholder='150'
                  value={formData.consultationFee}
                  onChange={(e) =>
                    handleInputChange('consultationFee', Number(e.target.value))
                  }
                  className={errors.consultationFee ? 'border-red-500' : ''}
                />
                {errors.consultationFee && (
                  <p className='text-sm text-red-600'>
                    {errors.consultationFee}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='experience' className='text-sm font-medium'>
                  Años de Experiencia
                </Label>
                <Input
                  id='experience'
                  type='number'
                  placeholder='10'
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange('experience', Number(e.target.value))
                  }
                  className={errors.experience ? 'border-red-500' : ''}
                />
                {errors.experience && (
                  <p className='text-sm text-red-600'>{errors.experience}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='timeZone'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Clock className='h-4 w-4' />
                  Zona Horaria
                </Label>
                <Select
                  value={formData.timeZone}
                  onValueChange={(value) =>
                    handleInputChange('timeZone', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar zona horaria' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='America/Santo_Domingo'>
                      Santo Domingo (GMT-4)
                    </SelectItem>
                    <SelectItem value='America/New_York'>
                      Nueva York (GMT-5)
                    </SelectItem>
                    <SelectItem value='America/Los_Angeles'>
                      Los Ángeles (GMT-8)
                    </SelectItem>
                    <SelectItem value='Europe/Madrid'>
                      Madrid (GMT+1)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderSpecialtiesSelection()}

            {renderArrayInput(
              'education',
              'Educación',
              'Universidad Nacional - Medicina',
              <GraduationCap className='h-4 w-4' />
            )}

            {renderArrayInput(
              'languages',
              'Idiomas',
              'Español',
              <Languages className='h-4 w-4' />
            )}

            {renderArrayInput(
              'certifications',
              'Certificaciones',
              'Certificación del Colegio Médico',
              <Award className='h-4 w-4' />
            )}

            {renderArrayInput(
              'awards',
              'Premios y Reconocimientos',
              'Premio a la Excelencia Médica',
              <Award className='h-4 w-4' />
            )}

            {renderArrayInput(
              'publications',
              'Publicaciones',
              'Artículo en Revista Médica',
              <GraduationCap className='h-4 w-4' />
            )}
          </div>

          <Separator />

          {/* Información de Contacto Público */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              Información de Contacto Público
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='publicEmail'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Mail className='h-4 w-4' />
                  Email Público
                </Label>
                <Input
                  id='publicEmail'
                  type='email'
                  placeholder='doctor@medicaldatedr.com'
                  value={formData.publicEmail}
                  onChange={(e) =>
                    handleInputChange('publicEmail', e.target.value)
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='publicPhone'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Phone className='h-4 w-4' />
                  Teléfono Público
                </Label>
                <Input
                  id='publicPhone'
                  placeholder='+1-809-555-0123'
                  value={formData.publicPhone}
                  onChange={(e) =>
                    handleInputChange('publicPhone', e.target.value)
                  }
                />
              </div>
            </div>
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
                  {doctor ? 'Actualizando...' : 'Creando...'}
                </>
              ) : doctor ? (
                'Actualizar Doctor'
              ) : (
                'Crear Doctor'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
