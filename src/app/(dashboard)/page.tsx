'use client'

import { useAuthStore } from '@/features/auth/store/auth'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    console.log('Dashboard - Auth state:', { user, isAuthenticated, isLoading })
  }, [user, isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>No autenticado</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Bienvenido, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className='p-4 border rounded-lg'>
        <h2 className='text-lg font-semibold mb-2'>Información de Debug</h2>
        <pre className='text-sm bg-gray-100 p-2 rounded'>
          {JSON.stringify({ user, isAuthenticated, isLoading }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
