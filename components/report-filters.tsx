'use client'

import { useMemo } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import {
  availableFilterOptions,
  emptyFilters,
  filterOptionsForCourses,
  pruneFilters,
  type Course,
  type FilterFacet,
  type FilterOption,
  type FilterSelection,
  type FilterUiState,
} from '@/lib/report-data'
import { cn } from '@/lib/utils'

type FacetConfig = {
  facet: FilterFacet
  labelMm: string
  options: FilterOption[]
  /** Teacher usernames are latin — render with tabular numerals */
  latin?: boolean
}

// Top-down order: နေရာ → အတန်း → ဘာသာရပ် → ဆရာ. Options come from the course
// pool (site-wide, or only the teacher's own courses) and each facet narrows
// the others (see availableFilterOptions in report-data).
function buildFacets(pool: Course[], hiddenFacets: FilterFacet[] = []): FacetConfig[] {
  const options = filterOptionsForCourses(pool)
  const facets: FacetConfig[] = [
    { facet: 'schools', labelMm: 'အဖွဲ့ / နေရာ / အတန်း', options: options.schools },
    { facet: 'levels', labelMm: 'အတန်း', options: options.levels },
    { facet: 'courses', labelMm: 'ဘာသာရပ်', options: options.courses },
    {
      facet: 'teachers',
      labelMm: 'သင်ကြားသည့် ဆရာ/ဆရာမ',
      options: options.teachers,
      latin: true,
    },
  ]
  return facets.filter((facet) => !hiddenFacets.includes(facet.facet))
}

function setFacet(facets: FilterSelection, facet: FilterFacet, ids: string[]): FilterSelection {
  switch (facet) {
    case 'schools':
      return { ...facets, schools: ids }
    case 'levels':
      return { ...facets, levels: ids }
    case 'courses':
      return { ...facets, courses: ids }
    case 'teachers':
      return { ...facets, teachers: ids }
  }
}

function FacetGroup({
  config,
  value,
  available,
  onChange,
}: {
  config: FacetConfig
  value: FilterUiState
  available: string[]
  onChange: (next: FilterUiState) => void
}) {
  const selected = value.facets[config.facet]

  function toggle(id: string) {
    const nextSel = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]
    onChange({ ...value, facets: pruneFilters(setFacet(value.facets, config.facet, nextSel)) })
  }

  function clearFacet() {
    onChange({ ...value, facets: pruneFilters(setFacet(value.facets, config.facet, [])) })
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-myanmar block text-[11px] font-medium tracking-wide">
          {config.labelMm}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearFacet}
            className="text-primary font-myanmar shrink-0 text-[10.5px] font-medium hover:underline"
          >
            အားလုံး
          </button>
        )}
      </div>

      <div className="space-y-1">
        {config.options.map((option) => {
          const isSelected = selected.includes(option.id)
          const isAvailable = available.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={!isAvailable}
              onClick={() => toggle(option.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors',
                isSelected
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-transparent hover:bg-surface',
                !isAvailable && 'cursor-not-allowed opacity-35 hover:bg-transparent',
              )}
            >
              <span
                className={cn(
                  'flex size-[16px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card',
                )}
              >
                {isSelected && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-[12px]',
                  isSelected ? 'text-foreground font-medium' : 'text-foreground/85',
                  config.latin && 'num',
                )}
              >
                {option.labelMm}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ReportFilters({
  value,
  onChange,
  pool,
  hiddenFacets = [],
}: {
  value: FilterUiState
  onChange: (next: FilterUiState) => void
  /** Courses the viewer is allowed to see — options are derived from these */
  pool: Course[]
  /** Facets hidden for this viewer (e.g. a teacher never filters by ဆရာ) */
  hiddenFacets?: FilterFacet[]
}) {
  const facets = buildFacets(pool, hiddenFacets)
  const available = useMemo(() => availableFilterOptions(value.facets, pool), [value.facets, pool])

  return (
    <div className="space-y-3.5">
      <p className="text-muted-foreground font-myanmar text-[11px] leading-relaxed">
        အပေါ်မှ အောက်သို့ ရွေးချယ်ပါ — အတန်းရွေးပါက ထိုအတန်းတွင် သင်ကြားနေသော ဘာသာရပ်များသာ
        ရွေးနိုင်ပါသည်။
      </p>

      {facets.map((config) => (
        <FacetGroup
          key={config.facet}
          config={config}
          value={value}
          available={available[config.facet]}
          onChange={onChange}
        />
      ))}

      <label className="border-border bg-surface flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={value.activeOnly}
          aria-label="တိုးတက်မှုရှိသော လေ့လာသူများသာ"
          onClick={() => onChange({ ...value, activeOnly: !value.activeOnly })}
          className={cn(
            'mt-px flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
            value.activeOnly
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card',
          )}
        >
          {value.activeOnly && <Check className="size-3 stroke-[3]" />}
        </button>
        <span className="min-w-0">
          <span className="text-foreground font-myanmar block text-[12.5px] font-medium">
            တိုးတက်မှုရှိသော လေ့လာသူများသာ
          </span>
        </span>
      </label>

      <button
        type="button"
        onClick={() => onChange({ facets: emptyFilters, activeOnly: value.activeOnly })}
        className="text-muted-foreground hover:text-foreground font-myanmar flex items-center gap-1.5 text-[11.5px] font-medium transition-colors"
      >
        <RotateCcw className="size-3" />
        နဂိုအတိုင်း ပြန်လည်သတ်မှတ်မည်
      </button>
    </div>
  )
}

