import { cn } from '@/lib/utils'
import { progressTone } from '@/lib/report-data'

const trackTone = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const

export function ProgressMeter({
  value,
  className,
  showLabel = true,
}: {
  value: number
  className?: string
  showLabel?: boolean
}) {
  const tone = progressTone(value)
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="bg-muted relative h-1.5 w-full min-w-16 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress ${clamped}%`}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', trackTone[tone])}
          style={{ width: `${Math.max(clamped, 1.5)}%` }}
        />
      </div>
      {showLabel && (
        <span className="num text-foreground w-14 shrink-0 text-right text-[13px] font-medium">
          {clamped}%
        </span>
      )}
    </div>
  )
}
