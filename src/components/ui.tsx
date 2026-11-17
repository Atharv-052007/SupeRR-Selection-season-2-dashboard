import type { ReactNode } from 'react'
import { ArrowUpRight, Info, ShieldCheck } from 'lucide-react'
import { cx } from '../lib/cx'
import { initials, teamColor } from '../lib/format'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('card', className)}>{children}</div>
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="kicker mb-1.5">{kicker}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl">
        <p className="kicker mb-2">{kicker}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">{description}</p>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'royal',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  accent?: 'royal' | 'teal' | 'gold'
}) {
  const accents = {
    royal: 'from-royal-500/20 to-transparent text-royal-300',
    teal: 'from-teal-500/20 to-transparent text-teal-300',
    gold: 'from-gold-500/20 to-transparent text-gold-300',
  }
  return (
    <div className="card card-hover relative overflow-hidden p-5">
      <div className={cx('pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl', accents[accent])} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <div className="num mt-2 text-3xl font-semibold text-white">{value}</div>
          {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && <div className={cx('rounded-xl border border-white/10 bg-white/[0.04] p-2', accents[accent].split(' ').pop())}>{icon}</div>}
      </div>
    </div>
  )
}

export function Metric({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink-900/60 px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cx('num mt-1 text-lg font-semibold', tone === 'good' ? 'text-emerald-300' : tone === 'bad' ? 'text-rose-300' : 'text-white')}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

export function Avatar({ name, team, size = 'md' }: { name: string; team: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }
  return (
    <div
      className={cx('relative flex shrink-0 items-center justify-center rounded-2xl border border-white/15 font-display font-bold text-white', sizes[size])}
      style={{ background: `linear-gradient(145deg, ${teamColor(team)}dd, ${teamColor(team)}66)` }}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}

export function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? 'border-gold-400/50 bg-gold-400/15 text-gold-300'
      : rank === 2
        ? 'border-slate-300/40 bg-slate-300/10 text-slate-200'
        : rank === 3
          ? 'border-amber-600/40 bg-amber-600/10 text-amber-300'
          : 'border-white/10 bg-white/[0.04] text-slate-400'
  return (
    <span className={cx('num inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold', tone)}>
      {rank}
    </span>
  )
}

export function ScoreBar({ value, low, high, tone = 'royal' }: { value: number; low?: number | null; high?: number | null; tone?: 'royal' | 'teal' }) {
  const gradient = tone === 'royal' ? 'from-royal-500 to-royal-300' : 'from-teal-500 to-teal-400'
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
      {low !== null && low !== undefined && high !== null && high !== undefined && (
        <div
          className="absolute inset-y-0 rounded-full bg-white/10"
          style={{ left: `${Math.max(0, low)}%`, width: `${Math.max(1, high - low)}%` }}
        />
      )}
      <div className={cx('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', gradient)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', className)}>{children}</span>
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/[0.06] p-4 text-sm leading-relaxed text-slate-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
      <div>{children}</div>
    </div>
  )
}

export function VerifiedNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm leading-relaxed text-slate-300">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
      <div>{children}</div>
    </div>
  )
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="inline-flex items-center gap-1 text-royal-300 underline-offset-4 hover:underline" href={href}>
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  )
}

export function Spinner({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-royal-400" />
      <p className="text-sm">{label}…</p>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      <p className="max-w-md text-sm text-slate-400">{description}</p>
    </div>
  )
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8', className)}>{children}</div>
}
