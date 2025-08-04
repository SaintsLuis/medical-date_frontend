'use client'

import React from 'react'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  User as UserIcon,
  Shield,
  Stethoscope,
  Heart,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { userFormSchema, UserFormData, User as UserType } from '../types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUpdateUser } from '../hooks/use-users'

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
  const updateUser = useUpdateUser()

  // React Hook Form setup
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive,
      otpEnabled: user.otpEnabled,
    },
  })

  const {
    register,
    formState: { errors },
    reset,
  } = form

  // Resetear formulario cuando cambia el usuario
  // (por si se reusa el componente para otro usuario)
  React.useEffect(() => {
    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive,
      otpEnabled: user.otpEnabled,
    })
  }, [user, reset])

  // Submit handler
  const onSubmit = async (data: UserFormData) => {
    try {
      const result = await updateUser.mutateAsync({
        id: user.id,
        data,
      })
      if (result.success && result.data) {
        toast.success('Usuario actualizado exitosamente')
        onSuccess?.(result.data)
      } else {
        toast.error(result.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error inesperado'
      toast.error(errorMessage)
    }
  }

  // Debug logs
  React.useEffect(() => {
    console.log('=== DEBUG FORM STATE ===')
    console.log('isDirty:', form.formState.isDirty)
    console.log('isValid:', form.formState.isValid)
    console.log('isPending:', updateUser.isPending)
    console.log('Current values:', form.watch())
    console.log('Initial values:', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive,
      otpEnabled: user.otpEnabled,
    })
    console.log('Form errors:', form.formState.errors)
    console.log(
      'Button disabled:',
      updateUser.isPending || !form.formState.isValid || !form.formState.isDirty
    )
    console.log('=======================')
  }, [
    form.formState.isDirty,
    form.formState.isValid,
    form.formState.errors,
    updateUser.isPending,
    form.watch(),
    user,
  ])

  // Cancel handler
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

  // Formatear número de teléfono para mostrar
  const formatPhoneNumber = (value: string) => {
    if (!value) return value

    // Remover todos los caracteres no numéricos
    const cleanNumber = value.replace(/\D/g, '')

    // Si tiene 10 dígitos, formatear como (809) 123-4567
    if (cleanNumber.length === 10) {
      return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(
        3,
        6
      )}-${cleanNumber.slice(6)}`
    }

    // Si tiene menos de 10 dígitos, mostrar como está
    return cleanNumber
  }

  // Obtener solo dígitos del número de teléfono
  const getCleanPhoneNumber = (value: string) => {
    if (!value) return ''
    return value.replace(/\D/g, '')
  }

  // ==============================================
  // Render
  // ==============================================

  return (
    <div className='space-y-6 pb-4'>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Información básica */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Información Personal</h3>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>Nombre *</Label>
                  <Input
                    id='firstName'
                    {...register('firstName')}
                    placeholder='Juan'
                    className={errors.firstName ? 'border-red-500' : ''}
                    disabled={updateUser.isPending}
                  />
                  {errors.firstName && (
                    <p className='text-sm text-red-600'>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Apellido *</Label>
                  <Input
                    id='lastName'
                    {...register('lastName')}
                    placeholder='Pérez'
                    className={errors.lastName ? 'border-red-500' : ''}
                    disabled={updateUser.isPending}
                  />
                  {errors.lastName && (
                    <p className='text-sm text-red-600'>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Correo Electrónico *</Label>
                <Input
                  id='email'
                  type='email'
                  {...register('email')}
                  placeholder='usuario@ejemplo.com'
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={updateUser.isPending}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phoneNumber'>Teléfono</Label>
                <Input
                  id='phoneNumber'
                  type='tel'
                  value={formatPhoneNumber(form.watch('phoneNumber') || '')}
                  onChange={(e) => {
                    const cleanValue = getCleanPhoneNumber(e.target.value)
                    form.setValue('phoneNumber', cleanValue)
                  }}
                  placeholder='8291234567'
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  disabled={updateUser.isPending}
                />
                {errors.phoneNumber && (
                  <p className='text-sm text-red-600'>
                    {errors.phoneNumber.message}
                  </p>
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
                  <input
                    type='checkbox'
                    id='isActive'
                    {...register('isActive')}
                    checked={form.watch('isActive')}
                    onChange={(e) =>
                      form.setValue('isActive', e.target.checked)
                    }
                    disabled={updateUser.isPending}
                    className='h-5 w-5 accent-blue-600 rounded border-gray-300'
                  />
                </div>

                {/* <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='otpEnabled'>
                      Autenticación de dos factores
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Habilitar verificación OTP para mayor seguridad
                    </p>
                  </div>
                  <input
                    type='checkbox'
                    id='otpEnabled'
                    {...register('otpEnabled')}
                    checked={form.watch('otpEnabled')}
                    onChange={(e) =>
                      form.setValue('otpEnabled', e.target.checked)
                    }
                    disabled={updateUser.isPending}
                    className='h-5 w-5 accent-blue-600 rounded border-gray-300'
                  />
                </div> */}
              </div>
            </div>

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
              <Button
                type='submit'
                disabled={updateUser.isPending || !form.formState.isValid}
              >
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
