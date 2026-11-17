import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DashboardData, EvidenceData } from '../types'

interface DataState {
  data: DashboardData | null
  evidence: EvidenceData | null
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataState>({ data: null, evidence: null, loading: true, error: null })

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [evidence, setEvidence] = useState<EvidenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [dashboardRes, evidenceRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/dashboard.json`),
          fetch(`${import.meta.env.BASE_URL}data/evidence.json`),
        ])
        if (!dashboardRes.ok) throw new Error(`Dashboard data request failed (${dashboardRes.status})`)
        if (!evidenceRes.ok) throw new Error(`Evidence data request failed (${evidenceRes.status})`)
        const [dashboard, ev] = await Promise.all([dashboardRes.json(), evidenceRes.json()])
        if (!cancelled) {
          setData(dashboard)
          setEvidence(ev)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load dashboard data')
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ data, evidence, loading, error }), [data, evidence, loading, error])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
