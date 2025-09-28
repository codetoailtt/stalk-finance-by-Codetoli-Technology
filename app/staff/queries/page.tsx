import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StaffQueries } from '@/components/staff/staff-queries'

export default function StaffQueriesPage() {
  return (
    <AuthGuard requiredRole="staff">
      <DashboardLayout>
        <StaffQueries />
      </DashboardLayout>
    </AuthGuard>
  )
}