'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
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
  Loader2,
  Calendar,
  Video,
} from 'lucide-react'
import { useAllActiveSpecialties } from '@/features/specialties/hooks/use-specialties'
import { useAllActiveClinics } from '@/features/clinics'
import type {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorFormData,
} from '../types'
import { createDoctorAction } from '../actions/doctor-actions'
import { useUpdateDoctor } from '../hooks/use-doctors'

// ==============================================
// Schema de Validación con Zod
// ==============================================

const doctorFormSchema = z.object({
  email: z
    .string()
    .email('El email no es válido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  license: z
    .string()
    .min(3, 'La licencia debe tener al menos 3 caracteres')
    .max(50, 'La licencia no puede exceder 50 caracteres'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  bio: z
    .string()
    .min(1, 'La biografía es requerida')
    .max(1000, 'La biografía no puede exceder 1000 caracteres'),
  consultationFee: z
    .number()
    .min(0, 'La tarifa debe ser al menos 0')
    .max(10000, 'La tarifa no puede exceder 10,000'),
  experience: z
    .number()
    .min(0, 'La experiencia debe ser al menos 0 años')
    .max(50, 'La experiencia no puede exceder 50 años'),
  timeZone: z.string().min(1, 'La zona horaria es requerida'),
  meetingLink: z
    .string()
    .url('Debe ser una URL válida')
    .regex(
      /^https:\/\/meet\.google\.com\/[a-z0-9\-]+$/,
      'Debe ser un enlace válido de Google Meet'
    )
    .optional()
    .or(z.literal('')),
  publicEmail: z.string(),
  publicPhone: z.string(),
  education: z.array(z.string()),
  languages: z.array(z.string()),
  certifications: z.array(z.string()),
  awards: z.array(z.string()),
  publications: z.array(z.string()),
  specialtyIds: z
    .array(z.string())
    .min(1, 'Debe seleccionar al menos una especialidad'),
  clinicIds: z.array(z.string()),
}) satisfies z.ZodType<DoctorFormData>

// ==============================================
// Valores por Defecto
// ==============================================

const defaultValues: DoctorFormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  license: '',
  phone: '',
  address: '',
  bio: '',
  consultationFee: 0,
  experience: 0,
  timeZone: 'America/Santo_Domingo',
  meetingLink: '',
  publicEmail: '',
  publicPhone: '',
  education: ['Universidad Nacional - Medicina'],
  languages: ['Español'],
  certifications: ['Certificación del Colegio Médico'],
  awards: ['Premio a la Excelencia Médica'],
  publications: ['Artículo en Revista Médica'],
  specialtyIds: [],
  clinicIds: [],
}

// ==============================================
// Interfaces
// ==============================================

interface DoctorFormProps {
  doctor?: Doctor | null
  onSuccess?: () => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ==============================================
// Componente Principal
// ==============================================

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

export function DoctorForm({
  doctor,
  onSuccess,
  onCancel,
  title = 'Crear Doctor',
  description = 'Completa la información para crear un nuevo doctor',
}: DoctorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const updateDoctorMutation = useUpdateDoctor()
  const { data: specialties } = useAllActiveSpecialties()
  const { data: clinics } = useAllActiveClinics()

  // ==============================================
  // React Hook Form Setup
  // ==============================================

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form

  const [education, setEducation] = useState<string[]>([
    'Universidad Nacional - Medicina',
  ])
  const [languages, setLanguages] = useState<string[]>(['Español'])
  const [certifications, setCertifications] = useState<string[]>([
    'Certificación del Colegio Médico',
  ])
  const [awards, setAwards] = useState<string[]>([
    'Premio a la Excelencia Médica',
  ])
  const [publications, setPublications] = useState<string[]>([
    'Artículo en Revista Médica',
  ])

  // Estado para disponibilidad
  const [availability, setAvailability] = useState(() => {
    if (
      doctor?.availability &&
      Array.isArray(doctor.availability) &&
      doctor.availability.length > 0
    ) {
      return DAYS_OF_WEEK.map((day) => {
        const existing = doctor.availability?.find(
          (av) => av.dayOfWeek === day.value
        )
        return {
          dayOfWeek: day.value,
          startTime:
            existing?.startTime ||
            (day.value === 0 ? '00:00' : day.value === 6 ? '00:00' : '09:00'),
          endTime:
            existing?.endTime ||
            (day.value === 0 ? '00:00' : day.value === 6 ? '00:00' : '17:00'),
          isAvailable:
            existing?.isAvailable ?? (day.value !== 0 && day.value !== 6), // Domingo y Sábado no disponibles por defecto
        }
      })
    }
    return DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      startTime: day.value === 0 || day.value === 6 ? '00:00' : '09:00',
      endTime: day.value === 0 || day.value === 6 ? '00:00' : '17:00',
      isAvailable: day.value !== 0 && day.value !== 6, // Solo Lunes a Viernes disponibles por defecto (respetando sábado como día de reposo)
    }))
  })

  // Sincronizar estados locales con el formulario
  useEffect(() => {
    setValue('education', education)
  }, [education, setValue])

  useEffect(() => {
    setValue('languages', languages)
  }, [languages, setValue])

  useEffect(() => {
    setValue('certifications', certifications)
  }, [certifications, setValue])

  useEffect(() => {
    setValue('awards', awards)
  }, [awards, setValue])

  useEffect(() => {
    setValue('publications', publications)
  }, [publications, setValue])

  // ==============================================
  // Efectos
  // ==============================================

  useEffect(() => {
    if (doctor) {
      // Llenar el formulario con los datos del doctor
      reset({
        email: doctor.user.email,
        password: '',
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        license: doctor.license,
        phone: doctor.phone,
        address: doctor.address,
        bio: doctor.bio,
        consultationFee: doctor.consultationFee,
        experience: doctor.experience,
        timeZone: doctor.timeZone,
        meetingLink: doctor.meetingLink || '',
        publicEmail: doctor.publicEmail || '',
        publicPhone: doctor.publicPhone || '',
        specialtyIds: doctor.specialties.map((s) => s.id),
        clinicIds: doctor.clinics?.map((c) => c.clinic.id) || [],
      })

      // Inicializar estados locales
      setEducation(
        doctor.education.length > 0
          ? doctor.education
          : ['Universidad Nacional - Medicina']
      )
      setLanguages(doctor.languages.length > 0 ? doctor.languages : ['Español'])
      setCertifications(
        doctor.certifications && doctor.certifications.length > 0
          ? doctor.certifications
          : ['Certificación del Colegio Médico']
      )
      setAwards(
        doctor.awards && doctor.awards.length > 0
          ? doctor.awards
          : ['Premio a la Excelencia Médica']
      )
      setPublications(
        doctor.publications && doctor.publications.length > 0
          ? doctor.publications
          : ['Artículo en Revista Médica']
      )
    }
  }, [doctor, reset])

  // ==============================================
  // Handlers
  // ==============================================

  const handleSpecialtyToggle = (specialtyId: string) => {
    const currentSpecialties = watch('specialtyIds')
    const index = currentSpecialties.indexOf(specialtyId)

    if (index > -1) {
      currentSpecialties.splice(index, 1)
    } else {
      currentSpecialties.push(specialtyId)
    }

    setValue('specialtyIds', currentSpecialties)
  }

  const handleDayToggle = (dayIndex: number, checked: boolean) => {
    const updatedAvailability = [...availability]
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      isAvailable: checked,
      startTime: checked
        ? dayIndex === 0 || dayIndex === 6
          ? '00:00'
          : '09:00'
        : '00:00',
      endTime: checked
        ? dayIndex === 0 || dayIndex === 6
          ? '00:00'
          : '17:00'
        : '00:00',
    }
    setAvailability(updatedAvailability)
  }

  const handleTimeChange = (
    dayIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updatedAvailability = [...availability]
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [field]: value,
    }
    setAvailability(updatedAvailability)
  }

  const onSubmit = async (data: DoctorFormData) => {
    setIsSubmitting(true)
    try {
      if (doctor) {
        // Actualizar doctor existente
        const updateData: UpdateDoctorData = {
          ...data,
        }

        const result = await updateDoctorMutation.mutateAsync({
          id: doctor.id,
          data: updateData,
        })

        if (result.success && result.data) {
          toast.success('Doctor actualizado exitosamente')
          onSuccess?.()
        } else {
          toast.error(result.error || 'Error al actualizar el doctor')
        }
      } else {
        // Crear nuevo doctor (la disponibilidad se maneja automáticamente en el backend)
        const createData: CreateDoctorData = {
          email: data.email,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          license: data.license,
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          consultationFee: data.consultationFee,
          education: education,
          experience: data.experience,
          languages: languages,
          timeZone: data.timeZone,
          meetingLink: data.meetingLink || undefined,
          specialtyIds: data.specialtyIds,
          clinicIds: data.clinicIds,
        }

        const result = await createDoctorAction(createData)

        if (result.success && result.data) {
          toast.success('Doctor creado exitosamente')

          // Limpiar todos los campos del formulario
          reset()

          // Limpiar estados locales
          setEducation([''])
          setLanguages([''])
          setCertifications([''])
          setAwards([''])
          setPublications([''])

          // Resetear disponibilidad a valores por defecto
          setAvailability(
            DAYS_OF_WEEK.map((day) => ({
              dayOfWeek: day.value,
              startTime: day.value === 0 || day.value === 6 ? '00:00' : '09:00',
              endTime: day.value === 0 || day.value === 6 ? '00:00' : '17:00',
              isAvailable: day.value !== 0 && day.value !== 6, // Solo Lunes a Viernes disponibles por defecto
            }))
          )

          // Limpiar especialidades seleccionadas
          setValue('specialtyIds', [])

          // Limpiar clínicas seleccionadas
          setValue('clinicIds', [])

          // Llamar onSuccess sin pasar datos por ahora
          onSuccess?.()
        } else {
          toast.error(result.error || 'Error al crear el doctor')
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Simplemente llamar onCancel si existe
    onCancel?.()
  }

  // ==============================================
  // Componentes de Renderizado
  // ==============================================

  const renderArrayInput = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    label: string,
    placeholder: string,
    icon: React.ReactNode
  ) => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium flex items-center gap-2'>
        {icon}
        {label}
      </Label>
      {items.map((item, index) => (
        <div key={index} className='flex gap-2'>
          <div className='flex-1'>
            <Input
              placeholder={placeholder}
              value={item}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = e.target.value
                setItems(newItems)
              }}
            />
          </div>
          {items.length > 1 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setItems(items.filter((_, i) => i !== index))}
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
        onClick={() => setItems([...items, ''])}
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
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {specialties?.map((specialty) => (
          <div key={specialty.id} className='flex items-center space-x-2'>
            <Checkbox
              id={specialty.id}
              checked={watch('specialtyIds').includes(specialty.id)}
              onCheckedChange={() => handleSpecialtyToggle(specialty.id)}
            />
            <Label
              htmlFor={specialty.id}
              className='text-sm font-normal cursor-pointer'
            >
              {specialty.name}
            </Label>
          </div>
        ))}
      </div>
      {errors.specialtyIds && (
        <p className='text-sm text-red-600'>
          {String(errors.specialtyIds?.message)}
        </p>
      )}
    </div>
  )

  const renderClinicsSelection = () => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium flex items-center gap-2'>
        <MapPin className='h-4 w-4' />
        Clínicas Asignadas
      </Label>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        {clinics?.data?.map((clinic: { id: string; name: string }) => (
          <div key={clinic.id} className='flex items-center space-x-2'>
            <Checkbox
              id={clinic.id}
              checked={watch('clinicIds').includes(clinic.id)}
              onCheckedChange={() => {
                const currentClinics = watch('clinicIds')
                const index = currentClinics.indexOf(clinic.id)
                if (index > -1) {
                  currentClinics.splice(index, 1)
                } else {
                  currentClinics.push(clinic.id)
                }
                setValue('clinicIds', currentClinics)
              }}
            />
            <Label
              htmlFor={clinic.id}
              className='text-sm font-normal cursor-pointer'
            >
              {clinic.name}
            </Label>
          </div>
        ))}
      </div>
      {errors.clinicIds && (
        <p className='text-sm text-red-600'>
          {String(errors.clinicIds?.message)}
        </p>
      )}
    </div>
  )

  const renderAvailabilitySection = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold flex items-center gap-2'>
        <Calendar className='h-5 w-5 text-blue-600' />
        Disponibilidad Semanal
      </h3>
      <p className='text-sm text-muted-foreground'>
        Configura los horarios de trabajo para cada día de la semana
      </p>

      <div className='space-y-3'>
        {DAYS_OF_WEEK.map((day, index) => {
          const dayAvailability = availability[index]
          const isAvailable = dayAvailability.isAvailable

          return (
            <div key={day.value} className='border rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={isAvailable}
                    onCheckedChange={(checked) =>
                      handleDayToggle(index, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className='text-sm font-medium'
                  >
                    {day.label}
                  </Label>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {isAvailable ? 'Disponible' : 'No disponible'}
                </div>
              </div>

              {isAvailable && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor={`start-${day.value}`} className='text-sm'>
                      Hora de inicio
                    </Label>
                    <Input
                      id={`start-${day.value}`}
                      type='time'
                      value={dayAvailability.startTime}
                      onChange={(e) =>
                        handleTimeChange(index, 'startTime', e.target.value)
                      }
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor={`end-${day.value}`} className='text-sm'>
                      Hora de fin
                    </Label>
                    <Input
                      id={`end-${day.value}`}
                      type='time'
                      value={dayAvailability.endTime}
                      onChange={(e) =>
                        handleTimeChange(index, 'endTime', e.target.value)
                      }
                      className='w-full'
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Información Básica */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Información Básica</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Email
                </Label>
                <Input
                  type='email'
                  placeholder='doctor@ejemplo.com'
                  disabled={!!doctor}
                  {...register('email')}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>
                    {String(errors.email?.message)}
                  </p>
                )}
              </div>

              {!doctor && (
                <div className='space-y-2'>
                  <Label>Contraseña</Label>
                  <div className='relative'>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Contraseña '
                      {...register('password')}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
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
                    <p className='text-sm text-red-600'>
                      {String(errors.password?.message)}
                    </p>
                  )}
                </div>
              )}

              <div className='space-y-2'>
                <Label>Nombre</Label>
                <Input placeholder='Dr. Juan' {...register('firstName')} />
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
                <Label>Número de Licencia</Label>
                <Input placeholder='LIC-12345' {...register('license')} />
                {errors.license && (
                  <p className='text-sm text-red-600'>
                    {String(errors.license?.message)}
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
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                Dirección
              </Label>
              <Input
                placeholder='Calle Principal 123, Ciudad'
                {...register('address')}
              />
              {errors.address && (
                <p className='text-sm text-red-600'>
                  {String(errors.address?.message)}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Biografía</Label>
              <Textarea
                placeholder='Especialista en cardiología con 10 años de experiencia...'
                rows={4}
                {...register('bio')}
              />
              {errors.bio && (
                <p className='text-sm text-red-600'>
                  {String(errors.bio?.message)}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Información Profesional */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Información Profesional</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4' />
                  Tarifa de Consulta (USD)
                </Label>
                <Input
                  type='number'
                  placeholder='150'
                  {...register('consultationFee', { valueAsNumber: true })}
                />
                {errors.consultationFee && (
                  <p className='text-sm text-red-600'>
                    {String(errors.consultationFee?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Años de Experiencia</Label>
                <Input
                  type='number'
                  placeholder='10'
                  {...register('experience', { valueAsNumber: true })}
                />
                {errors.experience && (
                  <p className='text-sm text-red-600'>
                    {String(errors.experience?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Zona Horaria
                </Label>
                <Select
                  onValueChange={(value) => setValue('timeZone', value)}
                  defaultValue={watch('timeZone')}
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
                {errors.timeZone && (
                  <p className='text-sm text-red-600'>
                    {String(errors.timeZone?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Video className='h-4 w-4' />
                  Enlace de Google Meet (Opcional)
                </Label>
                <Input
                  type='url'
                  placeholder='https://meet.google.com/abc-defg-hij'
                  {...register('meetingLink')}
                />
                <p className='text-xs text-muted-foreground'>
                  Enlace permanente de Google Meet para citas virtuales. Los
                  pacientes verán este enlace cuando confirmes una cita virtual.
                </p>
                {errors.meetingLink && (
                  <p className='text-sm text-red-600'>
                    {String(errors.meetingLink?.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Especialidades */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <GraduationCap className='h-5 w-5 text-blue-600' />
                Especialidades
              </h3>
              {renderSpecialtiesSelection()}
            </div>

            <Separator />

            {/* Clínicas */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-green-600' />
                Clínicas
              </h3>
              {renderClinicsSelection()}
            </div>

            <Separator />

            {renderArrayInput(
              education,
              setEducation,
              'Educación',
              'Universidad Nacional - Medicina',
              <GraduationCap className='h-4 w-4' />
            )}

            {renderArrayInput(
              languages,
              setLanguages,
              'Idiomas',
              'Español',
              <Languages className='h-4 w-4' />
            )}

            {renderArrayInput(
              certifications,
              setCertifications,
              'Certificaciones',
              'Certificación del Colegio Médico',
              <Award className='h-4 w-4' />
            )}

            {renderArrayInput(
              awards,
              setAwards,
              'Premios y Reconocimientos',
              'Premio a la Excelencia Médica',
              <Award className='h-4 w-4' />
            )}

            {renderArrayInput(
              publications,
              setPublications,
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
                <Label className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Email Público
                </Label>
                <Input
                  type='email'
                  placeholder='doctor@medicaldatedr.com'
                  {...register('publicEmail')}
                />
                {errors.publicEmail && (
                  <p className='text-sm text-red-600'>
                    {String(errors.publicEmail?.message)}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' />
                  Teléfono Público
                </Label>
                <Input
                  placeholder='+1-809-555-0123'
                  {...register('publicPhone')}
                />
                {errors.publicPhone && (
                  <p className='text-sm text-red-600'>
                    {String(errors.publicPhone?.message)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          {renderAvailabilitySection()}

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
