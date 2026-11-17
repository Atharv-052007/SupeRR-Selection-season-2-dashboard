import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 text-xs text-slate-500 sm:flex-row">
      <p>
        Showing <span className="num text-slate-300">{from.toLocaleString()}–{to.toLocaleString()}</span> of{' '}
        <span className="num text-slate-300">{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn h-8 px-2.5" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="num px-1 text-slate-400">{page + 1} / {pages}</span>
        <button type="button" className="btn h-8 px-2.5" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
