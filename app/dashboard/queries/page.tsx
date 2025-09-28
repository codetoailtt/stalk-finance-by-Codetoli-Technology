import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { UserQueries } from '@/components/dashboard/user-queries'

export default function QueriesPage() {
  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout>
        <UserQueries />
      </DashboardLayout>
    </AuthGuard>
  )
}