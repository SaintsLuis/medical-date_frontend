import { Suspense } from 'react'
import { UsersManagement } from '@/features/users'
import { UsersSkeleton } from '@/features/users/components/users-skeleton'

// ==============================================
// Componente de Loading
// ==============================================

function UsersSkeletonWrapper() {
  return <UsersSkeleton />
}

// ==============================================
// Página Principal
// ==============================================

export default function UsersPage() {
  return (
    <div className='container mx-auto py-6'>
      <Suspense fallback={<UsersSkeletonWrapper />}>
        <UsersManagement />
      </Suspense>
    </div>
  )
}
