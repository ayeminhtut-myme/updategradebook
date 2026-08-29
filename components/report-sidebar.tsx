import { CalendarClock, FolderClock, Lock, Radar, SlidersHorizontal } from 'lucide-react'
import { SidePanel } from '@/components/side-panel'
import { PermissionsMatrix } from '@/components/permissions-matrix'
import { LearnerScanner } from '@/components/learner-scanner'
import { ReportFilters } from '@/components/report-filters'
import { SchedulePanel } from '@/components/schedule-panel'
import { RecordsPanel } from '@/components/records-panel'
import { savedRecords, scanMeta, type RoleCapabilities } from '@/lib/report-data'

// Each panel renders only when the active role profile allows it — see
// `roleProfiles` in lib/report-data.ts (matches the permission matrix):
// manager sees all, teacher only filters, student nothing from here.
export function ReportSidebar({ can }: { can: RoleCapabilities }) {
  return (
    <div className="space-y-2.5">
      {can.permissions && (
        <SidePanel
          icon={<Lock className="size-4" />}
          title="အသုံးပြုသူအမျိုးအစားနှင့်"
          titleMm="လုပ်ဆောင်ခွင့်များ"
          meta="10 roles"
        >
          <PermissionsMatrix />
        </SidePanel>
      )}

      {can.scanner && (
        <SidePanel
          icon={<Radar className="size-4" />}
          title="လက်ရှိလေ့လာနေသော"
          titleMm="လေ့လာသူများစာရင်း"
          meta={`${scanMeta.activeLearners} cached`}
        >
          <LearnerScanner />
        </SidePanel>
      )}

      {can.filter && (
        <SidePanel
          icon={<SlidersHorizontal className="size-4" />}
          title="မိမိစိတ်ကြိုက်"
          titleMm="ရှာဖွေကြည့်ရှုမည်"
          meta="All time"
          defaultOpen
        >
          <ReportFilters />
        </SidePanel>
      )}

      {can.schedule && (
        <SidePanel
          icon={<CalendarClock className="size-4" />}
          title="သတ်မှတ်ထားသောသူများသို့"
          titleMm="အီးမေးလ် အလိုအလျောက် ပို့ရန်"
          meta="Weekly"
        >
          <SchedulePanel />
        </SidePanel>
      )}

      {can.record && (
        <SidePanel
          icon={<FolderClock className="size-4" />}
          title="အလိုအလျောက်ပေးပို့မှု"
          titleMm="မှတ်တမ်းများ"
          meta={`${savedRecords.length} saved`}
        >
          <RecordsPanel />
        </SidePanel>
      )}
    </div>
  )
}
