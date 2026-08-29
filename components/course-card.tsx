'use client'

import { Fragment, useState } from 'react'
import { BookOpen, ChevronDown, Users } from 'lucide-react'
import type { Course } from '@/lib/report-data'
import { ProgressMeter } from '@/components/progress-meter'
import { TopicBreakdown } from '@/components/topic-breakdown'
import { cn } from '@/lib/utils'

export function CourseCard({ course, defaultOpen = false }: { course: Course; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleStudent(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <article className="border-border bg-card overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:bg-surface flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        <BookOpen className="text-muted-foreground size-4 shrink-0" />

        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-[13.5px] font-semibold">{course.title}</h3>
          {course.titleMm && (
            <p className="text-muted-foreground font-myanmar mt-0.5 truncate text-[11.5px] leading-relaxed">
              {course.titleMm}
            </p>
          )}
        </div>

        <div className="hidden w-40 shrink-0 sm:block">
          <ProgressMeter value={course.average} />
        </div>

        <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11.5px]">
          <Users className="size-3.5" />
          <span className="num">
            {course.activeCount}
            <span className="text-muted-foreground/70">/{course.totalCount}</span>
          </span>
        </span>

        {course.cached && (
          <span className="bg-muted text-muted-foreground hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium md:inline">
            cached
          </span>
        )}

        <ChevronDown
          className={cn(
            'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="border-border border-t">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-surface border-border border-b">
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase">
                    အမည်
                  </th>
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium tracking-wide uppercase">
                    အဖွဲ့/နေရာ/အတန်း
                  </th>
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium tracking-wide uppercase">
                    နေရာ
                  </th>
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium tracking-wide uppercase">
                    ကျောင်းအမည်
                  </th>
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap w-52 px-3 py-2 text-left text-[11px] font-medium tracking-wide uppercase">
                    တိုးတက်မှု
                  </th>
                  <th className="text-muted-foreground font-myanmar whitespace-nowrap px-4 py-2 text-right text-[11px] font-medium tracking-wide uppercase">
                    ထပ်မံ
                  </th>
                </tr>
              </thead>
              <tbody>
                {course.students.map((s) => {
                  const isOpen = expanded.has(s.id)
                  return (
                    <Fragment key={s.id}>
                      <tr
                        className={cn(
                          'border-border hover:bg-surface border-b transition-colors',
                          isOpen && 'bg-surface',
                        )}
                      >
                        <td className="text-foreground px-4 py-2.5 font-medium whitespace-nowrap">
                          {s.name}
                        </td>
                        <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                          {s.cohort}
                        </td>
                        <td className="text-muted-foreground px-3 py-2.5">{s.place}</td>
                        <td className="text-muted-foreground px-3 py-2.5">{s.school}</td>
                        <td className="px-3 py-2.5">
                          <ProgressMeter value={s.progress} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => toggleStudent(s.id)}
                            aria-expanded={isOpen}
                            className="text-primary hover:bg-accent inline-flex items-center gap-1 rounded px-2 py-1 text-[12px] font-medium transition-colors"
                          >
                            အသေးစိတ်
                            <ChevronDown
                              className={cn(
                                'size-3.5 transition-transform duration-200',
                                isOpen && 'rotate-180',
                              )}
                            />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-border bg-surface/40 border-b">
                          <td colSpan={6} className="px-4 py-3">
                            <TopicBreakdown topics={s.topics} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {course.students.length < course.activeCount && (
            <p className="text-muted-foreground border-border num border-t px-4 py-2.5 text-[11.5px]">
              Showing {course.students.length} of {course.activeCount} active students
            </p>
          )}
        </div>
      )}
    </article>
  )
}
