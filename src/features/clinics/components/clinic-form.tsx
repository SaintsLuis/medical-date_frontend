'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Save,
  Calendar,
  Wifi,
  Heart,
} from 'lucide-react'
import {
  Clinic,
  CreateClinicFormData,
  createClinicSchema,
  CLINIC_FORM_DEFAULTS,
  COMMON_CLINIC_SERVICES,
  COMMON_CLINIC_AMENITIES,
  WeeklySchedule,
} from '../types'
import { useCreateClinic, useUpdateClinic } from '../hooks/use-clinics'

// ==============================================
// Interfaces del Componente
// ==============================================

interface ClinicFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic?: Clinic | null
  onSuccess?: () => void
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  description?: string
  icon?: React.ReactNode
}

// ==============================================
// Componentes de UI
// ==============================================

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
    {description && (
      <p className='text-xs text-muted-foreground'>{description}</p>
    )}
    {error && (
      <p className='text-xs text-red-600 flex items-center gap-1'>
        <AlertCircle className='h-3 w-3' />
        {error}
      </p>
    )}
  </div>
)

// ==============================================
// Componente Principal
// ==============================================

export function ClinicForm({
  open,
  onOpenChange,
  clinic,
  onSuccess,
}: ClinicFormProps) {
  const isEditMode = !!clinic
  const [activeTab, setActiveTab] = useState('basic')
  const [newService, setNewService] = useState('')
  const [newAmenity, setNewAmenity] = useState('')

  const createClinic = useCreateClinic()
  const updateClinic = useUpdateClinic()

  const methods = useForm({
    resolver: zodResolver(createClinicSchema),
    defaultValues: clinic
      ? {
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email,
          coordinates: clinic.coordinates,
          description: clinic.description || '',
          website: clinic.website || '',
          workingHours:
            clinic.workingHours || CLINIC_FORM_DEFAULTS.workingHours,
          services: clinic.services,
          amenities: clinic.amenities || [],
          isActive: clinic.isActive,
        }
      : CLINIC_FORM_DEFAULTS,
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = methods

  const watchedServices = (watch('services') || []) as string[]
  const watchedAmenities = (watch('amenities') || []) as string[]

  // Reset form when clinic changes
  useEffect(() => {
    if (clinic) {
      reset({
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        coordinates: clinic.coordinates,
        description: clinic.description || '',
        website: clinic.website || '',
        workingHours: clinic.workingHours || CLINIC_FORM_DEFAULTS.workingHours,
        services: clinic.services,
        amenities: clinic.amenities || [],
        isActive: clinic.isActive,
      })
    } else {
      reset(CLINIC_FORM_DEFAULTS)
    }
  }, [clinic, reset])

  const onSubmit = async (data: CreateClinicFormData) => {
    try {
      if (isEditMode && clinic) {
        await updateClinic.mutateAsync({ id: clinic.id, data })
      } else {
        await createClinic.mutateAsync(data)
      }

      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error)
    }
  }

  const addService = () => {
    if (newService.trim() && !watchedServices.includes(newService.trim())) {
      setValue('services', [...watchedServices, newService.trim()])
      setNewService('')
    }
  }

  const removeService = (serviceToRemove: string) => {
    setValue(
      'services',
      watchedServices.filter((service) => service !== serviceToRemove)
    )
  }

  const addServiceFromList = (service: string) => {
    if (!watchedServices.includes(service)) {
      setValue('services', [...watchedServices, service])
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !watchedAmenities.includes(newAmenity.trim())) {
      setValue('amenities', [...watchedAmenities, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenityToRemove: string) => {
    setValue(
      'amenities',
      watchedAmenities.filter((amenity) => amenity !== amenityToRemove)
    )
  }

  const addAmenityFromList = (amenity: string) => {
    if (!watchedAmenities.includes(amenity)) {
      setValue('amenities', [...watchedAmenities, amenity])
    }
  }

  const isLoading = createClinic.isPending || updateClinic.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            {isEditMode ? 'Editar Clínica' : 'Crear Nueva Clínica'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica la información de la clínica'
              : 'Completa la información para crear una nueva clínica'}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='basic'>Información Básica</TabsTrigger>
                <TabsTrigger value='hours'>Horarios</TabsTrigger>
                <TabsTrigger value='services'>
                  Servicios & Amenidades
                </TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Building2 className='h-5 w-5' />
                      Información General
                    </CardTitle>
                    <CardDescription>
                      Datos básicos de la clínica
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        label='Nombre de la Clínica'
                        required
                        error={errors.name?.message}
                        icon={<Building2 className='h-4 w-4' />}
                      >
                        <Input
                          {...register('name')}
                          placeholder='Ej: Clínica San José'
                          className='h-10'
                        />
                      </FormField>

                      <FormField
                        label='Teléfono'
                        required
                        error={errors.phone?.message}
                        icon={<Phone className='h-4 w-4' />}
                      >
                        <Input
                          {...register('phone')}
                          placeholder='+1 (809) 123-4567'
                          className='h-10'
                        />
                      </FormField>
                    </div>

                    <FormField
                      label='Dirección'
                      required
                      error={errors.address?.message}
                      icon={<MapPin className='h-4 w-4' />}
                    >
                      <Input
                        {...register('address')}
                        placeholder='Calle Principal #123, Ciudad'
                        className='h-10'
                      />
                    </FormField>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        label='Email'
                        required
                        error={errors.email?.message}
                        icon={<Mail className='h-4 w-4' />}
                      >
                        <Input
                          {...register('email')}
                          type='email'
                          placeholder='contacto@clinica.com'
                          className='h-10'
                        />
                      </FormField>

                      <FormField
                        label='Sitio Web'
                        required
                        error={errors.website?.message}
                        icon={<Globe className='h-4 w-4' />}
                      >
                        <Input
                          {...register('website')}
                          placeholder='https://www.clinica.com'
                          className='h-10'
                          type='url'
                        />
                      </FormField>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        label='Latitud'
                        required
                        error={errors.coordinates?.lat?.message}
                        description='Coordenadas GPS'
                      >
                        <Input
                          {...register('coordinates.lat', {
                            valueAsNumber: true,
                          })}
                          type='number'
                          step='any'
                          placeholder='19.4326'
                          className='h-10'
                        />
                      </FormField>

                      <FormField
                        label='Longitud'
                        required
                        error={errors.coordinates?.lng?.message}
                        description='Coordenadas GPS'
                      >
                        <Input
                          {...register('coordinates.lng', {
                            valueAsNumber: true,
                          })}
                          type='number'
                          step='any'
                          placeholder='-99.1332'
                          className='h-10'
                        />
                      </FormField>
                    </div>

                    <FormField
                      label='Descripción'
                      error={errors.description?.message}
                      description='Información adicional sobre la clínica'
                    >
                      <Textarea
                        {...register('description')}
                        placeholder='Describe los servicios especializados, la misión de la clínica, etc.'
                        rows={3}
                      />
                    </FormField>

                    <FormField
                      label='Estado'
                      description='Activar o desactivar la clínica'
                    >
                      <Controller
                        name='isActive'
                        control={control}
                        render={({ field }) => (
                          <div className='flex items-center gap-2'>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className='text-sm'>
                              {field.value ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        )}
                      />
                    </FormField>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='hours' className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Clock className='h-5 w-5' />
                      Horarios de Atención
                    </CardTitle>
                    <CardDescription>
                      Configura los horarios de cada día de la semana
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {(
                      Object.entries({
                        monday: 'Lunes',
                        tuesday: 'Martes',
                        wednesday: 'Miércoles',
                        thursday: 'Jueves',
                        friday: 'Viernes',
                        saturday: 'Sábado',
                        sunday: 'Domingo',
                      }) as [keyof WeeklySchedule, string][]
                    ).map(([day, label]) => (
                      <div
                        key={day}
                        className='space-y-3 p-4 border rounded-lg'
                      >
                        <div className='flex items-center justify-between'>
                          <Label className='text-sm font-medium flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            {label}
                          </Label>
                          <Controller
                            name={
                              `workingHours.${day}.isOpen` as `workingHours.${keyof WeeklySchedule}.isOpen`
                            }
                            control={control}
                            render={({ field }) => (
                              <div className='flex items-center gap-2'>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <span className='text-sm'>
                                  {field.value ? 'Abierto' : 'Cerrado'}
                                </span>
                              </div>
                            )}
                          />
                        </div>

                        <Controller
                          name={
                            `workingHours.${day}.isOpen` as `workingHours.${keyof WeeklySchedule}.isOpen`
                          }
                          control={control}
                          render={({ field: { value: isOpen } }) => (
                            <div
                              className={`grid grid-cols-2 gap-3 ${
                                !isOpen ? 'opacity-50' : ''
                              }`}
                            >
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Inicio
                                </Label>
                                <Input
                                  type='time'
                                  {...register(
                                    `workingHours.${day}.start` as `workingHours.${keyof WeeklySchedule}.start`
                                  )}
                                  disabled={!isOpen}
                                  className='h-9'
                                />
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Fin
                                </Label>
                                <Input
                                  type='time'
                                  {...register(
                                    `workingHours.${day}.end` as `workingHours.${keyof WeeklySchedule}.end`
                                  )}
                                  disabled={!isOpen}
                                  className='h-9'
                                />
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='services' className='space-y-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Servicios */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Heart className='h-5 w-5' />
                        Servicios Médicos
                      </CardTitle>
                      <CardDescription>
                        Servicios que ofrece la clínica
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Servicios Actuales
                        </Label>
                        <div className='flex flex-wrap gap-2'>
                          {watchedServices.map((service) => (
                            <Badge
                              key={service}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              {service}
                              <button
                                type='button'
                                onClick={() => removeService(service)}
                                className='ml-1 hover:text-red-500'
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </Badge>
                          ))}
                          {watchedServices.length === 0 && (
                            <p className='text-sm text-muted-foreground'>
                              No hay servicios agregados
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Agregar Servicio
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            placeholder='Nuevo servicio'
                            className='h-9'
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addService()
                              }
                            }}
                          />
                          <Button
                            type='button'
                            onClick={addService}
                            size='sm'
                            disabled={!newService.trim()}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Servicios Comunes
                        </Label>
                        <div className='flex flex-wrap gap-2'>
                          {COMMON_CLINIC_SERVICES.map((service) => (
                            <Badge
                              key={service}
                              variant='outline'
                              className='cursor-pointer hover:bg-primary hover:text-primary-foreground'
                              onClick={() => addServiceFromList(service)}
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Amenidades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Wifi className='h-5 w-5' />
                        Amenidades
                      </CardTitle>
                      <CardDescription>
                        Comodidades disponibles en la clínica
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Amenidades Actuales
                        </Label>
                        <div className='flex flex-wrap gap-2'>
                          {watchedAmenities.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              {amenity}
                              <button
                                type='button'
                                onClick={() => removeAmenity(amenity)}
                                className='ml-1 hover:text-red-500'
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </Badge>
                          ))}
                          {watchedAmenities.length === 0 && (
                            <p className='text-sm text-muted-foreground'>
                              No hay amenidades agregadas
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Agregar Amenidad
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            placeholder='Nueva amenidad'
                            className='h-9'
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addAmenity()
                              }
                            }}
                          />
                          <Button
                            type='button'
                            onClick={addAmenity}
                            size='sm'
                            disabled={!newAmenity.trim()}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Amenidades Comunes
                        </Label>
                        <div className='flex flex-wrap gap-2'>
                          {COMMON_CLINIC_AMENITIES.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant='outline'
                              className='cursor-pointer hover:bg-primary hover:text-primary-foreground'
                              onClick={() => addAmenityFromList(amenity)}
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={!isValid || isLoading}
                className='min-w-[120px]'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    {isEditMode ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
