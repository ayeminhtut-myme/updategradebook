'use client'

import { useState } from 'react'
import { Clock, Database, RefreshCw, Save, CalendarClock } from 'lucide-react'
import { scanMeta } from '@/lib/report-data'
import { PanelLabel } from '@/components/side-panel'

const AUTO_SCAN_OPTIONS = [
  { value: 'preSend', label: 'မပို့မှီနာရီဝက်အလို' },
  { value: 'daily', label: 'နေ့စဉ်' },
  { value: 'weekly', label: 'အပတ်စဉ်' },
  { value: 'monthly', label: 'လစဉ်' },
  { value: 'manual', label: 'အလိုအလျောက်စနစ်ပိတ်သည်' },
]

export function LearnerScanner() {
  const [scanning, setScanning] = useState(false)
  const [autoScan, setAutoScan] = useState(AUTO_SCAN_OPTIONS[0].value)
  const autoScanLabel =
    AUTO_SCAN_OPTIONS.find((option) => option.value === autoScan)?.label ?? AUTO_SCAN_OPTIONS[0].label

  const cachePct = Math.round((scanMeta.activeLearners / scanMeta.totalStudents) * 100)

  return (
    <div>
      <div className="border-border bg-surface rounded-md border p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
            <Database className="size-3.5" />
            မှတ်သားထားသောအကြောင်းအရာ
          </span>
          <span className="num text-foreground text-[12px] font-semibold">
            {scanMeta.activeLearners} / {scanMeta.totalStudents}
          </span>
        </div>

        <div className="bg-muted mt-2.5 h-1.5 overflow-hidden rounded-full">
          <div className="bg-primary h-full rounded-full" style={{ width: `${cachePct}%` }} />
        </div>

        <p className="text-muted-foreground font-myanmar mt-2.5 text-[11px] leading-relaxed">
          📊 လက်ရှိ စာရင်း: လေ့လာသူ {scanMeta.totalStudents.toLocaleString()} ယောက်အနက်{' '}
          {scanMeta.activeLearners.toLocaleString()} ယောက် ရှိပါသည်။
        </p>

        <dl className="text-muted-foreground mt-3 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3 shrink-0" />
            <dt className="sr-only">Last scan</dt>
            <dd className="font-myanmar leading-relaxed">
              နောက်ဆုံးစာရင်းစစ်ခဲ့သောအချိန်: {scanMeta.lastScanMm}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3 shrink-0" />
            <dt className="sr-only">Auto scan</dt>
            <dd className="font-myanmar leading-relaxed">
              အလိုအလျောက်စစ်မည်: {autoScanLabel}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setScanning(true)
            setTimeout(() => setScanning(false), 1600)
          }}
          className="bg-[#1877F2] hover:bg-[#0f6fe0] text-white flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-[12px] font-semibold shadow-sm transition-colors"
        >
          <RefreshCw
            className={`size-3.5 ${scanning ? 'animate-spin' : ''}`}
            style={{ position: 'relative', left: '-8%' }}
          />
          <span 
            className="font-myanmar"
            style={{ textAlign: 'left' }}> ကျောင်းသားစာရင်း<br/>ပြန်စစ်မည်</span>
        </button>
        <button
          type="button"
          className="border-danger/30 text-danger hover:bg-danger/10 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-[12px] font-medium transition-colors"
        >
          <span className="font-myanmar">🧹 စာရင်းအဟောင်း<br/>ရှင်းမည်</span>
        </button>
      </div>

      <div className="border-border mt-4 border-t pt-3.5">
        <PanelLabel>
          <span className="font-myanmar"><b>အလိုအလျောက်စနစ်</b>
          </span>
        </PanelLabel>
        <p className="text-muted-foreground font-myanmar mb-3 text-[11.5px] leading-relaxed">
          ကျောင်းသားစာရင်းကို အလိုအလျောက် စာရင်းစစ်ရန် ရွေးချယ်နိုင်သည်။
        </p>
        <div className="flex gap-2">
          <select
            value={autoScan}
            onChange={(e) => setAutoScan(e.target.value)}
            aria-label="Auto-scan frequency"
            className="border-border bg-card text-foreground focus-visible:ring-ring/60 h-8 flex-1 rounded-md border px-2 text-[12px] focus-visible:ring-2 focus-visible:outline-none"
          >
            {AUTO_SCAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="border-border bg-card hover:bg-surface text-foreground flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors"
          >
            <Save className="size-3.5" />
            <span className="font-myanmar">မှတ်သားမည်</span>
          </button>
        </div>
      </div>
    </div>
  )
}