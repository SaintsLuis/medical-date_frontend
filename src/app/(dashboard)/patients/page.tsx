import { Suspense } from 'react'
import { PatientsManagement } from '@/features/patients/components/patients-management'
import { PatientsSkeleton } from '@/features/patients/components/patients-skeleton'

export default function PatientsPage() {
  return (
    <div className='container mx-auto py-6'>
      <Suspense fallback={<PatientsSkeleton />}>
        <PatientsManagement />
      </Suspense>
    </div>
  )
}
