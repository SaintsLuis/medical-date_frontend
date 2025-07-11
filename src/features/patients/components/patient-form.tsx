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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Phone,
  MapPin,
  Droplets,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Mail,
  Shield,
  Heart,
  Info,
} from 'lucide-react'
import { useUpdatePatient } from '../hooks/use-patients'
import type { Patient, UpdatePatientData, PatientFormData } from '../types'
import { BLOOD_TYPES, formatBloodType } from '../types'

interface PatientFormProps {
  patient: Patient
  onSuccess?: (patient: Patient) => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function PatientForm({
  patient,
  onSuccess,
  onCancel,
  title = 'Editar Paciente',
  description = 'Actualiza la información médica del paciente',
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    address: '',
    emergencyContact: '',
    bloodType: 'O_POSITIVE',
    allergies: [],
  })
  const [newAllergy, setNewAllergy] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateMutation = useUpdatePatient()

  // Inicializar formulario con datos del paciente
  useEffect(() => {
    if (patient) {
      setFormData({
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        bloodType: patient.bloodType || 'O_POSITIVE',
        allergies: patient.allergies || [],
      })
    }
  }, [patient])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'El contacto de emergencia es requerido'
    }

    if (!formData.bloodType) {
      newErrors.bloodType = 'El tipo de sangre es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleBloodTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      bloodType: value as
        | 'A_POSITIVE'
        | 'A_NEGATIVE'
        | 'B_POSITIVE'
        | 'B_NEGATIVE'
        | 'AB_POSITIVE'
        | 'AB_NEGATIVE'
        | 'O_POSITIVE'
        | 'O_NEGATIVE',
    }))
    if (errors.bloodType) {
      setErrors((prev) => ({ ...prev, bloodType: '' }))
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }))
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAllergy()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const updateData: UpdatePatientData = {
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      bloodType: formData.bloodType,
      allergies: formData.allergies,
    }

    updateMutation.mutate(
      { id: patient.id, data: updateData },
      {
        onSuccess: (result) => {
          if (result.success && result.data) {
            onSuccess?.(result.data)
          }
        },
      }
    )
  }

  const handleCancel = () => {
    onCancel?.()
  }

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6'>
      {/* Header con información del paciente */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200'>
        <div className='flex items-center gap-4'>
          <div className='h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center'>
            <User className='h-8 w-8 text-blue-600' />
          </div>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {patient.user.firstName} {patient.user.lastName}
            </h2>
            <p className='text-gray-600'>ID: {patient.id}</p>
            <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>{patient.age} años</span>
              </div>
              <div className='flex items-center gap-1'>
                <Heart className='h-4 w-4' />
                <span>{formatBloodType(patient.bloodType)}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Mail className='h-4 w-4' />
                <span>{patient.user.email}</span>
              </div>
            </div>
          </div>
          <div className='text-right'>
            <Badge variant={patient.user.isActive ? 'default' : 'secondary'}>
              {patient.user.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <Card className='border-0 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 border-b'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Shield className='h-6 w-6 text-blue-600' />
            {title}
          </CardTitle>
          <CardDescription className='text-gray-600'>
            {description}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className='p-6 space-y-8'>
            {/* Información médica editable */}
            <div className='space-y-6'>
              <div className='flex items-center gap-2 pb-2 border-b border-gray-200'>
                <Info className='h-5 w-5 text-blue-600' />
                <h3 className='text-lg font-semibold text-gray-900'>
                  Información Médica
                </h3>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                {/* Dirección */}
                <div className='space-y-3'>
                  <Label
                    htmlFor='address'
                    className='flex items-center gap-2 text-sm font-medium'
                  >
                    <MapPin className='h-4 w-4 text-blue-600' />
                    Dirección
                  </Label>
                  <Textarea
                    id='address'
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    placeholder='Ingrese la dirección completa del paciente'
                    className={`min-h-[80px] resize-none ${
                      errors.address
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                  />
                  {errors.address && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Contacto de emergencia */}
                <div className='space-y-3'>
                  <Label
                    htmlFor='emergencyContact'
                    className='flex items-center gap-2 text-sm font-medium'
                  >
                    <Phone className='h-4 w-4 text-red-600' />
                    Contacto de Emergencia
                  </Label>
                  <Input
                    id='emergencyContact'
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange('emergencyContact', e.target.value)
                    }
                    placeholder='Nombre y teléfono del contacto de emergencia'
                    className={
                      errors.emergencyContact
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {errors.emergencyContact && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.emergencyContact}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                {/* Tipo de sangre */}
                <div className='space-y-3'>
                  <Label
                    htmlFor='bloodType'
                    className='flex items-center gap-2 text-sm font-medium'
                  >
                    <Droplets className='h-4 w-4 text-red-600' />
                    Tipo de Sangre
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={handleBloodTypeChange}
                  >
                    <SelectTrigger
                      className={
                        errors.bloodType
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
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
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.bloodType}
                    </p>
                  )}
                </div>

                {/* Alergias */}
                <div className='space-y-3'>
                  <Label className='flex items-center gap-2 text-sm font-medium'>
                    <AlertTriangle className='h-4 w-4 text-orange-600' />
                    Alergias
                  </Label>

                  {/* Lista de alergias existentes */}
                  {formData.allergies.length > 0 && (
                    <div className='flex flex-wrap gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200'>
                      {formData.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='flex items-center gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200'
                        >
                          {allergy}
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-4 w-4 p-0 hover:bg-orange-300 hover:text-orange-900'
                            onClick={() => removeAllergy(index)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Agregar nueva alergia */}
                  <div className='flex gap-2'>
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Agregar nueva alergia'
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addAllergy}
                      disabled={!newAllergy.trim()}
                      className='px-4'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes de error */}
            {updateMutation.error && (
              <Alert variant='destructive' className='border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-red-800'>
                  Error al actualizar paciente. Inténtalo de nuevo.
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className='flex justify-end gap-3 pt-6 border-t border-gray-200'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className='px-6'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={updateMutation.isPending}
                className='px-6 bg-blue-600 hover:bg-blue-700'
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Paciente'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
