'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  Calendar,
  LogOut,
  AlertCircle,
  Loader2,
  Building2,
  Heart,
} from 'lucide-react'
import { logoutAction } from '../actions/auth-actions'
import { BackendUser, UserRole } from '@/types/auth'

interface UserProfileProps {
  userData: BackendUser | null
}

export function UserProfile({ userData }: UserProfileProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError('')

    try {
      await logoutAction()
      // El logoutAction ya maneja el redirect
    } catch (error) {
      console.error('Logout error:', error)
      setError('Error al cerrar sesión. Inténtalo de nuevo.')
      setIsLoggingOut(false)
    }
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-500' />
            Error al cargar perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              No se pudo cargar la información del perfil. Por favor, intenta
              nuevamente.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => router.refresh()}
            className='mt-4'
            variant='outline'
          >
            Recargar página
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className='h-4 w-4' />
      case UserRole.DOCTOR:
        return <Stethoscope className='h-4 w-4' />
      case UserRole.PATIENT:
        return <Heart className='h-4 w-4' />
      default:
        return <User className='h-4 w-4' />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case UserRole.DOCTOR:
        return 'bg-green-100 text-green-800 border-green-200'
      case UserRole.PATIENT:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador'
      case UserRole.DOCTOR:
        return 'Doctor'
      case UserRole.PATIENT:
        return 'Paciente'
      default:
        return role
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-6'>
      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Información Personal</span>
            <Button
              onClick={handleLogout}
              variant='outline'
              size='sm'
              disabled={isLoggingOut}
              className='text-red-600 hover:text-red-700 hover:bg-red-50'
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className='mr-2 h-4 w-4' />
                  Cerrar Sesión
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Error de logout */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Avatar y información básica */}
          <div className='flex items-start space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage
                src={
                  userData.doctorProfile?.profilePhoto ||
                  userData.patientProfile?.profilePhoto
                }
                alt={`${userData.firstName} ${userData.lastName}`}
              />
              <AvatarFallback className='text-lg font-semibold'>
                {getInitials(userData.firstName, userData.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-2'>
              <div>
                <h3 className='text-xl font-semibold'>
                  {userData.firstName} {userData.lastName}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {userData.email}
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {userData.roles.map((role) => (
                  <Badge
                    key={role}
                    variant='outline'
                    className={`flex items-center gap-1 ${getRoleColor(role)}`}
                  >
                    {getRoleIcon(role)}
                    {getRoleName(role)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles de contacto */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <h4 className='font-medium text-sm text-muted-foreground uppercase tracking-wide'>
                Información de Contacto
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span>{userData.email}</span>
                </div>
                {userData.phoneNumber && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span>{userData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <h4 className='font-medium text-sm text-muted-foreground uppercase tracking-wide'>
                Información de Cuenta
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span>Miembro desde: {formatDate(userData.createdAt)}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                    {userData.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Información específica del rol */}
          {userData.doctorProfile && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h4 className='font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                  <Stethoscope className='h-4 w-4' />
                  Información Profesional
                </h4>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <div className='text-sm'>
                      <span className='font-medium'>Licencia:</span>{' '}
                      {userData.doctorProfile.license}
                    </div>
                    {userData.doctorProfile.consultationFee && (
                      <div className='text-sm'>
                        <span className='font-medium'>Tarifa de consulta:</span>{' '}
                        ${userData.doctorProfile.consultationFee}
                      </div>
                    )}
                    {userData.doctorProfile.experience && (
                      <div className='text-sm'>
                        <span className='font-medium'>
                          Años de experiencia:
                        </span>{' '}
                        {userData.doctorProfile.experience}
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    {userData.doctorProfile.specialties &&
                      userData.doctorProfile.specialties.length > 0 && (
                        <div className='text-sm'>
                          <span className='font-medium'>Especialidades:</span>
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {userData.doctorProfile.specialties.map(
                              (specialty) => (
                                <Badge
                                  key={specialty.specialtyId}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {specialty.specialty.name}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}

          {userData.patientProfile && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h4 className='font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                  <Heart className='h-4 w-4' />
                  Información Médica
                </h4>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    {userData.patientProfile.bloodType && (
                      <div className='text-sm'>
                        <span className='font-medium'>Tipo de sangre:</span>{' '}
                        {userData.patientProfile.bloodType}
                      </div>
                    )}
                    {userData.patientProfile.gender && (
                      <div className='text-sm'>
                        <span className='font-medium'>Género:</span>{' '}
                        {userData.patientProfile.gender === 'MALE'
                          ? 'Masculino'
                          : userData.patientProfile.gender === 'FEMALE'
                          ? 'Femenino'
                          : 'Otro'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    {userData.patientProfile.allergies &&
                      userData.patientProfile.allergies.length > 0 && (
                        <div className='text-sm'>
                          <span className='font-medium'>Alergias:</span>
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {userData.patientProfile.allergies.map(
                              (allergy, index) => (
                                <Badge
                                  key={index}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {allergy}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 text-sm'>
            <div>
              <span className='font-medium'>ID de Usuario:</span>
              <p className='text-muted-foreground font-mono text-xs mt-1'>
                {userData.id}
              </p>
            </div>
            <div>
              <span className='font-medium'>Última actualización:</span>
              <p className='text-muted-foreground mt-1'>
                {formatDate(userData.updatedAt)}
              </p>
            </div>
            {userData.lastLoginAt && (
              <div>
                <span className='font-medium'>Último acceso:</span>
                <p className='text-muted-foreground mt-1'>
                  {formatDate(userData.lastLoginAt)}
                </p>
              </div>
            )}
            <div>
              <span className='font-medium'>Verificación de email:</span>
              <p className='text-muted-foreground mt-1'>
                {userData.emailVerified ? 'Verificado' : 'Pendiente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
