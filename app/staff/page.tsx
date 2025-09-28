import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StaffOverview } from '@/components/staff/staff-overview'

export default function StaffPage() {
  return (
    <AuthGuard requiredRole="staff">
      <DashboardLayout>
        <StaffOverview />
      </DashboardLayout>
    </AuthGuard>
  )
}