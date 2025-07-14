import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { SpecialtiesManagement } from '@/features/specialties/components/specialties-management'

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
    <AdminOnlyRoute>
      <SpecialtiesManagement />
    </AdminOnlyRoute>
  )
}
