'use client'

import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/login-form'
import { useCacheInvalidation } from '@/hooks/use-cache-invalidation'

function LoginPageContent() {
  // Hook para limpiar caché si viene del logout
  useCacheInvalidation()

  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
            <p className='text-sm text-muted-foreground'>Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
