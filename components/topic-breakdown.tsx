'use client'

import { useMemo, useState } from 'react'
import type { TopicScore } from '@/lib/report-data'
import { topicColumns } from '@/lib/report-data'

function fmt(n: number) {
  return n === 0 ? '0%' : `${n}%`
}

export function TopicBreakdown({ topics }: { topics: TopicScore[] }) {
  const [showEmpty, setShowEmpty] = useState(false)
  const hasEmpty = useMemo(() => topics.some((t) => t.total === 0), [topics])
  const rows = showEmpty ? topics : topics.filter((t) => t.total > 0)

  const grand = useMemo(
    () => Math.round(topics.reduce((s, t) => s + t.total, 0) * 100) / 100,
    [topics],
  )

  return (
    <div className="border-border bg-surface/60 rounded-md border">
      <div className="overflow-x-auto">
        <table className="num w-full min-w-[420px] border-collapse text-[11.5px]">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground font-myanmar whitespace-nowrap px-3 py-1.5 text-left font-medium">
                သင်ခန်းစာနံပါတ်
              </th>
              {topicColumns.map((col) => (
                <th key={col} className="text-muted-foreground px-2 py-1.5 text-right font-medium">
                  {col}
                </th>
              ))}
              <th className="text-muted-foreground font-myanmar whitespace-nowrap px-3 py-1.5 text-right font-semibold">
                စုစုပေါင်း
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.topic} className="border-border/60 border-b last:border-b-0">
                <td className="text-foreground font-myanmar px-3 py-1.5 text-left">{t.topic}</td>
                <td className="text-muted-foreground px-2 py-1.5 text-right">{fmt(t.p)}</td>
                <td className="text-muted-foreground px-2 py-1.5 text-right">{fmt(t.a)}</td>
                <td className="text-muted-foreground px-2 py-1.5 text-right">{fmt(t.c)}</td>
                <td className="text-muted-foreground px-2 py-1.5 text-right">{fmt(t.m)}</td>
                <td className="text-muted-foreground px-2 py-1.5 text-right">{fmt(t.l)}</td>
                <td className="text-foreground px-3 py-1.5 text-right font-semibold">
                  {fmt(t.total)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={topicColumns.length + 2}
                  className="text-muted-foreground px-3 py-3 text-center"
                >
                  No topics with progress.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-border bg-muted/40 border-t">
              <td className="text-foreground font-myanmar whitespace-nowrap px-3 py-1.5 text-left font-semibold">
                စုစုပေါင်း
              </td>
              <td colSpan={topicColumns.length} />
              <td className="text-primary px-3 py-1.5 text-right font-semibold">{fmt(grand)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {hasEmpty && (
        <div className="border-border border-t px-3 py-1.5">
          <button
            type="button"
            onClick={() => setShowEmpty((v) => !v)}
            className="text-primary hover:underline text-[11px] font-medium"
          >
            {showEmpty ? 'Hide Empty Topics' : 'Show / Hide Empty Topics'}
          </button>
        </div>
      )}
    </div>
  )
}
