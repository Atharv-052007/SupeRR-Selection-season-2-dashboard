import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { SortDirection } from '../lib/useSort'
import { cx } from '../lib/cx'

export function SortHeader({
  label,
  column,
  activeKey,
  direction,
  onSort,
  align = 'left',
  title,
}: {
  label: string
  column: string
  activeKey: string
  direction: SortDirection
  onSort: (key: string) => void
  align?: 'left' | 'right'
  title?: string
}) {
  const active = activeKey === column
  return (
    <th className={align === 'right' ? 'text-right' : undefined} aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(column)}
        title={title ?? `Sort by ${label}`}
        className={cx('sort-btn', align === 'right' && 'w-full justify-end', active && 'text-white')}
      >
        {label}
        {active ? direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </button>
    </th>
  )
}
