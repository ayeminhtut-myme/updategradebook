'use client'

import type { ReactNode } from 'react'
import {
  BookOpen,
  ChevronRight,
  Compass,
  GraduationCap,
  Map as MapIcon,
  MapPin,
  MountainSnow,
  TreePine,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ProgressMeter } from '@/components/progress-meter'
import { sagaingSchools, type RegionSchool } from '@/lib/report-data'
import { cn } from '@/lib/utils'

// Node pin accent per school so the map reads like distinct locations.
const toneStyles: Record<RegionSchool['tone'], string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

// One icon row inside a map node — icon on the left, Burmese label above the value.
function NodeRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2 px-3 py-1.5">
      <span className="bg-primary/10 text-primary mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded">
        <Icon className="size-3" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground font-myanmar text-[10px] leading-tight">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function SchoolNode({
  school,
  onSelect,
  dimmed = false,
}: {
  school: RegionSchool
  onSelect: (id: string) => void
  dimmed?: boolean
}) {
  return (
    <article
      className={cn(
        'absolute w-[248px] transition-all duration-200 hover:z-10',
        dimmed ? 'opacity-40 saturate-[0.4]' : 'hover:scale-[1.03]',
      )}
      style={{ left: `${school.pos.x}%`, top: `${school.pos.y}%` }}
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-md transition-shadow hover:shadow-lg">
        {/* Pin header — school name */}
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <span
            className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', toneStyles[school.tone])}
          >
            <MapPin className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-foreground font-myanmar truncate text-[12.5px] leading-tight font-semibold">
              {school.name}
            </h3>
            <p className="text-muted-foreground font-myanmar text-[10px] leading-tight">ကျောင်း / အတန်း</p>
          </div>
        </div>

        <NodeRow icon={Users} label="ကျောင်းသားကျောင်းသူ ဦးရေ">
          <span className="text-foreground font-myanmar text-[12.5px] font-semibold">
            {school.studentCountMm}
          </span>
        </NodeRow>

        <NodeRow icon={GraduationCap} label="ဆရာ">
          <span className="text-foreground num text-[11px] leading-snug font-medium">
            {school.teachers.join(', ')}
          </span>
        </NodeRow>

        <NodeRow icon={BookOpen} label="သင်ကြားနေသောဘာသာရပ်">
          <span className="text-foreground font-myanmar text-[11px] leading-relaxed">
            {school.coursesMm.join('၊ ')}
          </span>
        </NodeRow>

        <NodeRow icon={TrendingUp} label="လက်ရှိတိုးတက်မှု">
          <ProgressMeter value={school.progress} />
        </NodeRow>

        <button
          type="button"
          onClick={() => onSelect(school.id)}
          className="border-border font-myanmar hover:bg-accent text-primary flex w-full items-center justify-center gap-1 border-t px-3 py-2 text-[12px] font-medium transition-colors"
        >
          အသေးစိတ်ကြည့်ရန်နှိပ်ပါ
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </article>
  )
}

// Game-map scene of the manager's region: a dashed trail links the school
// nodes across the terrain, like a level-select screen in a game.
export function ManagerRegionMap({
  onSelect,
  activeSchoolIds,
}: {
  onSelect: (schoolId: string) => void
  /** Schools matching the current filters — the rest are dimmed on the map */
  activeSchoolIds?: Set<string>
}) {
  const dimmedCount = activeSchoolIds
    ? sagaingSchools.filter((s) => !activeSchoolIds.has(s.id)).length
    : 0

  return (
    <section aria-label="စစ်ကိုင်းတိုင်းအတွင်းရှိ အတန်းများ" className="mb-6">
      {/* Region heading */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <MapIcon className="text-primary size-4 shrink-0" aria-hidden="true" />
        <h2 className="text-foreground font-myanmar text-[15px] font-semibold">
          စစ်ကိုင်းတိုင်းအတွင်းရှိ အတန်းများ
        </h2>
        <span className="bg-border h-px flex-1" aria-hidden="true" />
        <span className="text-muted-foreground font-myanmar shrink-0 text-[11.5px]">
          ကျောင်း ၄ ခု · ကျောင်းသားကျောင်းသူ ၁၅၆ ဦး
        </span>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        {/* The map pans horizontally on narrow screens, like a game map */}
        <div className="scrollbar-thin-green overflow-x-auto">
          <div
            className="relative h-[640px] min-w-[860px]"
            style={{
              background:
                'linear-gradient(180deg, oklch(0.92 0.045 235) 0%, oklch(0.94 0.045 165) 48%, oklch(0.91 0.06 145) 100%)',
            }}
          >
            {/* River + dashed trail, drawn under the nodes */}
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 2 84 C 18 74, 26 92, 44 85 S 80 70, 99 78"
                className="text-primary/15"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 16 22 C 40 6, 66 8, 80 24 C 92 40, 70 52, 52 60 C 34 68, 30 62, 18 72"
                className="text-primary/45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="7 7"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Waypoint dots on the trail */}
            {[
              { x: 52, y: 11 },
              { x: 68, y: 55 },
            ].map((dot) => (
              <span
                key={`${dot.x}-${dot.y}`}
                className="border-card bg-primary absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm"
                style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                aria-hidden="true"
              />
            ))}

            {/* Scenery — decorative only */}
            <MountainSnow className="text-muted-foreground/30 absolute left-[47%] top-[3%] size-8" aria-hidden="true" />
            <TreePine className="text-success/35 absolute left-[38%] top-[22%] size-6" aria-hidden="true" />
            <TreePine className="text-success/40 absolute left-[74%] top-[60%] size-7" aria-hidden="true" />
            <TreePine className="text-success/30 absolute left-[48%] top-[93%] size-5" aria-hidden="true" />
            <Compass className="text-muted-foreground/40 absolute right-3 bottom-3 size-6" aria-hidden="true" />

            {sagaingSchools.map((school) => (
              <SchoolNode
                key={school.id}
                school={school}
                onSelect={onSelect}
                dimmed={activeSchoolIds ? !activeSchoolIds.has(school.id) : false}
              />
            ))}
          </div>
        </div>

        <p className="text-muted-foreground font-myanmar border-border border-t px-4 py-2.5 text-[11px]">
          ကျောင်းတစ်ကျောင်းချင်းစီ၏ အသေးစိတ်ဒေတာကို ကြည့်ရှုရန် «အသေးစိတ်ကြည့်ရန်နှိပ်ပါ» ကို နှိပ်ပါ။
          {dimmedCount > 0 && ' စစ်ထုတ်မှုနှင့် မကိုက်ညီသော ကျောင်းများကို မှိန်ဝါးထားပါသည်။'}
        </p>
      </div>
    </section>
  )
}