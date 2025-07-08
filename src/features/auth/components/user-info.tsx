'use client'

import { useAuthStore } from '@/features/auth/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRole } from '@/types/auth'

export function UserInfo() {
  const { user, logout } = useAuthStore()

  if (!user) return null

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800'
      case UserRole.DOCTOR:
        return 'bg-green-100 text-green-800'
      case UserRole.PATIENT:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (role: UserRole) => {
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

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Información del Usuario</span>
          <Button variant='outline' size='sm' onClick={logout}>
            Cerrar Sesión
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>Nombre:</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>Email:</span>
            <span>{user.email}</span>
          </div>
          {user.phoneNumber && (
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Teléfono:</span>
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <span className='font-medium'>Roles:</span>
          <div className='flex flex-wrap gap-2'>
            {user.roles.map((role) => (
              <Badge key={role} className={getRoleColor(role)}>
                {getRoleName(role)}
              </Badge>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <span className='font-medium'>Estado:</span>
          <div className='flex items-center gap-2'>
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        <div className='text-xs text-muted-foreground border-t pt-2'>
          <div>ID: {user.id}</div>
          <div>Creado: {new Date(user.createdAt).toLocaleDateString()}</div>
          <div>
            Actualizado: {new Date(user.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
