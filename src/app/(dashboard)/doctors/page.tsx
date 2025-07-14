import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { DoctorsManagement } from '@/features/doctors/components/doctors-management'

export default function DoctorsPage() {
  return (
    <AdminOnlyRoute>
      <DoctorsManagement />
    </AdminOnlyRoute>
  )
}
