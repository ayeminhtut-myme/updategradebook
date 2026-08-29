import { BarChart3, Download, ExternalLink } from 'lucide-react'

export function ReportHeader() {
  return (
    <header className="border-border bg-card/80 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 lg:px-6">
        <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <BarChart3 className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-[14px] leading-tight font-semibold">
            myME Box LMS
          </h1>
          <p className="text-muted-foreground font-myanmar truncate text-[11px] leading-tight">
            သင်ယူလေ့လာမှု မှတ်တမ်း
          </p>
        </div>

        <button
          type="button"
          className="border-border bg-card hover:bg-surface text-foreground hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors sm:flex"
        >
          <ExternalLink className="size-3.5" />
          Open Grade Report
        </button>

        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>
    </header>
  )
}
