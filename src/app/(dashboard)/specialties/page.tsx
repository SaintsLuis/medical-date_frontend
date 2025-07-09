import { Suspense } from 'react'
import { SpecialtiesManagement } from '@/features/specialties/components/specialties-management'
import { SpecialtiesSkeleton } from '@/features/specialties'

// ===================================
// Page metadata
// ===================================

export const metadata = {
  title: 'Especialidades Médicas | Medical Date',
  description: 'Gestiona las especialidades médicas disponibles en el sistema',
}

// ===================================
// Main page component
// ===================================

export default function SpecialtiesPage() {
  return (
    <Suspense fallback={<SpecialtiesSkeleton />}>
      <SpecialtiesManagement />
    </Suspense>
  )
}
