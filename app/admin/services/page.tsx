import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ServiceManagement } from '@/components/admin/service-management'

export default function AdminServicesPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <ServiceManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}