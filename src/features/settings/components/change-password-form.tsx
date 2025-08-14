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
import {
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Lock,
  Shield,
} from 'lucide-react'
import { changePasswordAction } from '../actions/profile-actions'

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ChangePasswordForm({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const validatePasswords = () => {
    if (!passwords.currentPassword) {
      setError('La contraseña actual es requerida')
      return false
    }

    if (!passwords.newPassword) {
      setError('La nueva contraseña es requerida')
      return false
    }

    if (passwords.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      setError(
        'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
      )
      return false
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return false
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await changePasswordAction({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })

      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar la contraseña')
      }

      setSuccess('Contraseña cambiada exitosamente')

      // Limpiar el formulario
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    return strength
  }

  const renderPasswordStrength = () => {
    const strength = getPasswordStrength(passwords.newPassword)
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500',
    ]
    const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']

    if (!passwords.newPassword) return null

    return (
      <div className='space-y-1'>
        <div className='flex space-x-1'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i < strength ? colors[strength - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className='text-xs text-muted-foreground'>
          Fortaleza: {labels[strength - 1] || 'Muy débil'}
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Cambiar Contraseña
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Contraseña Actual */}
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Contraseña Actual</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                id='currentPassword'
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) =>
                  handleInputChange('currentPassword', e.target.value)
                }
                placeholder='Ingresa tu contraseña actual'
                className='pl-10 pr-10'
                disabled={isLoading}
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>Nueva Contraseña</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                id='newPassword'
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) =>
                  handleInputChange('newPassword', e.target.value)
                }
                placeholder='Ingresa tu nueva contraseña'
                className='pl-10 pr-10'
                disabled={isLoading}
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {renderPasswordStrength()}
            <p className='text-xs text-muted-foreground'>
              La contraseña debe tener al menos 6 caracteres, incluyendo
              mayúsculas, minúsculas y números
            </p>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirmar Nueva Contraseña</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                id='confirmPassword'
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder='Confirma tu nueva contraseña'
                className='pl-10 pr-10'
                disabled={isLoading}
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword && (
                <p className='text-xs text-red-600'>
                  Las contraseñas no coinciden
                </p>
              )}
          </div>

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
          <div className='flex justify-end space-x-4 pt-4'>
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
                  Cambiando...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
