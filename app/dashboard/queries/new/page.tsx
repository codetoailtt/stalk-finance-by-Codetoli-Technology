import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { NewQueryForm } from '@/components/dashboard/new-query-form'

export default function NewQueryPage() {
  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout>
        <NewQueryForm />
      </DashboardLayout>
    </AuthGuard>
  )
}