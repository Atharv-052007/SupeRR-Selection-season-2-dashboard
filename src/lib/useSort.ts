import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export function useSort<T>(rows: T[], initialKey: keyof T | string, initialDirection: SortDirection = 'desc') {
  const [key, setKey] = useState<string>(String(initialKey))
  const [direction, setDirection] = useState<SortDirection>(initialDirection)

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = (a as Record<string, unknown>)[key]
      const bv = (b as Record<string, unknown>)[key]
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return direction === 'asc' ? av - bv : bv - av
      }
      const cmp = String(av).localeCompare(String(bv))
      return direction === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, key, direction])

  const toggle = (nextKey: string) => {
    if (nextKey === key) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setKey(nextKey)
      setDirection(nextKey === 'name' || nextKey === 'team' || nextKey === 'eligibility' ? 'asc' : 'desc')
    }
  }

  return { sorted, key, direction, toggle }
}
