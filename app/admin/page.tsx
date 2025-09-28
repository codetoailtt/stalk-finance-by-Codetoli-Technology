import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AdminOverview } from '@/components/admin/admin-overview'

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <AdminOverview />
      </DashboardLayout>
    </AuthGuard>
  )
}