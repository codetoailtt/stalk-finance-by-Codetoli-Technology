import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { QueryDetail } from '@/components/dashboard/query-detail'

interface StaffQueryDetailPageProps {
  params: {
    id: string
  }
}

export default function StaffQueryDetailPage({ params }: StaffQueryDetailPageProps) {
  return (
    <AuthGuard requiredRole="staff">
      <DashboardLayout>
        <QueryDetail queryId={params.id} />
      </DashboardLayout>
    </AuthGuard>
  )
}