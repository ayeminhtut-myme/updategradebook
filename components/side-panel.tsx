'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SidePanel({
  icon,
  title,
  titleMm,
  meta,
  defaultOpen = false,
  children,
}: {
  icon: ReactNode
  title: string
  titleMm?: string
  meta?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-border bg-card overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:bg-surface flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
      >
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate text-[13px] font-semibold">{title}</span>
          {titleMm && (
            <span className="text-muted-foreground font-myanmar mt-0.5 block truncate text-[11px] leading-relaxed">
              {titleMm}
            </span>
          )}
        </span>
        {meta && !open && (
          <span className="num text-muted-foreground shrink-0 text-[11px] tabular-nums">{meta}</span>
        )}
        <ChevronDown
          className={cn(
            'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="border-border border-t px-3.5 py-3.5">{children}</div>}
    </section>
  )
}

export function PanelHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground mb-3 text-[11.5px] leading-relaxed">{children}</p>
  )
}

export function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground mb-1.5 block text-[11px] font-medium tracking-wide uppercase">
      {children}
    </span>
  )
}
