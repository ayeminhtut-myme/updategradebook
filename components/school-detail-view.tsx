'use client'

import {
  BookOpen,
  ChevronLeft,
  GraduationCap,
  RotateCcw,
  School as SchoolIcon,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { LevelSection } from '@/components/level-section'
import { ProgressMeter } from '@/components/progress-meter'
import {
  emptyFilters,
  getSchoolStudents,
  groupCoursesByLevel,
  matchingCourses,
  PASS_THRESHOLD,
  sagaingSchools,
  type FilterSelection,
} from '@/lib/report-data'

// Detail drill-down for one region school: a school-scoped summary card in
// the same visual language as the site-wide scan status, followed by the
// regular LevelSection / CourseCard detail design restricted to this school.
export function SchoolDetailView({
  schoolId,
  onBack,
  filters = emptyFilters,
  onResetFilters,
}: {
  schoolId: string
  onBack: () => void
  /** Sidebar filters — the level/course/teacher facets narrow this school's courses */
  filters?: FilterSelection
  onResetFilters?: () => void
}) {
  const school = sagaingSchools.find((s) => s.id === schoolId)
  if (!school) return null

  // The school is chosen explicitly, so it overrides the location facet while
  // the remaining facets keep cascading within the school.
  const groups = groupCoursesByLevel(matchingCourses({ ...filters, schools: [schoolId] }))
  const students = getSchoolStudents(schoolId)
  const passedCount = students.filter((s) => s.progress >= PASS_THRESHOLD).length
  const progressingCount = students.length - passedCount

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-primary hover:bg-accent font-myanmar mb-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors"
      >
        <ChevronLeft className="size-4" />
        မြေပုံသို့ ပြန်သွားရန်
      </button>

      {/* School summary */}
      <section aria-label={`${school.name} အသေးစိတ်`} className="mb-6">
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <div className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 border-b px-4 py-3.5">
            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <SchoolIcon className="size-4.5" />
            </span>

            <div className="min-w-0">
              <p className="text-muted-foreground font-myanmar text-[11px] font-medium tracking-wide">
                ကျောင်း / အတန်း
              </p>
              <p className="text-foreground font-myanmar mt-0.5 text-[14px] leading-tight font-semibold">
                {school.name}
              </p>
            </div>

            <div className="ml-auto hidden min-w-[180px] items-center gap-3 sm:flex sm:max-w-xs sm:flex-1">
              <ProgressMeter value={school.progress} className="flex-1" />
            </div>
          </div>

          <dl className="divide-border grid grid-cols-2 divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-3.5">
              <dt className="text-muted-foreground font-myanmar flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <Users className="size-3" />
                ကျောင်းသားကျောင်းသူ ဦးရေ
              </dt>
              <dd className="num text-foreground mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                {school.studentCount}
                <span className="text-muted-foreground ml-1 text-[13px] font-medium">ဦး</span>
              </dd>
              <dd className="text-muted-foreground font-myanmar num mt-1 text-[11px]">
                {school.studentCountMm} ဦး
              </dd>
            </div>

            <div className="px-4 py-3.5">
              <dt className="text-muted-foreground font-myanmar flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <GraduationCap className="size-3" />
                ဆရာ
              </dt>
              <dd className="num text-foreground mt-1.5 text-[13px] leading-snug font-semibold">
                {school.teachers.join(', ')}
              </dd>
              <dd className="text-muted-foreground font-myanmar num mt-1 text-[11px]">
                စုစုပေါင်း {school.teachers.length} ဦး
              </dd>
            </div>
          </dl>

          <dl className="divide-border grid grid-cols-2 divide-y border-t sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-3.5">
              <dt className="text-muted-foreground font-myanmar flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <BookOpen className="size-3" />
                သင်ကြားနေသောဘာသာရပ်
              </dt>
              <dd className="text-foreground font-myanmar mt-1.5 text-[12px] leading-snug font-medium">
                {school.coursesMm.join('၊ ')}
              </dd>
              <dd className="text-muted-foreground font-myanmar num mt-1 text-[11px]">
                ဘာသာရပ် {school.coursesMm.length} ခု
              </dd>
            </div>

            <div className="px-4 py-3.5">
              <dt className="text-muted-foreground font-myanmar flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <TrendingUp className="size-3" />
                လက်ရှိတိုးတက်မှု
              </dt>
              <dd className="mt-2">
                <ProgressMeter value={school.progress} />
              </dd>
              <dd className="text-muted-foreground font-myanmar mt-1 text-[11px]">
                ကျောင်းတစ်ကျောင်းလုံး၏ ပျမ်းမျှ
              </dd>
            </div>
          </dl>

          {/* Pass review — same 60% threshold as the site-wide scan status */}
          <dl className="border-border bg-surface/40 grid grid-cols-1 divide-y border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-lg">
                <UserCheck className="size-4.5" />
              </span>
              <div className="min-w-0">
                <dt className="text-muted-foreground font-myanmar flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
                  အောင်မြင်မှုရှိသူများ
                  <span className="bg-success/10 text-success rounded px-1.5 py-0.5 text-[10px] font-semibold">
                    ၆၀% နှင့်အထက်
                  </span>
                </dt>
                <dd className="text-success num mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                  {passedCount}
                  <span className="text-muted-foreground ml-1 text-[13px] font-medium">ဦး</span>
                </dd>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="bg-warning/10 text-warning flex size-9 shrink-0 items-center justify-center rounded-lg">
                <TrendingUp className="size-4.5" />
              </span>
              <div className="min-w-0">
                <dt className="text-muted-foreground font-myanmar flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
                  ဆက်လက်တိုးတက်ဆဲသူများ
                  <span className="bg-warning/10 text-warning rounded px-1.5 py-0.5 text-[10px] font-semibold">
                    ၆၀% အောက်
                  </span>
                </dt>
                <dd className="text-warning num mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                  {progressingCount}
                  <span className="text-muted-foreground ml-1 text-[13px] font-medium">ဦး</span>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* The current detail design, scoped to this school + the sidebar filters */}
      {groups.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border px-6 py-10 text-center">
          <p className="text-foreground font-myanmar text-[13px] font-semibold">
            ရွေးချယ်မှုနှင့် ကိုက်ညီသော ဘာသာရပ် မရှိပါ
          </p>
          <p className="text-muted-foreground font-myanmar text-[11.5px] leading-relaxed">
            ဤကျောင်းတွင် ရွေးထားသော အတန်း / ဘာသာရပ် / ဆရာ မရှိသောကြောင့် ဖြစ်သည်။
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-primary hover:bg-accent font-myanmar mt-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors"
            >
              <RotateCcw className="size-3.5" />
              နဂိုအတိုင်း ပြန်လည်သတ်မှတ်မည်
            </button>
          )}
        </div>
      ) : (
        groups.map((group, i) => (
          <LevelSection key={group.id} group={group} openFirstCourse={i === 0} />
        ))
      )}
    </div>
  )
}