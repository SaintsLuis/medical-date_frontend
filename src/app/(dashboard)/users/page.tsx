'use client'

import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { UsersManagement } from '@/features/users'

export default function UsersPage() {
  return (
    <AdminOnlyRoute>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Usuarios del Sistema
          </h1>
          <p className='text-muted-foreground'>
            Vista general de todos los usuarios registrados (administradores,
            doctores, pacientes y secretarias)
          </p>
        </div>

        <UsersManagement />
      </div>
    </AdminOnlyRoute>
  )
}
