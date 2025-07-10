'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUpdateUser } from '../hooks/use-users'
import type { User as UserType, UpdateUserData } from '../types'
import {
  User as UserIcon,
  Shield,
  Stethoscope,
  Heart,
  Save,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'

// ==============================================
// Interfaces
// ==============================================

interface UserFormProps {
  user: UserType
  onSuccess?: (user: UserType) => void
  onCancel?: () => void
  title?: string
  description?: string
}

// ==============================================
// Componente Principal
// ==============================================

export function UserForm({
  user,
  onSuccess,
  onCancel,
  title = 'Editar Usuario',
  description = 'Actualiza la información básica del usuario',
}: UserFormProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber || '',
    isActive: user.isActive,
    otpEnabled: user.otpEnabled,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const updateUser = useUpdateUser()

  // ==============================================
  // Validación
  // ==============================================

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar email
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    // Validar nombre
    if (!formData.firstName || formData.firstName.trim() === '') {
      newErrors.firstName = 'El nombre es requerido'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar apellido
    if (!formData.lastName || formData.lastName.trim() === '') {
      newErrors.lastName = 'El apellido es requerido'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres'
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phoneNumber = 'El número de teléfono no es válido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ==============================================
  // Handlers
  // ==============================================

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await updateUser.mutateAsync({
        id: user.id,
        data: formData,
      })

      if (result.success && result.data) {
        onSuccess?.(result.data)
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  // ==============================================
  // Helpers para UI
  // ==============================================

  const getRoleIcon = (roles: Array<{ roleName: string }>) => {
    const roleNames = roles.map((role) => role.roleName.toLowerCase())
    if (roleNames.includes('admin')) return <Shield className='h-4 w-4' />
    if (roleNames.includes('doctor')) return <Stethoscope className='h-4 w-4' />
    return <Heart className='h-4 w-4' />
  }

  const getRoleColor = (roles: Array<{ roleName: string }>) => {
    const roleNames = roles.map((role) => role.roleName.toLowerCase())
    if (roleNames.includes('admin')) return 'bg-red-100 text-red-800'
    if (roleNames.includes('doctor')) return 'bg-green-100 text-green-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getRoleText = (roles: Array<{ roleName: string }>) => {
    const roleNames = roles.map((role) => role.roleName.toLowerCase())
    if (roleNames.includes('admin')) return 'Administrador'
    if (roleNames.includes('doctor')) return 'Doctor'
    if (roleNames.includes('patient')) return 'Paciente'
    return roleNames.join(', ')
  }

  // ==============================================
  // Render
  // ==============================================

  return (
    <div className='space-y-6'>
      {/* Información del usuario actual */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5' />
            Información del Usuario
          </CardTitle>
          <CardDescription>
            Datos actuales del usuario en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Nombre Completo
              </Label>
              <p className='text-sm'>
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Email
              </Label>
              <p className='text-sm'>{user.email}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Roles
              </Label>
              <div className='flex flex-wrap gap-1 mt-1'>
                <Badge className={getRoleColor(user.roles)}>
                  <div className='flex items-center gap-1'>
                    {getRoleIcon(user.roles)}
                    {getRoleText(user.roles)}
                  </div>
                </Badge>
              </div>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Estado
              </Label>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Información básica */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Información Personal</h3>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>Nombre *</Label>
                  <Input
                    id='firstName'
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    placeholder='Juan'
                    className={errors.firstName ? 'border-red-500' : ''}
                    disabled={updateUser.isPending}
                  />
                  {errors.firstName && (
                    <p className='text-sm text-red-600'>{errors.firstName}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Apellido *</Label>
                  <Input
                    id='lastName'
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    placeholder='Pérez'
                    className={errors.lastName ? 'border-red-500' : ''}
                    disabled={updateUser.isPending}
                  />
                  {errors.lastName && (
                    <p className='text-sm text-red-600'>{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Correo Electrónico *</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder='usuario@ejemplo.com'
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={updateUser.isPending}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phoneNumber'>Teléfono</Label>
                <Input
                  id='phoneNumber'
                  type='tel'
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  placeholder='+1 (555) 123-4567'
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  disabled={updateUser.isPending}
                />
                {errors.phoneNumber && (
                  <p className='text-sm text-red-600'>{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Configuración de cuenta */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Configuración de Cuenta</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='isActive'>Estado de la cuenta</Label>
                    <p className='text-sm text-muted-foreground'>
                      Activar o desactivar el acceso del usuario al sistema
                    </p>
                  </div>
                  <Switch
                    id='isActive'
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange('isActive', checked)
                    }
                    disabled={updateUser.isPending}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='otpEnabled'>
                      Autenticación de dos factores
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Habilitar verificación OTP para mayor seguridad
                    </p>
                  </div>
                  <Switch
                    id='otpEnabled'
                    checked={formData.otpEnabled}
                    onCheckedChange={(checked) =>
                      handleInputChange('otpEnabled', checked)
                    }
                    disabled={updateUser.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Mensajes de error */}
            {updateUser.error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Error al actualizar usuario: {updateUser.error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={updateUser.isPending}
              >
                <X className='mr-2 h-4 w-4' />
                Cancelar
              </Button>
              <Button type='submit' disabled={updateUser.isPending}>
                {updateUser.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Actualizar Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
