'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, GraduationCap, ShieldCheck, User } from 'lucide-react'
import { roleProfiles, type AppRole } from '@/lib/report-data'
import { useRole } from '@/components/role-provider'
import { cn } from '@/lib/utils'

const roleIcons: Record<AppRole, typeof ShieldCheck> = {
  manager: ShieldCheck,
  teacher: GraduationCap,
  student: User,
}

const roleTones: Record<AppRole, string> = {
  manager: 'bg-primary/10 text-primary',
  teacher: 'bg-warning/10 text-warning',
  student: 'bg-success/10 text-success',
}

// Profile switcher pinned to the top right of the result pane. It controls
// which sections stay visible for မန်နေဂျာ / ဆရာ / ကျောင်းသား.
export function RoleProfileMenu() {
  const { role, profile, setRole } = useRole()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close the menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const ActiveIcon = roleIcons[profile.role]

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="ကြည့်ရှုမည့် အခန်းကဏ္ဍ (Profile)"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'border-border bg-card hover:bg-surface flex items-center gap-2.5 rounded-md border py-1.5 pr-2 pl-1.5 transition-colors',
          open && 'bg-surface',
        )}
      >
        <span
          className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', roleTones[profile.role])}
        >
          <ActiveIcon className="size-4" />
        </span>

        {/* Username on top, account type (labelMm) underneath */}
        <span className="min-w-0 text-left">
          <span className="text-foreground num block truncate text-[12.5px] leading-tight font-medium">
            {profile.demoUser ?? profile.labelEn}
          </span>
          <span className="text-muted-foreground font-myanmar block truncate text-[10.5px] leading-tight">
            {profile.labelMm}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'text-muted-foreground size-3.5 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="ကြည့်ရှုမည့် အခန်းကဏ္ဍ (Profile)"
          className="border-border bg-popover absolute top-full right-0 z-30 mt-2 w-64 overflow-hidden rounded-lg border shadow-lg"
        >
          <p className="text-muted-foreground font-myanmar border-border bg-surface border-b px-3 py-2 text-[11px]">
            ကြည့်ရှုမည့် အခန်းကဏ္ဍကို ရွေးပါ
          </p>

          {roleProfiles.map((p) => {
            const Icon = roleIcons[p.role]
            const active = p.role === role
            return (
              <button
                key={p.role}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setRole(p.role)
                  setOpen(false)
                }}
                className={cn(
                  'hover:bg-surface flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors',
                  active && 'bg-accent/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                    roleTones[p.role],
                  )}
                >
                  <Icon className="size-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-foreground num truncate text-[12.5px] font-medium">
                      {p.demoUser ?? p.labelEn}
                    </span>
                    <span className="text-muted-foreground font-myanmar truncate text-[10.5px]">
                      {p.labelMm}
                    </span>
                  </span>
                  <span className="text-muted-foreground font-myanmar mt-0.5 block text-[11px] leading-relaxed">
                    {p.hintMm}
                  </span>
                </span>

                {active && <Check className="text-primary mt-1 size-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
