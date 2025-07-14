import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { UsersManagement } from '@/features/users/components/users-management'

export default function UsersPage() {
  return (
    <AdminOnlyRoute>
      <UsersManagement />
    </AdminOnlyRoute>
  )
}
