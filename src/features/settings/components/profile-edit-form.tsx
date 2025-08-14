'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Building2,
  Globe,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  Languages,
} from 'lucide-react'
import { BackendUser, UserRole } from '@/types/auth'
import {
  updateUserProfileAction,
  updateDoctorProfileAction,
} from '../actions/profile-actions'

interface ProfileEditFormProps {
  userData: BackendUser
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileEditForm({
  userData,
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  console.log('🔍 ProfileEditForm - userData:', userData)
  console.log('🔍 Full doctorProfile object:', userData.doctorProfile)

  // Detailed logging of doctor profile structure
  if (userData.doctorProfile) {
    console.log('🔍 Doctor profile keys:', Object.keys(userData.doctorProfile))
    console.log(
      '🔍 All doctor profile values:',
      Object.entries(userData.doctorProfile)
    )
  }

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Estados para los diferentes tipos de formularios
  const [basicInfo, setBasicInfo] = useState({
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    phoneNumber: userData.phoneNumber || '',
  })

  const [doctorInfo, setDoctorInfo] = useState({
    bio: userData.doctorProfile?.bio || '',
    consultationFee: userData.doctorProfile?.consultationFee
      ? parseFloat(userData.doctorProfile.consultationFee.toString())
      : 0,
    experience: userData.doctorProfile?.experience || 0,
    publicPhone: userData.doctorProfile?.phone || '',
    address: userData.doctorProfile?.address || '',
    timeZone: userData.doctorProfile?.timeZone || 'America/Santo_Domingo',
    meetingLink: userData.doctorProfile?.meetingLink || '',
    languages: userData.doctorProfile?.languages || [],
    education: userData.doctorProfile?.education || [],
  })

  const isDoctorUser = userData.roles.includes(UserRole.DOCTOR)
  const isSecretaryUser = userData.roles.includes(UserRole.SECRETARY)

  console.log('🔍 Role check:', {
    userRoles: userData.roles,
    UserRole_DOCTOR: UserRole.DOCTOR,
    isDoctorUser,
    doctorProfileExists: !!userData.doctorProfile,
    doctorProfileId: userData.doctorProfile?.id,
  })

  const handleBasicInfoChange = (field: string, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleDoctorInfoChange = (
    field: string,
    value: string | number | string[]
  ) => {
    setDoctorInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayFieldChange = (
    field: 'languages' | 'education',
    value: string
  ) => {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    setDoctorInfo((prev) => ({ ...prev, [field]: items }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔄 Form submission started')
      console.log('📊 User roles:', userData.roles)
      console.log('🩺 Is doctor user:', isDoctorUser)
      console.log('📋 Basic info:', basicInfo)
      console.log('🔬 Doctor info:', doctorInfo)
      console.log('🆔 Doctor profile ID:', userData.doctorProfile?.id)

      // Actualizar información básica del usuario
      const userUpdateResult = await updateUserProfileAction(
        userData.id,
        basicInfo
      )

      if (!userUpdateResult.success) {
        throw new Error(
          userUpdateResult.error || 'Error actualizando información básica'
        )
      }

      console.log('✅ User update successful')

      // Si es doctor, actualizar perfil de doctor
      if (isDoctorUser && userData.doctorProfile) {
        console.log('🔄 Starting doctor profile update...')
        console.log('🔍 Using user ID for doctor update:', userData.id)
        console.log('🔍 Doctor data to send:', doctorInfo)

        const doctorUpdateResult = await updateDoctorProfileAction(
          userData.id, // El backend ahora maneja el fallback automáticamente
          doctorInfo
        )

        if (!doctorUpdateResult.success) {
          throw new Error(
            doctorUpdateResult.error || 'Error actualizando perfil de doctor'
          )
        }

        console.log('✅ Doctor profile update successful')
      } else {
        console.log('⚠️ Skipping doctor update:', {
          isDoctorUser,
          hasDoctorProfile: !!userData.doctorProfile,
          doctorProfileId: userData.doctorProfile?.id,
        })
      }

      // Si es secretaria, actualizar perfil de secretaria
      if (isSecretaryUser) {
        // Encontrar el ID de secretaria desde los datos del usuario
        // Para esto necesitaríamos que el backend incluya el secretaryProfile en la respuesta
        // Por ahora solo mostramos un mensaje
        console.log('Secretary profile update - Implementation pending')
      }

      setSuccess('Perfil actualizado exitosamente')
      if (onSuccess) {
        onSuccess()
      }

      // Recargar la página para reflejar los cambios
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Información Personal
          </CardTitle>
          <CardDescription>
            Actualiza tu información básica de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>Nombre</Label>
              <Input
                id='firstName'
                value={basicInfo.firstName}
                onChange={(e) =>
                  handleBasicInfoChange('firstName', e.target.value)
                }
                placeholder='Tu nombre'
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Apellido</Label>
              <Input
                id='lastName'
                value={basicInfo.lastName}
                onChange={(e) =>
                  handleBasicInfoChange('lastName', e.target.value)
                }
                placeholder='Tu apellido'
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phoneNumber'>Teléfono</Label>
            <div className='relative'>
              <Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                id='phoneNumber'
                value={basicInfo.phoneNumber}
                onChange={(e) =>
                  handleBasicInfoChange('phoneNumber', e.target.value)
                }
                placeholder='+18291234567'
                className='pl-10'
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                value={userData.email}
                className='pl-10 bg-muted'
                disabled
                readOnly
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              El email no se puede cambiar por razones de seguridad
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información de Doctor */}
      {isDoctorUser && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Stethoscope className='h-5 w-5' />
              Información Profesional
            </CardTitle>
            <CardDescription>
              Actualiza tu información médica profesional
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='bio'>Biografía</Label>
              <Textarea
                id='bio'
                value={doctorInfo.bio}
                onChange={(e) => handleDoctorInfoChange('bio', e.target.value)}
                placeholder='Describe tu experiencia y especialidades...'
                className='min-h-[100px]'
                disabled={isLoading}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='consultationFee'>
                  Tarifa de Consulta (RD$)
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='consultationFee'
                    type='number'
                    value={doctorInfo.consultationFee}
                    onChange={(e) =>
                      handleDoctorInfoChange(
                        'consultationFee',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder='0'
                    className='pl-10'
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='experience'>Años de Experiencia</Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='experience'
                    type='number'
                    value={doctorInfo.experience}
                    onChange={(e) =>
                      handleDoctorInfoChange(
                        'experience',
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder='0'
                    className='pl-10'
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='publicPhone'>Teléfono Público</Label>
              <div className='relative'>
                <Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='publicPhone'
                  value={doctorInfo.publicPhone}
                  onChange={(e) =>
                    handleDoctorInfoChange('publicPhone', e.target.value)
                  }
                  placeholder='+18291234567'
                  className='pl-10'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Dirección del Consultorio</Label>
              <div className='relative'>
                <MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='address'
                  value={doctorInfo.address}
                  onChange={(e) =>
                    handleDoctorInfoChange('address', e.target.value)
                  }
                  placeholder='Dirección de tu consultorio'
                  className='pl-10'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='meetingLink'>Enlace de Google Meet</Label>
              <div className='relative'>
                <Globe className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='meetingLink'
                  value={doctorInfo.meetingLink}
                  onChange={(e) =>
                    handleDoctorInfoChange('meetingLink', e.target.value)
                  }
                  placeholder='https://meet.google.com/...'
                  className='pl-10'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='timeZone'>Zona Horaria</Label>
              <Select
                value={doctorInfo.timeZone}
                onValueChange={(value) =>
                  handleDoctorInfoChange('timeZone', value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar zona horaria' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='America/Santo_Domingo'>
                    República Dominicana (UTC-4)
                  </SelectItem>
                  <SelectItem value='America/New_York'>
                    Eastern Time (UTC-5)
                  </SelectItem>
                  <SelectItem value='America/Chicago'>
                    Central Time (UTC-6)
                  </SelectItem>
                  <SelectItem value='America/Denver'>
                    Mountain Time (UTC-7)
                  </SelectItem>
                  <SelectItem value='America/Los_Angeles'>
                    Pacific Time (UTC-8)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='languages'>Idiomas (separados por comas)</Label>
              <div className='relative'>
                <Languages className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='languages'
                  value={doctorInfo.languages.join(', ')}
                  onChange={(e) =>
                    handleArrayFieldChange('languages', e.target.value)
                  }
                  placeholder='Español, Inglés, Francés'
                  className='pl-10'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='education'>Educación (separada por comas)</Label>
              <div className='relative'>
                <BookOpen className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Textarea
                  id='education'
                  value={doctorInfo.education.join(', ')}
                  onChange={(e) =>
                    handleArrayFieldChange('education', e.target.value)
                  }
                  placeholder='Universidad Nacional - Medicina, Especialización en Cardiología'
                  className='pl-10 min-h-[80px]'
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Roles */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Roles y Permisos
          </CardTitle>
          <CardDescription>
            Información sobre tus roles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <Label>Roles Asignados</Label>
            <div className='flex flex-wrap gap-2'>
              {userData.roles.map((role) => (
                <Badge key={role} variant='outline'>
                  {role === UserRole.DOCTOR && (
                    <Stethoscope className='mr-1 h-3 w-3' />
                  )}
                  {role === UserRole.ADMIN && (
                    <Award className='mr-1 h-3 w-3' />
                  )}
                  {role === UserRole.SECRETARY && (
                    <Building2 className='mr-1 h-3 w-3' />
                  )}
                  {role === UserRole.PATIENT && (
                    <User className='mr-1 h-3 w-3' />
                  )}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>
            <p className='text-xs text-muted-foreground'>
              Los roles solo pueden ser modificados por un administrador
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de Estado */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de Acción */}
      <div className='flex justify-end space-x-4'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Guardando...
            </>
          ) : (
            <>
              <Save className='mr-2 h-4 w-4' />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
