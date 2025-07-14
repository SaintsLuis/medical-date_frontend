import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { ClinicsManagement } from '@/features/clinics/components/clinics-management'

export default function ClinicsPage() {
  return (
    <AdminOnlyRoute>
      <ClinicsManagement />
    </AdminOnlyRoute>
  )
}
