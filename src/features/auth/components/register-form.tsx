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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

interface RegisterFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function RegisterForm({ onSuccess, onCancel }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: UserRole.PATIENT,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  //const { register } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // await register(formData)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: UserRole.PATIENT,
      })
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrar usuario'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl text-center'>
          Registrar Usuario
        </CardTitle>
        <CardDescription className='text-center'>
          Crear una nueva cuenta de usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>Nombre</Label>
            <Input
              id='firstName'
              type='text'
              placeholder='Juan'
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName'>Apellido</Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Pérez'
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Correo Electrónico</Label>
            <Input
              id='email'
              type='email'
              placeholder='correo@ejemplo.com'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phoneNumber'>Teléfono</Label>
            <Input
              id='phoneNumber'
              type='tel'
              placeholder='+1 (555) 123-4567'
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              type='password'
              placeholder='Contraseña segura'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar rol' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.PATIENT}>Paciente</SelectItem>
                <SelectItem value={UserRole.DOCTOR}>Doctor</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className='text-red-500 text-sm text-center'>{error}</div>
          )}

          <div className='flex gap-2'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                className='flex-1'
              >
                Cancelar
              </Button>
            )}
            <Button type='submit' className='flex-1' disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Usuario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
