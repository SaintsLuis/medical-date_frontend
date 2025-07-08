'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { loginAction } from '../actions/auth-actions'

import {
  Loader2,
  User,
  Shield,
  Stethoscope,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Heart,
} from 'lucide-react'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      userType: 'auto',
      rememberMe: false,
    },
  })

  const watchedUserType = watch('userType')

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await loginAction({
        email: data.email,
        password: data.password,
        userType: data.userType,
      })

      if (result && !result.success) {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className='h-4 w-4' />
      case 'doctor':
        return <Stethoscope className='h-4 w-4' />
      default:
        return <User className='h-4 w-4' />
    }
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin':
        return 'Administrador'
      case 'doctor':
        return 'Doctor'
      case 'auto':
        return 'Detectar automáticamente'
      default:
        return 'Seleccionar tipo'
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4'>
      <div className='w-full max-w-md'>
        {/* Logo y branding */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4'>
            <Heart className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Medical Date
          </h1>
          <p className='text-gray-600'>Plataforma de gestión médica integral</p>
        </div>

        {/* Formulario de login */}
        <Card className='shadow-xl border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-2xl font-bold text-center text-gray-900'>
              Iniciar Sesión
            </CardTitle>
            <p className='text-sm text-gray-600 text-center'>
              Acceda al panel de administración del sistema
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className='space-y-6'>
              {/* Mensaje de error */}
              {error && (
                <Alert
                  variant='destructive'
                  className='border-red-200 bg-red-50'
                >
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription className='text-red-800'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Tipo de usuario */}
              <div className='space-y-2'>
                <Label
                  htmlFor='userType'
                  className='text-sm font-medium text-gray-700'
                >
                  Tipo de Usuario
                </Label>
                <Select
                  value={watchedUserType}
                  onValueChange={(value) =>
                    setValue('userType', value as 'admin' | 'doctor' | 'auto')
                  }
                >
                  <SelectTrigger className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                    <SelectValue>
                      <div className='flex items-center gap-2'>
                        {getUserTypeIcon(watchedUserType)}
                        <span className='text-gray-900'>
                          {getUserTypeLabel(watchedUserType)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='auto'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        <span>Detectar automáticamente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='admin'>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-4 w-4' />
                        <span>Administrador</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='doctor'>
                      <div className='flex items-center gap-2'>
                        <Stethoscope className='h-4 w-4' />
                        <span>Doctor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.userType && (
                  <p className='text-sm text-red-600'>
                    {errors.userType.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Correo Electrónico
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    {...register('email')}
                    type='email'
                    placeholder='admin@medical-date.com'
                    className='h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  Contraseña
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    className='h-11 pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    disabled={isSubmitting}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-400' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-400' />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-sm text-red-600'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Recordar sesión */}
              <div className='flex items-center space-x-2'>
                <Checkbox
                  {...register('rememberMe')}
                  id='rememberMe'
                  className='border-gray-300 text-blue-600 focus:ring-blue-500'
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor='rememberMe'
                  className='text-sm text-gray-700 cursor-pointer'
                >
                  Mantener sesión iniciada
                </Label>
              </div>
            </CardContent>

            <CardFooter className='flex flex-col space-y-4'>
              <Button
                type='submit'
                className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors'
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Información de contacto */}
        <div className='mt-8 text-center'>
          <Separator className='my-4' />
          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>¿No tiene una cuenta?</p>
            <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
              <Building2 className='h-4 w-4' />
              <span>Contacte al administrador del sistema</span>
            </div>
            <p className='text-xs text-gray-500'>support@medical-date.com</p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-gray-500'>
            © 2025 Medical Date. Todos los derechos reservados.
          </p>
          <div className='flex justify-center gap-4 mt-2'>
            <Button variant='link' className='text-xs text-gray-500 p-0 h-auto'>
              Privacidad
            </Button>
            <Button variant='link' className='text-xs text-gray-500 p-0 h-auto'>
              Términos
            </Button>
            <Button variant='link' className='text-xs text-gray-500 p-0 h-auto'>
              Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
