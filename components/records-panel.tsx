import { CalendarDays, Mail, Repeat, SlidersHorizontal, Trash2 } from 'lucide-react'
import { savedRecords } from '@/lib/report-data'

const freqTone = {
  'လစဉ်': 'bg-accent text-accent-foreground',
  'တစ်ကြိမ်တည်းသာ': 'bg-muted text-muted-foreground',
} as const

export function RecordsPanel() {
  return (
    <div className="space-y-3">
      {savedRecords.map((rec) => (
        <article
          key={rec.id}
          className="border-border bg-surface rounded-md border p-3"
        >
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-foreground truncate text-[12.5px] font-semibold">{rec.name}</h4>
              <p className="text-muted-foreground font-myanmar mt-0.5 truncate text-[11px]">
                {rec.nameMm}
              </p>
            </div>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${freqTone[rec.frequency]}`}
            >
              <Repeat className="mr-0.5 inline size-2.5" />
              {rec.frequency}
            </span>
          </header>

          <dl className="text-muted-foreground mt-2.5 space-y-1.5 text-[11px]">
            <div className="flex items-start gap-1.5">
              <CalendarDays className="mt-px size-3 shrink-0" />
              <dt className="sr-only">Next send</dt>
              <dd className="num">{rec.when}</dd>
            </div>
            <div className="flex items-start gap-1.5">
              <Mail className="mt-px size-3 shrink-0" />
              <dt className="sr-only">Recipients</dt>
              <dd className="font-myanmar truncate">{rec.recipients.join(', ')}</dd>
            </div>
            <div className="flex items-start gap-1.5">
              <SlidersHorizontal className="mt-px size-3 shrink-0" />
              <dt className="sr-only">Filters</dt>
              <dd className="font-myanmar leading-relaxed">{rec.filter}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="text-danger hover:bg-danger/10 mt-2.5 flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] font-medium transition-colors"
          >
            <Trash2 className="size-3" />
            <span className="font-myanmar">ပယ်ဖျက်မည်</span>
          </button>
        </article>
      ))}
    </div>
  )
}
