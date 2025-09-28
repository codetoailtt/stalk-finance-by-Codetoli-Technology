import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { UserManagement } from '@/components/admin/user-management'

export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}