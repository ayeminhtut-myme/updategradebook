import type { LevelGroup } from '@/lib/report-data'
import { CourseCard } from '@/components/course-card'

export function LevelSection({
  group,
  openFirstCourse = false,
}: {
  group: LevelGroup
  openFirstCourse?: boolean
}) {
  const learners = group.courses.reduce((n, c) => n + c.activeCount, 0)

  return (
    <section aria-labelledby={`${group.id}-heading`} className="mb-6">
      <div className="mb-2.5 flex items-baseline gap-2.5">
        <h2
          id={`${group.id}-heading`}
          className="text-white text-[13px] font-semibold tracking-wide uppercase"
        >
          {group.label}
        </h2>
        <span className="text-white/70 font-myanmar text-[11.5px]">{group.labelMm}</span>
        <span className="bg-white/25 h-px flex-1" aria-hidden="true" />
        <span className="text-white/70 num shrink-0 text-[11.5px]">
          {group.courses.length} {group.courses.length === 1 ? 'course' : 'courses'} ·{' '}
          {learners} learners
        </span>
      </div>

      <div className="space-y-2">
        {group.courses.map((course, i) => (
          <CourseCard key={course.id} course={course} defaultOpen={openFirstCourse && i === 0} />
        ))}
      </div>
    </section>
  )
}
