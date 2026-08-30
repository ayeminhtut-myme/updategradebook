import { CheckCircle2, Database, Gauge, Layers, Timer, TrendingUp, UserCheck } from 'lucide-react'
import {
  computePassSummary,
  levelGroups,
  overallAverage,
  passSummary,
  progressBucketsFor,
  progressDistribution,
  scanMeta,
  weightedAverage,
  type Course,
  type PassSummary,
  type ProgressBucket,
} from '@/lib/report-data'
import { ProgressDistribution } from '@/components/progress-distribution'

export function ScanStatus({ courses, scopeLabel }: { courses?: Course[]; scopeLabel?: string }) {
  // When a course pool is passed (e.g. the teacher-scoped view), every stat is
  // computed from just those courses; otherwise site-wide numbers are shown.
  const scoped = courses !== undefined
  const scopedCourses = courses ?? levelGroups.flatMap((g) => g.courses)
  const learners = scoped
    ? scopedCourses.reduce((n, c) => n + c.students.length, 0)
    : scanMeta.activeLearners
  const registered = scoped ? learners : scanMeta.totalStudents
  const average = scoped ? weightedAverage(scopedCourses) : overallAverage
  const summary: PassSummary = scoped ? computePassSummary(scopedCourses) : passSummary
  const buckets: ProgressBucket[] = scoped
    ? progressBucketsFor(scopedCourses.flatMap((c) => c.students))
    : progressDistribution
  const courseCount = scopedCourses.length

  const stats = [
    {
      icon: Layers,
      label: 'လက်ရှိလေ့လာနေသူများ',
      value: learners.toString(),
      sub: `${registered.toLocaleString()} ဦး မှတ်ပုံတင်ထားသည်`,
    },
    {
      icon: Gauge,
      label: 'စုစုပေါင်း အောင်မြင်တိုးတက်မှုအခြေအနေ',
      value: `${average}%`,
      sub: `across ${courseCount} courses`,
    },
    {
      icon: Timer,
      label: 'မှတ်တမ်းရယူရန်ကြာခဲ့သောအချိန်',
      value: `${scanMeta.loadingSeconds.toFixed(3)}s`,
      sub: `${scanMeta.renderedRecords} records`,
    },
    {
      icon: Database,
      label: 'မှတ်တမ်းရယူခဲ့သည့် အမြန်နှုန်း',
      value: `${scanMeta.elapsedSeconds}s`,
      sub: 'last scan elapsed',
    },
  ]

  return (
    <section aria-label="Scan status" className="mb-6">
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b px-4 py-2.5">
          <span className="text-success flex items-center gap-1.5 text-[12.5px] font-medium">
            <CheckCircle2 className="size-3.5" />
            စစ်ဆေးမှုပြီးဆုံး
          </span>
          {scopeLabel && (
            <span className="bg-primary/10 text-primary font-myanmar rounded px-1.5 py-0.5 text-[11px] font-medium">
              {scopeLabel}
            </span>
          )}
          <span className="text-muted-foreground text-[12px]">
            <span className="num text-foreground font-medium">{learners}</span>{' '}
            ဦး တွေ့ရှိသည်
          </span>
          <span className="text-muted-foreground num ml-auto text-[11.5px]">
            {scanMeta.lastScan}
          </span>
        </div>

        {/* Overall pass review — topmost summary (pass = 60% or above in the relevant course) */}
        <dl className="border-border bg-surface/40 grid grid-cols-1 divide-y border-b sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <span className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-lg">
              <UserCheck className="size-4.5" />
            </span>
            <div className="min-w-0">
              <dt className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
                အောင်မြင်မှုရှိသူများ
                <span className="bg-success/10 text-success rounded px-1.5 py-0.5 text-[10px] font-semibold">
                  ၆၀% နှင့်အထက်
                </span>
              </dt>
              <dd className="text-success num mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                {summary.passedStudents}
                <span className="text-muted-foreground ml-1 text-[13px] font-medium">ဦး</span>
              </dd>
              <dd className="text-muted-foreground num mt-1 text-[11px]">
                ဘာသာရပ် {summary.passedCourses} ခုတွင် အောင်မြင်
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <span className="bg-warning/10 text-warning flex size-9 shrink-0 items-center justify-center rounded-lg">
              <TrendingUp className="size-4.5" />
            </span>
            <div className="min-w-0">
              <dt className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
                ဆက်လက်တိုးတက်ဆဲသူများ
                <span className="bg-warning/10 text-warning rounded px-1.5 py-0.5 text-[10px] font-semibold">
                  ၆၀% အောက်
                </span>
              </dt>
              <dd className="text-warning num mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                {summary.progressingStudents}
                <span className="text-muted-foreground ml-1 text-[13px] font-medium">ဦး</span>
              </dd>
              <dd className="text-muted-foreground num mt-1 text-[11px]">
                ဘာသာရပ် {summary.progressingCourses} ခုတွင် ဆက်လက်လေ့လာဆဲ
              </dd>
            </div>
          </div>
        </dl>

        <dl className="divide-border grid grid-cols-2 divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-3.5">
              <dt className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <s.icon className="size-3" />
                {s.label}
              </dt>
              <dd className="num text-foreground mt-1.5 text-[22px] leading-none font-semibold tracking-tight">
                {s.value}
              </dd>
              <dd className="text-muted-foreground num mt-1 text-[11px]">{s.sub}</dd>
            </div>
          ))}
        </dl>

        <ProgressDistribution summary={summary} buckets={buckets} />
      </div>
    </section>
  )
}
