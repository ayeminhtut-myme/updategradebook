'use client'

import { User } from 'lucide-react'
import { LevelSection } from '@/components/level-section'
import { ProgressMeter } from '@/components/progress-meter'
import { ReportSidebar } from '@/components/report-sidebar'
import { RoleProfileMenu } from '@/components/role-profile'
import { ScanStatus } from '@/components/scan-status'
import { useRole } from '@/components/role-provider'
import {
  allStudents,
  levelGroups,
  OWN_STUDENT_ID,
  PASS_THRESHOLD,
  type LevelGroup,
} from '@/lib/report-data'
import { cn } from '@/lib/utils'

// Student view: every course is trimmed down to the student's own row(s) so
// only their own result is visible.
function ownResultGroups(): LevelGroup[] {
  return levelGroups
    .map((group) => ({
      ...group,
      courses: group.courses
        .map((course) => {
          const mine = course.students.filter((s) => s.id === OWN_STUDENT_ID)
          return { ...course, students: mine, activeCount: mine.length, totalCount: mine.length }
        })
        .filter((course) => course.students.length > 0),
    }))
    .filter((group) => group.courses.length > 0)
}

// Compact personal summary card shown instead of the site-wide scan status
// when the student profile is active.
function OwnResultSummary() {
  const me = allStudents.find((s) => s.id === OWN_STUDENT_ID)
  if (!me) return null

  const passed = me.progress >= PASS_THRESHOLD

  return (
    <section aria-label="မိမိ၏ ရမှတ်" className="mb-6">
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 border-b px-4 py-3.5">
          <span className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-lg">
            <User className="size-4.5" />
          </span>

          <div className="min-w-0">
            <p className="text-muted-foreground font-myanmar text-[11px] font-medium tracking-wide">
              မိမိ၏ ရမှတ်
            </p>
            <p className="text-foreground num mt-0.5 text-[14px] leading-tight font-semibold">{me.id}</p>
            <p className="text-muted-foreground font-myanmar mt-0.5 text-[11px]">{me.cohort}</p>
          </div>

          <div className="ml-auto flex min-w-[200px] items-center gap-3 sm:max-w-xs sm:flex-1">
            <ProgressMeter value={me.progress} className="flex-1" />
          </div>

          <div className="min-w-0 text-right">
            <span
              className={cn(
                'font-myanmar inline-flex items-center rounded px-2 py-1 text-[11px] font-semibold',
                passed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
              )}
            >
              {passed ? 'အောင်မြင်မှုရှိသည်' : 'ဆက်လက်လေ့လာဆဲ'}
            </span>
            <p className="text-muted-foreground font-myanmar mt-1 text-[10.5px]">
              အောင်မြင်မှုအဆင့် — ၆၀% နှင့်အထက်
            </p>
          </div>
        </div>

        <p className="text-muted-foreground font-myanmar px-4 py-2.5 text-[11px] leading-relaxed">
          မိမိ တက်ရောက်လေ့လာနေသော ဘာသာရပ်များ၏ ရမှတ်သာ ပြသပါသည်။
        </p>
      </div>
    </section>
  )
}

export function ReportView() {
  const { profile } = useRole()
  const can = profile.can

  const groups = can.ownResultOnly ? ownResultGroups() : levelGroups

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      {/* Profile switcher — top right of the result pane */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-white/70 font-myanmar hidden truncate text-[11.5px] sm:block">
          လုပ်ဆောင်ခွင့်: <span className="text-white">{profile.hintMm}</span>
        </p>
        <RoleProfileMenu />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Students get no filter sidebar at all */}
        {can.filter && (
          <aside
            aria-label="Report controls"
            className="scrollbar-thin-green w-full shrink-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:w-[400px] lg:overflow-y-auto lg:pr-2"
          >
            <ReportSidebar can={can} />
          </aside>
        )}

        <main className="min-w-0 flex-1">
          {can.ownResultOnly ? (
            <>
              <OwnResultSummary />
              {groups.map((group, i) => (
                <LevelSection
                  key={group.id}
                  group={group}
                  openFirstCourse={i === groups.length - 1}
                />
              ))}
            </>
          ) : (
            <>
              <ScanStatus />

              {groups.map((group, i) => (
                <LevelSection
                  key={group.id}
                  group={group}
                  openFirstCourse={i === levelGroups.length - 1}
                />
              ))}
            </>
          )}

          <p className="text-white/60 border-white/25 mt-8 border-t pt-4 text-[11.5px]">
            myME Box LMS · Learning progress report mockup. Data shown is sample data.
          </p>
        </main>
      </div>
    </div>
  )
}
