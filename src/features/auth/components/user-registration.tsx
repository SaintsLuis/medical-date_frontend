'use client'

import { useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth'
import { RegisterForm } from './register-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole, Permission } from '@/types/auth'

export function UserRegistration() {
  const [showForm, setShowForm] = useState(false)
  const { hasPermission, hasRole } = useAuthStore()

  // Solo mostrar para administradores
  if (!hasPermission(Permission.MANAGE_DOCTORS) && !hasRole(UserRole.ADMIN)) {
    return null
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Registro de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Como administrador, puedes crear nuevas cuentas de usuario para
              doctores, pacientes y otros administradores.
            </p>
            <Button onClick={() => setShowForm(true)}>
              Crear Nuevo Usuario
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <RegisterForm
              onSuccess={() => {
                setShowForm(false)
                // Aquí podrías mostrar un mensaje de éxito
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
