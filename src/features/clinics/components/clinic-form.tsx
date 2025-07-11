'use client'

import { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Star,
  Heart,
  CheckCircle,
} from 'lucide-react'
import {
  Clinic,
  ClinicFormData,
  CreateClinicData,
  UpdateClinicData,
  CLINIC_FORM_DEFAULTS,
  CLINIC_VALIDATION,
  COMMON_CLINIC_SERVICES,
  COMMON_CLINIC_AMENITIES,
  WeeklySchedule,
} from '../types'
import {
  createClinicAction,
  updateClinicAction,
} from '../actions/clinic-actions'

// ==============================================
// Interfaces del Componente
// ==============================================

interface ClinicFormProps {
  clinic?: Clinic | null
  onSuccess?: (clinic: Clinic) => void
  onCancel?: () => void
}

// ==============================================
// Componente Principal
// ==============================================

export function ClinicForm({ clinic, onSuccess, onCancel }: ClinicFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState<ClinicFormData>(() => {
    if (clinic) {
      return {
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        coordinates: clinic.coordinates,
        description: clinic.description || '',
        website: clinic.website || '',
        workingHours: clinic.workingHours || CLINIC_FORM_DEFAULTS.workingHours,
        services: clinic.services,
        amenities: clinic.amenities,
        isActive: clinic.isActive,
      }
    }
    return CLINIC_FORM_DEFAULTS
  })

  // Estados de UI
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'services'>(
    'basic'
  )
  const [newService, setNewService] = useState('')
  const [newAmenity, setNewAmenity] = useState('')

  // ==============================================
  // Funciones de Validación
  // ==============================================

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < CLINIC_VALIDATION.name.minLength) {
      newErrors.name = `El nombre debe tener al menos ${CLINIC_VALIDATION.name.minLength} caracteres`
    } else if (formData.name.length > CLINIC_VALIDATION.name.maxLength) {
      newErrors.name = `El nombre no puede exceder ${CLINIC_VALIDATION.name.maxLength} caracteres`
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    } else if (formData.address.length < CLINIC_VALIDATION.address.minLength) {
      newErrors.address = `La dirección debe tener al menos ${CLINIC_VALIDATION.address.minLength} caracteres`
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!CLINIC_VALIDATION.phone.pattern.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!CLINIC_VALIDATION.email.pattern.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    // Validar website (opcional)
    if (
      formData.website &&
      !CLINIC_VALIDATION.website.pattern.test(formData.website)
    ) {
      newErrors.website = 'Formato de URL inválido'
    }

    // Validar coordenadas
    if (
      formData.coordinates.lat < CLINIC_VALIDATION.coordinates.lat.min ||
      formData.coordinates.lat > CLINIC_VALIDATION.coordinates.lat.max
    ) {
      newErrors.coordinates = 'Latitud inválida (-90 a 90)'
    }
    if (
      formData.coordinates.lng < CLINIC_VALIDATION.coordinates.lng.min ||
      formData.coordinates.lng > CLINIC_VALIDATION.coordinates.lng.max
    ) {
      newErrors.coordinates = 'Longitud inválida (-180 a 180)'
    }

    // Validar descripción (opcional)
    if (
      formData.description &&
      formData.description.length > CLINIC_VALIDATION.description.maxLength
    ) {
      newErrors.description = `La descripción no puede exceder ${CLINIC_VALIDATION.description.maxLength} caracteres`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ==============================================
  // Handlers de Eventos
  // ==============================================

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo al cambiar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: numValue,
      },
    }))

    // Limpiar error de coordenadas
    if (errors.coordinates) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.coordinates
        return newErrors
      })
    }
  }

  const handleWorkingHoursChange = (
    day: keyof WeeklySchedule,
    field: 'start' | 'end' | 'isOpen',
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }))
  }

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }))
      setNewService('')
    }
  }

  const removeService = (serviceToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service !== serviceToRemove),
    }))
  }

  const addServiceFromList = (service: string) => {
    if (!formData.services.includes(service)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, service],
      }))
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }))
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToRemove
      ),
    }))
  }

  const addAmenityFromList = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (clinic) {
        // Actualizar clínica existente
        const updateData: UpdateClinicData = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          coordinates: formData.coordinates,
          description: formData.description || undefined,
          website: formData.website || undefined,
          workingHours: formData.workingHours,
          services: formData.services,
          amenities: formData.amenities,
          isActive: formData.isActive,
        }

        const result = await updateClinicAction(clinic.id, updateData)

        if (result.success && result.data) {
          onSuccess?.(result.data)
        } else {
          throw new Error(result.error || 'Error al actualizar clínica')
        }
      } else {
        // Crear nueva clínica
        const createData: CreateClinicData = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          coordinates: formData.coordinates,
          description: formData.description || undefined,
          website: formData.website || undefined,
          workingHours: formData.workingHours,
          services: formData.services,
          amenities: formData.amenities,
        }

        const result = await createClinicAction(createData)

        if (result.success) {
          // Para crear, necesitamos obtener la clínica creada
          // Por ahora, creamos un objeto clínica básico con los datos del formulario
          const newClinic: Clinic = {
            id: result.data?.clinicId || '',
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            coordinates: formData.coordinates,
            description: formData.description,
            website: formData.website,
            isActive: true,
            workingHours: formData.workingHours,
            services: formData.services,
            amenities: formData.amenities,
            totalDoctors: 0,
            totalPatients: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          onSuccess?.(newClinic)
        } else {
          throw new Error(result.error || 'Error al crear clínica')
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(CLINIC_FORM_DEFAULTS)
    setErrors({})
    onCancel?.()
  }

  // ==============================================
  // Componentes de Renderizado
  // ==============================================

  const renderBasicInfo = () => (
    <div className='space-y-6'>
      {/* Información básica */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='name' className='flex items-center gap-2'>
            <Building2 className='h-4 w-4' />
            Nombre de la Clínica *
          </Label>
          <Input
            id='name'
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder='Ej: Centro Médico San José'
            disabled={isSubmitting}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.name}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phone' className='flex items-center gap-2'>
            <Phone className='h-4 w-4' />
            Teléfono *
          </Label>
          <Input
            id='phone'
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder='Ej: +1 (555) 123-4567'
            disabled={isSubmitting}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='email' className='flex items-center gap-2'>
            <Mail className='h-4 w-4' />
            Email *
          </Label>
          <Input
            id='email'
            type='email'
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder='info@clinica.com'
            disabled={isSubmitting}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.email}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='website' className='flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            Sitio Web
          </Label>
          <Input
            id='website'
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder='https://www.clinica.com'
            disabled={isSubmitting}
            className={errors.website ? 'border-red-500' : ''}
          />
          {errors.website && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.website}
            </p>
          )}
        </div>
      </div>

      {/* Dirección */}
      <div className='space-y-2'>
        <Label htmlFor='address' className='flex items-center gap-2'>
          <MapPin className='h-4 w-4' />
          Dirección *
        </Label>
        <Textarea
          id='address'
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder='Dirección completa de la clínica'
          rows={2}
          disabled={isSubmitting}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <p className='text-sm text-red-600 flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            {errors.address}
          </p>
        )}
      </div>

      {/* Coordenadas GPS */}
      <div className='space-y-4'>
        <Label className='flex items-center gap-2'>
          <MapPin className='h-4 w-4' />
          Coordenadas GPS *
        </Label>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='lat'>Latitud</Label>
            <Input
              id='lat'
              type='number'
              step='any'
              value={formData.coordinates.lat}
              onChange={(e) => handleCoordinatesChange('lat', e.target.value)}
              placeholder='Ej: 40.7128'
              disabled={isSubmitting}
              className={errors.coordinates ? 'border-red-500' : ''}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='lng'>Longitud</Label>
            <Input
              id='lng'
              type='number'
              step='any'
              value={formData.coordinates.lng}
              onChange={(e) => handleCoordinatesChange('lng', e.target.value)}
              placeholder='Ej: -74.0060'
              disabled={isSubmitting}
              className={errors.coordinates ? 'border-red-500' : ''}
            />
          </div>
        </div>
        {errors.coordinates && (
          <p className='text-sm text-red-600 flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            {errors.coordinates}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className='space-y-2'>
        <Label htmlFor='description'>Descripción</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder='Descripción de la clínica, servicios destacados, etc.'
          rows={3}
          disabled={isSubmitting}
          className={errors.description ? 'border-red-500' : ''}
        />
        <p className='text-sm text-muted-foreground'>
          {formData.description.length}/
          {CLINIC_VALIDATION.description.maxLength} caracteres
        </p>
        {errors.description && (
          <p className='text-sm text-red-600 flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            {errors.description}
          </p>
        )}
      </div>

      {/* Estado activo */}
      {clinic && (
        <div className='flex items-center space-x-2'>
          <Switch
            id='isActive'
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              handleInputChange('isActive', checked)
            }
            disabled={isSubmitting}
          />
          <Label htmlFor='isActive'>Clínica activa</Label>
        </div>
      )}
    </div>
  )

  const renderWorkingHours = () => {
    const days = [
      { key: 'monday', label: 'Lunes' },
      { key: 'tuesday', label: 'Martes' },
      { key: 'wednesday', label: 'Miércoles' },
      { key: 'thursday', label: 'Jueves' },
      { key: 'friday', label: 'Viernes' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' },
    ] as const

    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Clock className='h-5 w-5' />
          <h3 className='text-lg font-medium'>Horarios de Atención</h3>
        </div>

        {days.map((day) => (
          <Card key={day.key} className='p-4'>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-20'>
                  <Label className='font-medium'>{day.label}</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    checked={formData.workingHours[day.key].isOpen}
                    onCheckedChange={(checked) =>
                      handleWorkingHoursChange(day.key, 'isOpen', checked)
                    }
                    disabled={isSubmitting}
                  />
                  <span className='text-sm text-muted-foreground'>
                    {formData.workingHours[day.key].isOpen
                      ? 'Abierto'
                      : 'Cerrado'}
                  </span>
                </div>
              </div>

              {formData.workingHours[day.key].isOpen && (
                <div className='flex items-center space-x-2'>
                  <Input
                    type='time'
                    value={formData.workingHours[day.key].start}
                    onChange={(e) =>
                      handleWorkingHoursChange(day.key, 'start', e.target.value)
                    }
                    disabled={isSubmitting}
                    className='w-32'
                  />
                  <span className='text-muted-foreground'>a</span>
                  <Input
                    type='time'
                    value={formData.workingHours[day.key].end}
                    onChange={(e) =>
                      handleWorkingHoursChange(day.key, 'end', e.target.value)
                    }
                    disabled={isSubmitting}
                    className='w-32'
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderServicesAndAmenities = () => (
    <div className='space-y-6'>
      {/* Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Heart className='h-5 w-5' />
            Servicios Médicos
          </CardTitle>
          <CardDescription>
            Selecciona los servicios que ofrece la clínica
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Servicios seleccionados */}
          {formData.services.length > 0 && (
            <div className='space-y-2'>
              <Label>Servicios seleccionados:</Label>
              <div className='flex flex-wrap gap-2'>
                {formData.services.map((service) => (
                  <Badge
                    key={service}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {service}
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 ml-1'
                      onClick={() => removeService(service)}
                      disabled={isSubmitting}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Agregar servicio personalizado */}
          <div className='flex gap-2'>
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder='Agregar servicio personalizado...'
              disabled={isSubmitting}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addService()
                }
              }}
            />
            <Button
              type='button'
              variant='outline'
              onClick={addService}
              disabled={isSubmitting || !newService.trim()}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          {/* Servicios comunes */}
          <div className='space-y-2'>
            <Label>Servicios comunes:</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {COMMON_CLINIC_SERVICES.map((service) => (
                <Button
                  key={service}
                  type='button'
                  variant={
                    formData.services.includes(service) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => addServiceFromList(service)}
                  disabled={isSubmitting || formData.services.includes(service)}
                  className='justify-start'
                >
                  {formData.services.includes(service) && (
                    <CheckCircle className='h-3 w-3 mr-1' />
                  )}
                  {service}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenidades */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Amenidades e Instalaciones
          </CardTitle>
          <CardDescription>
            Selecciona las amenidades disponibles en la clínica
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Amenidades seleccionadas */}
          {formData.amenities.length > 0 && (
            <div className='space-y-2'>
              <Label>Amenidades seleccionadas:</Label>
              <div className='flex flex-wrap gap-2'>
                {formData.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant='outline'
                    className='flex items-center gap-1'
                  >
                    {amenity}
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 ml-1'
                      onClick={() => removeAmenity(amenity)}
                      disabled={isSubmitting}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Agregar amenidad personalizada */}
          <div className='flex gap-2'>
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder='Agregar amenidad personalizada...'
              disabled={isSubmitting}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAmenity()
                }
              }}
            />
            <Button
              type='button'
              variant='outline'
              onClick={addAmenity}
              disabled={isSubmitting || !newAmenity.trim()}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          {/* Amenidades comunes */}
          <div className='space-y-2'>
            <Label>Amenidades comunes:</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {COMMON_CLINIC_AMENITIES.map((amenity) => (
                <Button
                  key={amenity}
                  type='button'
                  variant={
                    formData.amenities.includes(amenity) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => addAmenityFromList(amenity)}
                  disabled={
                    isSubmitting || formData.amenities.includes(amenity)
                  }
                  className='justify-start'
                >
                  {formData.amenities.includes(amenity) && (
                    <CheckCircle className='h-3 w-3 mr-1' />
                  )}
                  {amenity}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card>
        <CardContent className='pt-6'>
          {/* Error de envío */}
          {errors.submit && (
            <Alert variant='destructive' className='mb-6'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Navegación por pestañas */}
          <div className='flex space-x-1 mb-6 bg-muted p-1 rounded-lg'>
            <Button
              type='button'
              variant={activeTab === 'basic' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab('basic')}
              className='flex-1'
            >
              <Building2 className='h-4 w-4 mr-2' />
              Información Básica
            </Button>
            <Button
              type='button'
              variant={activeTab === 'hours' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab('hours')}
              className='flex-1'
            >
              <Clock className='h-4 w-4 mr-2' />
              Horarios
            </Button>
            <Button
              type='button'
              variant={activeTab === 'services' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab('services')}
              className='flex-1'
            >
              <Heart className='h-4 w-4 mr-2' />
              Servicios
            </Button>
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'hours' && renderWorkingHours()}
          {activeTab === 'services' && renderServicesAndAmenities()}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className='flex justify-end space-x-2'>
        <Button
          type='button'
          variant='outline'
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {clinic ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              <CheckCircle className='mr-2 h-4 w-4' />
              {clinic ? 'Actualizar Clínica' : 'Crear Clínica'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
