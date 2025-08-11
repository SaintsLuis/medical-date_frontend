'use client'

import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { SecretariesManagement } from '@/features/secretaries'

export default function SecretariesPage() {
  return (
    <AdminOnlyRoute>
      <div className='space-y-6'>
        <SecretariesManagement />
      </div>
    </AdminOnlyRoute>
  )
}
