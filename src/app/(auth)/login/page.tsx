'use client'

import { LoginForm } from '@/features/auth/components/login-form'
import { useCacheInvalidation } from '@/hooks/use-cache-invalidation'

export default function LoginPage() {
  // Hook para limpiar caché si viene del logout
  useCacheInvalidation()

  return <LoginForm />
}
