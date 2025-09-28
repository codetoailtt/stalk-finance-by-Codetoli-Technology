import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StoreManagement } from '@/components/admin/store-management'

export default function AdminStoresPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <StoreManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}