'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AlertCircle, Bell, Clock, Send, X } from 'lucide-react'
import { PanelHint, PanelLabel } from '@/components/side-panel'
import { levelGroups } from '@/lib/report-data'
import { cn } from '@/lib/utils'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SendMode = 'auto' | 'specific' | 'onUpdate'
type Frequency = 'daily' | 'weekly' | 'monthly'

type EmailTag = {
  value: string
  valid: boolean
}

const FREQUENCIES: { value: Frequency; labelMm: string }[] = [
  { value: 'daily', labelMm: 'နေ့စဉ်' },
  { value: 'weekly', labelMm: 'အပတ်စဉ်' },
  { value: 'monthly', labelMm: 'လစဉ်' },
]

// Plain-language summaries so users never see raw cron/date configuration.
const AUTO_SEND_SUMMARY: Record<Frequency, string> = {
  daily: 'နေ့စဉ် မနက် ၈:၀၀ တွင် အလိုအလျောက် ပို့ပါမည်',
  weekly: 'အပတ်စဉ် တနင်္လာနေ့ မနက် ၈:၀၀ တွင် အလိုအလျောက် ပို့ပါမည်',
  monthly: 'လစဉ် ပထမရက် မနက် ၈:၀၀ တွင် အလိုအလျောက် ပို့ပါမည်',
}

// What the "on update" trigger watches — 'all' means overall site-level progress.
function getWatchSummary(target: string): string {
  if (target === 'all') return 'ဆိုက်တစ်ခုလုံး၏ တိုးတက်မှု အပ်ဒိတ် ဖြစ်ပေါ်လျှင် ပို့ပါမည်'
  const [kind, id] = target.split(':')
  if (kind === 'level') {
    const group = levelGroups.find((g) => g.id === id)
    return group ? `${group.labelMm} တွင် တိုးတက်မှု အပ်ဒိတ် ဖြစ်ပေါ်လျှင် ပို့ပါမည်` : ''
  }
  const course = levelGroups.flatMap((g) => g.courses).find((c) => c.id === id)
  return course ? `${course.titleMm ?? course.title} တွင် တိုးတက်မှု အပ်ဒိတ် ဖြစ်ပေါ်လျှင် ပို့ပါမည်` : ''
}

const INITIAL_EMAILS: EmailTag[] = [
  { value: 'teacher@example.com', valid: true },
  { value: 'admin@example.com', valid: true },
]

function ScheduleModeCard({
  selected,
  onSelect,
  label,
  description,
  children,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  description: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-md border transition-colors',
        selected ? 'border-primary/50 bg-accent/40' : 'border-border bg-card',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="flex w-full items-start gap-2.5 p-2.5 text-left"
      >
        <span
          className={cn(
            'mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-primary bg-primary' : 'border-border bg-card',
          )}
        >
          {selected && <span className="bg-primary-foreground size-1.5 rounded-full" />}
        </span>
        <span className="min-w-0">
          <span className="text-foreground font-myanmar block text-[12.5px] font-medium">{label}</span>
          <span className="text-muted-foreground font-myanmar mt-0.5 block text-[11px] leading-relaxed">
            {description}
          </span>
        </span>
      </button>
      {selected && children && <div className="px-2.5 pb-2.5">{children}</div>}
    </div>
  )
}

