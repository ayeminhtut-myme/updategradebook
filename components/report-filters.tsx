'use client'

import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { PanelLabel } from '@/components/side-panel'
import { cn } from '@/lib/utils'

type FilterSelect = {
  id: string
  labelMm: string
  options: string[]
}

function get_filter_labels(): FilterSelect[] {
  return [
    {
      id: 'level',
      labelMm: 'အတန်း',
      options: ['အားလုံး', 'ပထမအဆင့်', 'ဒုတိယအဆင့်', 'တတိယအဆင့်', 'စတုတ္ထအဆင့်', 'မေးကြမယ်ဖြေကြမယ်'],
    },
    {
      id: 'course',
      labelMm: 'ဘာသာရပ်',
      options: ['အားလုံး', 'မြန်မာစာ', 'သင်္ချာ', '21st Century Facilitator', 'Basic Course'],
    },
    {
      id: 'cohort',
      labelMm: 'အဖွဲ့  /နေရာ / အတန်း',
      options: ['အားလုံး', 'Gradebook Testers', 'မြင်းခြံ အမှတ်-၁', 'ရွှေပြည်သာ အမှတ်-၁၆'],
    },
    {
      id: 'teacher',
      labelMm: 'သင်ကြားသည့် ဆရာ/ဆရာမ',
      options: ['အားလုံး', 'ဆရာ-၁', 'ဆရာမ-၃', 'ဆရာမ-၄'],
    },
    {
      id: 'time',
      labelMm: 'အချိန်ကာလ',
      // Flat list (no grouping) for the time range.
      options: [
        'အချိန်အားလုံး',
        'ဒီတစ်ပတ်',
        'ဒီတစ်လ',
        'လွန်ခဲ့သော ၃၀ ရက်',
        'ဒီတစ်နှစ်',
        'ရက်စွဲ စိတ်ကြိုက်ရွေးမည်',
      ],
    },
  ]
}

export function ReportFilters() {
  const [onlyProgress, setOnlyProgress] = useState(true)
  const selects = get_filter_labels()

  return (
    <div className="space-y-3.5">
      {selects.map((s) => (
        <div key={s.id}>
          <PanelLabel>
            <span className="font-myanmar normal-case">{s.labelMm}</span>
          </PanelLabel>
          <select
            defaultValue={s.options[0]}
            aria-label={s.labelMm}
            className="border-border bg-card text-foreground focus-visible:ring-ring/60 font-myanmar h-9 w-full rounded-md border px-2.5 text-[12.5px] focus-visible:ring-2 focus-visible:outline-none"
          >
            {s.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ))}

      <label className="border-border bg-surface flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={onlyProgress}
          aria-label="တိုးတက်မှုရှိသော လေ့လာသူများသာ"
          onClick={() => setOnlyProgress((v) => !v)}
          className={cn(
            'mt-px flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
            onlyProgress
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card',
          )}
        >
          {onlyProgress && <Check className="size-3 stroke-[3]" />}
        </button>
        <span className="min-w-0">
          <span className="text-foreground font-myanmar block text-[12.5px] font-medium">
            တိုးတက်မှုရှိသော လေ့လာသူများသာ
          </span>
        </span>
      </label>

      <button
        type="button"
        className="text-muted-foreground hover:text-foreground font-myanmar flex items-center gap-1.5 text-[11.5px] font-medium transition-colors"
      >
        <RotateCcw className="size-3" />
        နဂိုအတိုင်း ပြန်လည်သတ်မှတ်မည်
      </button>
    </div>
  )
}

