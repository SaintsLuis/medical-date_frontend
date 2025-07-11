import { Suspense } from 'react'
import { ClinicsManagement, ClinicsSkeletion } from '@/features/clinics'

function ClinicsSkeletonWrapper() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-48 bg-muted rounded animate-pulse' />
          <div className='h-4 w-72 bg-muted rounded animate-pulse' />
        </div>
        <div className='h-10 w-32 bg-muted rounded animate-pulse' />
      </div>
      <ClinicsSkeletion />
    </div>
  )
}

export default function ClinicsPage() {
  return (
    <Suspense fallback={<ClinicsSkeletonWrapper />}>
      <ClinicsManagement />
    </Suspense>
  )
}
