import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Database,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Search,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useData } from '../data/DataContext'
import { cx } from '../lib/cx'
import { teamColor } from '../lib/format'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/methodology', label: 'Methodology', icon: FlaskConical },
  { to: '/batting', label: 'Batting Rankings', icon: Trophy },
  { to: '/bowling', label: 'Bowling Rankings', icon: Target },
  { to: '/batters', label: 'Batter Explorer', icon: Users },
  { to: '/bowlers', label: 'Bowler Explorer', icon: Zap },
  { to: '/reliability', label: 'Reliability', icon: Activity },
  { to: '/data', label: 'Data & Downloads', icon: Database },
]

const TITLES: Record<string, string> = {
  '/': 'Overview',
  '/methodology': 'Methodology & Pressure Model',
  '/batting': 'Batting Rankings',
  '/bowling': 'Bowling Rankings',
  '/batters': 'Batter Explorer',
  '/bowlers': 'Bowler Explorer',
  '/reliability': 'Reliability & Sensitivity',
  '/data': 'Data & Downloads',
}

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="SupeRR Selector home">
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-royal-400/40 bg-gradient-to-br from-royal-500 to-royal-700 shadow-glow">
        <span className="font-display text-lg font-bold tracking-tighter text-white">RR</span>
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-royal-300">SupeRR</p>
        <p className="font-display text-lg font-semibold tracking-tight text-white">Selector</p>
      </div>
      <span className="ml-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-400">S2</span>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useData()
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Brand />
      </div>
      <div className="mx-5 glow-line" />
      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3 scrollbar-thin">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Workspace</p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => cx('nav-link', isActive && 'nav-link-active')}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <div className="rounded-2xl border border-white/[0.07] bg-ink-900/70 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Data window</p>
          <p className="mt-1 text-sm font-medium text-slate-200">IPL + T20I · 2022–2026</p>
          <p className="mt-2 text-xs text-slate-500">
            {data ? `${data.meta.matches.toLocaleString()} matches · ${data.meta.deliveries.toLocaleString()} deliveries` : 'Loading scope…'}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Model lock v1.0 · seed 20261117
          </div>
        </div>
      </div>
    </div>
  )
}

function GlobalSearch() {
  const { data } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    if (!data || query.trim().length < 2) return []
    const q = query.toLowerCase()
    const bats = data.players.batters
      .filter((p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ kind: 'bat' as const, id: p.id, name: p.name, team: p.team, score: p.score, rank: p.rank, eligibility: p.eligibility }))
    const bowls = data.players.bowlers
      .filter((p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ kind: 'bowl' as const, id: p.id, name: p.name, team: p.team, score: p.score, rank: p.rank, eligibility: p.eligibility }))
    return [...bats, ...bowls]
  }, [data, query])

  const go = (kind: 'bat' | 'bowl', id: number) => {
    setOpen(false)
    setQuery('')
    navigate(`/player/${kind}/${id}`)
  }

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="input h-10 pl-9 pr-12"
          placeholder="Search a player…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          aria-label="Search players"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 sm:block">
          /
        </kbd>
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-850/98 shadow-2xl backdrop-blur">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-400">No player found.</p>
          ) : (
            results.map((r) => (
              <button
                key={`${r.kind}-${r.id}`}
                type="button"
                onMouseDown={() => go(r.kind, r.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
              >
                <span className="h-7 w-7 shrink-0 rounded-lg border border-white/10" style={{ background: teamColor(r.team) }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{r.name}</span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {r.kind === 'bat' ? 'Batter' : 'Bowler'} · {r.team}
                  </span>
                </span>
                <span className="num text-xs text-slate-400">{r.score?.toFixed(1) ?? '—'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const { data } = useData()
  const path = location.pathname.startsWith('/player/') ? 'Player Profile' : TITLES[location.pathname] ?? 'Overview'
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl no-print">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} className="btn h-10 w-10 px-0 lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm sm:flex">
          <span className="text-slate-500">SupeRR Selector</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="truncate font-medium text-slate-200">{path}</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <span className="chip hidden md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-royal-400" />
            {data ? `${data.meta.fully_eligible.batters + data.meta.fully_eligible.bowlers} eligible` : 'Scope'}
          </span>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <GlobalSearch />
      </div>
    </header>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-white/[0.06] bg-ink-950/70 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-white/10 bg-ink-950 shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="animate-fade-in">{children}</main>
        <footer className="border-t border-white/[0.05] px-4 py-6 text-center text-xs text-slate-600 sm:px-6 lg:px-8 no-print">
          SupeRR Selector Season 2 · Pressure reliability model · IPL + T20I 2022–2026 · All figures computed from the supplied ball-by-ball data.
        </footer>
      </div>
    </div>
  )
}
