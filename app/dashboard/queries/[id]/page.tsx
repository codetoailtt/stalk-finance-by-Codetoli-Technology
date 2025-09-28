import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { QueryDetail } from '@/components/dashboard/query-detail'

interface QueryDetailPageProps {
  params: {
    id: string
  }
}

export default function QueryDetailPage({ params }: QueryDetailPageProps) {
  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout>
        <QueryDetail queryId={params.id} />
      </DashboardLayout>
    </AuthGuard>
  )
}