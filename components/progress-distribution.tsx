import type { PassSummary, ProgressBucket } from '@/lib/report-data'
import { cn } from '@/lib/utils'

const toneClass = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const

// px reserved above the bars so count labels never overlap the tallest bar
const LABEL_SPACE = 20

const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export function ProgressDistribution({
  summary,
  buckets,
}: {
  summary: PassSummary
  buckets: ProgressBucket[]
}) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div className="border-border border-t px-4 py-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <h3 className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          တိုးတက်မှုအလိုက် ကျောင်းသားအရေအတွက်
        </h3>
        <span className="text-muted-foreground num text-[11px]">
          စုစုပေါင်း {summary.totalStudents} ဦး
        </span>
      </div>

      <div
        role="img"
        aria-label={`တိုးတက်မှု ${summary.threshold}% အမှတ်နှင့် ကျောင်းသားအရေအတွက် ဖြန့်ကျက်မှု`}
        className="relative h-40"
      >
        {/* horizontal gridlines */}
        {[1 / 3, 2 / 3, 1].map((f) => (
          <div
            key={f}
            aria-hidden="true"
            className="border-border/60 absolute inset-x-0 border-t border-dashed"
            style={{ bottom: `calc(${LABEL_SPACE}px + (100% - ${LABEL_SPACE}px) * ${f})` }}
          />
        ))}
        <div aria-hidden="true" className="border-border absolute inset-x-0 bottom-0 border-t" />

        {/* pass-mark marker at 60% */}
        <div
          aria-hidden="true"
          className="border-primary/50 absolute bottom-0 top-0 border-l border-dashed"
          style={{ left: `${summary.threshold}%` }}
        >
          <span className="text-primary bg-card absolute top-0 left-1 rounded px-1 text-[9.5px] leading-tight font-medium whitespace-nowrap">
            အောင်မြင်အမှတ် {summary.threshold}%
          </span>
        </div>

        {/* bars — one per 10% bucket, count labelled above each bar */}
        <div className="absolute inset-0 flex items-stretch">
          {buckets.map((b) => {
            const ratio = (b.count / maxCount).toFixed(4)
            return (
              <div
                key={b.start}
                className="relative h-full min-w-0 flex-1"
                title={`${b.start}% - ${b.end}% · ${b.count} ဦး`}
              >
                {b.count > 0 && (
                  <div
                    className={cn(
                      'hover:opacity-80 absolute inset-x-[2px] bottom-0 rounded-t-[3px] transition-opacity sm:inset-x-1',
                      toneClass[b.tone],
                    )}
                    style={{ height: `calc((100% - ${LABEL_SPACE}px) * ${ratio})` }}
                  />
                )}
                <span
                  className="num text-muted-foreground absolute left-1/2 -translate-x-1/2 text-[10px] leading-none"
                  style={{ bottom: `calc((100% - ${LABEL_SPACE}px) * ${ratio} + 4px)` }}
                >
                  {b.count > 0 ? b.count : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* x-axis — 0% to 100% progress points */}
      <div aria-hidden="true" className="relative mt-1.5 h-3.5">
        {ticks.map((t) => (
          <span
            key={t}
            className={cn(
              'num text-muted-foreground absolute text-[9px] leading-none',
              t === 0 && 'left-0',
              t === 100 && 'right-0',
            )}
            style={t > 0 && t < 100 ? { left: `${t}%`, transform: 'translateX(-50%)' } : undefined}
          >
            {t}%
          </span>
        ))}
      </div>
    </div>
  )
}