export function SchedulePanel() {
  const [mode, setMode] = useState<SendMode>('auto')
  const [frequency, setFrequency] = useState<Frequency>('weekly')
  const [watchTarget, setWatchTarget] = useState('all')
  const [emails, setEmails] = useState<EmailTag[]>(INITIAL_EMAILS)
  const [draft, setDraft] = useState('')
  const emailInputRef = useRef<HTMLInputElement>(null)
  const hasInvalid = emails.some((email) => !email.valid)

  function commitDraft() {
    const parts = draft
      .split(/[,,]/)
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length === 0) return

    setEmails((prev) => {
      const next = [...prev]
      for (const part of parts) {
        if (next.some((email) => email.value.toLowerCase() === part.toLowerCase())) continue
        next.push({ value: part, valid: EMAIL_PATTERN.test(part) })
      }
      return next
    })
    setDraft('')
  }

  function removeEmail(value: string) {
    setEmails((prev) => prev.filter((email) => email.value !== value))
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',' || event.key === ';') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && draft === '' && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Option A / Option B — the precise date & time picker stays hidden until asked for. */}
      <div role="radiogroup" aria-label="ပို့မည့် နည်းလမ်း" className="space-y-2">
        <ScheduleModeCard
          selected={mode === 'auto'}
          onSelect={() => setMode('auto')}
          label="ပုံမှန် အလိုအလျောက် ပို့မည်"
          description="စနစ်က အချိန်ဇယားနှင့်အညီ ကိုယ်စား ပို့ပေးပါမည်"
        >
          <PanelLabel>
            <span className="font-myanmar normal-case">မည်မျှမကြာခဏ ပို့မည်နည်း</span>
          </PanelLabel>
          <div role="radiogroup" aria-label="မည်မျှမကြာခဏ ပို့မည်နည်း" className="grid grid-cols-3 gap-1.5">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.value}
                type="button"
                role="radio"
                aria-checked={frequency === freq.value}
                onClick={() => setFrequency(freq.value)}
                className={cn(
                  'font-myanmar flex h-8 items-center justify-center rounded-md border text-[12px] font-medium transition-colors',
                  frequency === freq.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {freq.labelMm}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground font-myanmar mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed">
            <Clock className="mt-px size-3 shrink-0" />
            {AUTO_SEND_SUMMARY[frequency]}
          </p>
        </ScheduleModeCard>

        <ScheduleModeCard
          selected={mode === 'specific'}
          onSelect={() => setMode('specific')}
          label="သတ်မှတ်ချိန်မှ ပို့မည်"
          description="ရက်စွဲနှင့် အချိန် ကိုယ်တိုင် ရွေးချယ်နိုင်ပါသည်"
        >
          <PanelLabel>
            <span className="font-myanmar normal-case">အီးမေးလ် ပို့ရန် သတ်မှတ်မည်</span>
          </PanelLabel>
          <input
            type="datetime-local"
            aria-label="Send date and time"
            className="border-border bg-card text-foreground focus-visible:ring-ring/60 num h-9 w-full rounded-md border px-2.5 text-[12.5px] focus-visible:ring-2 focus-visible:outline-none"
          />
        </ScheduleModeCard>

        <ScheduleModeCard
          selected={mode === 'onUpdate'}
          onSelect={() => setMode('onUpdate')}
          label="အပ်ဒိတ် ဖြစ်ပေါ်ပါက ပို့မည်"
          description="တိုးတက်မှု အပ်ဒိတ် ရှိလျှင် ချက်ချင်း ပို့ပါမည်"
        >
          <PanelLabel>
            <span className="font-myanmar normal-case">စောင့်ကြည့်မည့် အတန်း / ဘာသာရပ်</span>
          </PanelLabel>
          <select
            value={watchTarget}
            onChange={(event) => setWatchTarget(event.target.value)}
            aria-label="စောင့်ကြည့်မည့် အတန်း / ဘာသာရပ်"
            className="border-border bg-card text-foreground focus-visible:ring-ring/60 font-myanmar h-9 w-full rounded-md border px-2.5 text-[12.5px] focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="all">ဆိုက်တစ်ခုလုံး</option>
            <optgroup label="အတန်း">
              {levelGroups.map((group) => (
                <option key={group.id} value={`level:${group.id}`}>
                  {group.labelMm}
                </option>
              ))}
            </optgroup>
            <optgroup label="ဘာသာရပ်">
              {levelGroups.flatMap((group) => group.courses).map((course) => (
                <option key={course.id} value={`course:${course.id}`}>
                  {course.titleMm ?? course.title}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-muted-foreground font-myanmar mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed">
            <Bell className="mt-px size-3 shrink-0" />
            {getWatchSummary(watchTarget)}
          </p>
        </ScheduleModeCard>
      </div>

      <div>
        <PanelLabel>
          <span className="font-myanmar normal-case">လက်ခံမည့် အီးမေးလ်များ</span>
        </PanelLabel>
        <PanelHint>
          <span className="font-myanmar">အီးမေးလ် ရိုက်ထည့်ပြီး Enter သို့မဟုတ် ကော်မာ နှိပ်ပါ</span>
        </PanelHint>
        <div
          onClick={() => emailInputRef.current?.focus()}
          className={cn(
            'bg-card focus-within:ring-ring/60 flex min-h-[46px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 transition-colors focus-within:ring-2 focus-within:outline-none',
            hasInvalid ? 'border-danger/60' : 'border-border',
          )}
        >
          {emails.map((email) => (
            <span
              key={email.value}
              className={cn(
                'flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-[11px] font-medium',
                email.valid ? 'bg-accent text-accent-foreground' : 'bg-danger/10 text-danger',
              )}
            >
              <span className="max-w-[180px] truncate">{email.value}</span>
              <button
                type="button"
                aria-label={`${email.value} ကို ဖယ်ရှားမည်`}
                onClick={() => removeEmail(email.value)}
                className="hover:bg-border/60 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors"
              >
                <X className="size-2.5 stroke-[3]" />
              </button>
            </span>
          ))}
          <input
            ref={emailInputRef}
            type="text"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleEmailKeyDown}
            onBlur={commitDraft}
            placeholder={emails.length === 0 ? 'teacher@gmail.com' : ''}
            aria-label="Recipient emails"
            aria-invalid={hasInvalid}
            className="placeholder:text-muted-foreground text-foreground min-w-[140px] flex-1 bg-transparent py-1 text-[12px] outline-none"
          />
        </div>
        {hasInvalid && (
          <p
            role="alert"
            className="text-danger font-myanmar mt-1.5 flex items-start gap-1 text-[11px] leading-relaxed"
          >
            <AlertCircle className="mt-px size-3 shrink-0" />
            ကျေးဇူးပြု၍ အီးမေးလ် လိပ်စာ မှန်ကန်စွာ ထည့်ပါ။
          </p>
        )}
      </div>

      <button
        type="button"
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors"
      >
        <Send className="size-3.5" />
        <span className="font-myanmar">အချိန်ဇယားကို သိမ်းဆည်းမည်</span>
      </button>
    </div>
  )
}
