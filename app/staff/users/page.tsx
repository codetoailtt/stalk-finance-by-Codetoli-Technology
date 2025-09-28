import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StaffUserManagement } from '@/components/staff/staff-user-management'

export default function StaffUsersPage() {
  return (
    <AuthGuard requiredRole="staff">
      <DashboardLayout>
        <StaffUserManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}