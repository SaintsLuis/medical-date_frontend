import { Suspense } from 'react'
import { DoctorsManagement } from '@/features/doctors'
import { DoctorsSkeleton } from '@/features/doctors/components/doctors-skeleton'

// ==============================================
// Componente de Loading
// ==============================================

function DoctorsSkeletonWrapper() {
  return <DoctorsSkeleton />
}

// ==============================================
// Página Principal
// ==============================================

export default function DoctorsPage() {
  return (
    <div className='container mx-auto py-6'>
      <Suspense fallback={<DoctorsSkeletonWrapper />}>
        <DoctorsManagement />
      </Suspense>
    </div>
  )
}
