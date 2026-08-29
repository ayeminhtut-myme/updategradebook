import { ReportHeader } from '@/components/report-header'
import { ReportView } from '@/components/report-view'
import { RoleProvider } from '@/components/role-provider'

export default function Page() {
  return (
    <div className="min-h-screen">
      <ReportHeader />

      <RoleProvider>
        <ReportView />
      </RoleProvider>
    </div>
  )
}
