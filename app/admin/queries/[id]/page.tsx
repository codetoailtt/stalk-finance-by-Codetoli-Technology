import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { QueryDetail } from '@/components/dashboard/query-detail'

interface AdminQueryDetailPageProps {
  params: {
    id: string
  }
}

export default function AdminQueryDetailPage({ params }: AdminQueryDetailPageProps) {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <QueryDetail queryId={params.id} />
      </DashboardLayout>
    </AuthGuard>
  )
}