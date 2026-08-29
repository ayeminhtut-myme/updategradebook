'use client'

import { useState, type ReactNode } from 'react'
import { Check, Save } from 'lucide-react'
import { permissionMatrix, type RoleCapability } from '@/lib/report-data'
import { PanelHint } from '@/components/side-panel'
import { cn } from '@/lib/utils'

const columns: {
  key: keyof Omit<RoleCapability, 'role' | 'label'>
  label: string
  labelNode: ReactNode
}[] = [
  {
    key: 'filter',
    label: 'အသေးစိတ်ရှာမယ်',
    labelNode: (
      <>
        အသေးစိတ်
        <br />
        ရှာမယ်
      </>
    ),
  },
  {
    key: 'result',
    label: 'ရမှတ်ကြည့်မယ်',
    labelNode: (
      <>
        ရမှတ်
        <br />
        ကြည့်မယ်
      </>
    ),
  },
  {
    key: 'schedule',
    label: 'အလိုအလျောက်ပို့မယ်',
    labelNode: (
      <>
        အလိုအလျောက်
        <br />
        ပို့မယ်
      </>
    ),
  },
  { key: 'record', label: 'ပို့ပြီးမှတ်တမ်းကြည့်မယ်', labelNode: 'ပို့ပြီးမှတ်တမ်းကြည့်မယ်' },
]

function Cell({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'focus-visible:ring-ring/60 mx-auto flex size-[18px] items-center justify-center rounded-[5px] border transition-colors focus-visible:ring-2 focus-visible:outline-none',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card hover:border-primary/50',
      )}
    >
      {checked && <Check className="size-3 stroke-[3]" />}
    </button>
  )
}

export function PermissionsMatrix() {
  const [rows, setRows] = useState(permissionMatrix)

  const toggle = (role: string, key: keyof Omit<RoleCapability, 'role'>) =>
    setRows((prev) =>
      prev.map((r) => (r.role === role ? { ...r, [key]: !r[key] } : r)),
    )

  return (
    <div>
      <PanelHint>
        အခန်းကဏ္ဍအလိုက် လုပ်ဆောင်ခွင့်များကို ဤနေရာတွင် သတ်မှတ်ပေးပါ။
      </PanelHint>

      <div className="border-border overflow-x-auto rounded-md border">
        <table className="w-full table-fixed border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-surface">
              <th className="text-muted-foreground font-myanmar w-[30%] px-2.5 py-2 text-left font-medium">
                အမျိုးအစား
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-muted-foreground px-1 py-2 text-center font-medium"
                >
                  {c.labelNode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.role}
                className={cn('border-border', i !== 0 && 'border-t')}
              >
                <td className="text-foreground font-myanmar truncate px-2.5 py-1.5 text-[11px] leading-relaxed">
                  {row.label}
                </td>
                {columns.map((c) => (
                  <td key={c.key} className="px-1 py-1.5">
                    <Cell
                      checked={row[c.key]}
                      onToggle={() => toggle(row.role, c.key)}
                      label={`${c.label} for ${row.role}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors"
      >
        <Save className="size-3.5" />
        <span className="font-myanmar">အတည်ပြုမည်</span>
        <span className="opacity-70">(Save)</span>
      </button>
    </div>
  )
}
