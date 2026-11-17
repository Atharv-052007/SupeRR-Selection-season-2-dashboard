import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, FlaskConical, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../data/DataContext'
import { Badge, Container, InfoNote, Metric, PageHeader, ScoreBar, SectionHeader, StatCard } from '../components/ui'
import { SortHeader } from '../components/SortHeader'
import { useSort } from '../lib/useSort'
import { downloadCsv } from '../lib/csv'
import { fmt, int, pct, shortFormat, signed, teamColor } from '../lib/format'
import { AXIS_TICK_MUTED, GRID_STROKE, tooltipStyle } from '../lib/chart'
import type { BattingPlayer } from '../types'

const EXPORT_COLUMNS = [
  { key: 'rank', label: 'rank' },
  { key: 'name', label: 'player_name' },
  { key: 'team', label: 'team' },
  { key: 'formats', label: 'formats' },
  { key: 'innings', label: 'pressure_innings' },
  { key: 'balls', label: 'pressure_balls' },
  { key: 'runs', label: 'runs' },
  { key: 'SR', label: 'strike_rate' },
  { key: 'average', label: 'average' },
  { key: 'lift_SR', label: 'strike_rate_lift' },
  { key: 'consistency', label: 'consistency' },
  { key: 'score', label: 'reliability_score' },
  { key: 'boot_low', label: 'bootstrap_low' },
  { key: 'boot_high', label: 'bootstrap_high' },
  { key: 'top10_probability', label: 'top10_probability' },
  { key: 'eligibility', label: 'eligibility' },
]

function zColor(z: number) {
  const a = Math.min(Math.abs(z) / 3, 1)
  return z >= 0 ? `rgba(228,0,124,${0.12 + a * 0.55})` : `rgba(56,189,248,${0.12 + a * 0.45})`
}

export function BattingRankings() {
  const { data, evidence } = useData()
  const [scope, setScope] = useState<'full' | 'sampled'>('full')
  const [query, setQuery] = useState('')
  if (!data || !evidence) return null

  const top10 = data.rankings.batters
  const leader = data.players.batters.find((p) => p.id === top10[0].id)!
  const podium = top10.slice(1, 3).map((r) => data.players.batters.find((p) => p.id === r.id)!)
  const chartRows = top10.map((r) => {
    const low = r.boot_low ?? r.score
    const high = r.boot_high ?? r.score
    return {
      name: r.name.split(' ').slice(-1)[0],
      full: r.name,
      score: r.score,
      low,
      high,
      interval: [Math.max(0, r.score - low), Math.max(0, high - r.score)] as [number, number],
    }
  })
  const batEvidence = evidence.batters
  const componentKeys = batEvidence[0]?.components.map((c) => ({ key: c.key, label: c.label })) ?? []

  const pool = useMemo(
    () =>
      data.players.batters.filter((p) => {
        if (scope === 'full' && p.eligibility !== 'Fully Eligible') return false
        if (scope === 'sampled' && p.eligibility === 'Insufficient Evidence') return false
        if (query.trim() && !`${p.name} ${p.team} ${p.teams}`.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [data.players.batters, scope, query],
  )
  const { sorted, key, direction, toggle } = useSort<BattingPlayer>(pool, 'score', 'desc')

  const pressureShare = (() => {
    const rows = data.pressure.batting_categories
    const total = rows.reduce((a, r) => a + r.balls, 0)
    const high = rows.filter((r) => r.bat_pressure_cat === 'High' || r.bat_pressure_cat === 'Extreme').reduce((a, r) => a + r.balls, 0)
    return total ? (high / total) * 100 : 0
  })()

  const exportRows = sorted.map((p) => ({ ...p }))

  return (
    <Container>
      <PageHeader
        kicker="Final selection · Batters"
        title="The top 10 pressure batters"
        description="Ranked on High and Extreme pressure balls only. Every player clears the full eligibility bar — 200 pressure balls, 12 pressure innings and 10 matches — so no selection rests on a handful of cameos."
        action={
          <>
            <button type="button" className="btn" onClick={() => downloadCsv('superr_top10_batters.csv', top10.map((r) => ({ ...r })), [
              { key: 'rank', label: 'rank' }, { key: 'name', label: 'player_name' }, { key: 'team', label: 'team' },
              { key: 'score', label: 'score' }, { key: 'innings', label: 'pressure_innings' }, { key: 'balls', label: 'pressure_balls' },
              { key: 'runs', label: 'runs' }, { key: 'SR', label: 'strike_rate' }, { key: 'average', label: 'average' },
              { key: 'lift_SR', label: 'strike_rate_lift' }, { key: 'consistency', label: 'consistency' },
              { key: 'boot_low', label: 'bootstrap_low' }, { key: 'boot_high', label: 'bootstrap_high' },
            ])}>
              <Download className="h-4 w-4" /> Top 10 CSV
            </button>
            <Link to="/methodology" className="btn btn-primary"><FlaskConical className="h-4 w-4" /> Method</Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rank 1 score" value={fmt(top10[0].score, 1)} hint={`${top10[0].name} · ${top10[0].team}`} icon={<Trophy className="h-5 w-5" />} accent="gold" />
        <StatCard label="Cut-off score" value={fmt(top10[9].score, 1)} hint={`${top10[9].name} · rank 10`} icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Fully eligible pool" value={data.meta.fully_eligible.batters} hint={`${data.meta.limited.batters} more with a limited sample`} icon={<ShieldCheck className="h-5 w-5" />} accent="teal" />
        <StatCard label="Pressure share" value={pct(pressureShare)} hint="Of all batter balls faced, in the High + Extreme bands" icon={<Trophy className="h-5 w-5" />} />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Link
            to={`/player/bat/${leader.id}`}
            className="card card-hover group relative block overflow-hidden p-5"
            style={{ background: `linear-gradient(135deg, ${teamColor(leader.team)}2b 0%, rgba(255,255,255,0.03) 55%)` }}
          >
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: teamColor(leader.team) }} />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge className="border-gold-400/40 bg-gold-400/10 text-gold-300"><Trophy className="h-3 w-3" /> Rank 1 · Batter</Badge>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">{leader.name}</h2>
                <p className="text-sm text-slate-400">{leader.team} · {shortFormat(leader.formats)} · {leader.seasons}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Score</p>
                <p className="num text-4xl font-semibold text-white">{fmt(leader.score, 1)}</p>
              </div>
            </div>
            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Pressure SR" value={fmt(leader.SR, 1)} hint={`${leader.runs} runs / ${leader.balls} balls`} />
              <Metric label="Average" value={fmt(leader.average, 1)} hint={`${leader.innings} pressure innings`} />
              <Metric label="SR lift" value={signed(leader.lift_SR, 1)} hint={`Normal SR ${fmt(leader.normal_SR, 1)}`} tone={(leader.lift_SR ?? 0) >= 0 ? 'good' : 'bad'} />
              <Metric label="Consistency" value={fmt(leader.consistency, 2)} hint={`Top-10 probability ${fmt(leader.top10_probability, 2)}`} />
            </div>
            <div className="relative mt-4">
              <ScoreBar value={leader.score ?? 0} low={leader.boot_low} high={leader.boot_high} />
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                <span>Bootstrap {fmt(leader.boot_low, 1)}–{fmt(leader.boot_high, 1)}</span>
                <span className="inline-flex items-center gap-1 text-slate-400">Open full profile <ArrowRight className="h-3 w-3" /></span>
              </div>
            </div>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
          {podium.map((p) => (
            <Link key={p.id} to={`/player/bat/${p.id}`} className="card card-hover flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="num flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm text-slate-300">{p.rank}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-[11px] text-slate-500">{p.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="num text-lg font-semibold text-white">{fmt(p.score, 1)}</p>
                <p className="text-[10px] text-slate-500">SR {fmt(p.SR, 1)}</p>
              </div>
            </Link>
          ))}
          <Link to="/bowling" className="card card-hover flex items-center justify-between p-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4 text-royal-300" /> See the bowling top 10</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <p className="kicker mb-1">Score and uncertainty</p>
          <h3 className="font-display text-lg font-semibold text-white">Top 10 with 95% bootstrap intervals</h3>
          <p className="mt-1 text-xs text-slate-500">The bar is the locked score; the whisker is the player-level bootstrap interval.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartRows} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="name" tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} interval={0} angle={-24} textAnchor="end" height={54} />
                <YAxis domain={[0, 100]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload as { full: string; score: number; low: number; high: number }
                    return (
                      <div className="rounded-xl border border-white/10 bg-ink-850/98 px-3 py-2 text-xs shadow-xl">
                        <p className="font-semibold text-white">{p.full}</p>
                        <p className="mt-1 text-slate-300">Score <span className="num text-white">{fmt(p.score, 1)}</span></p>
                        <p className="text-slate-500">95% interval {fmt(p.low, 1)}–{fmt(p.high, 1)}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#E4007C">
                  {chartRows.map((r) => <Cell key={r.full} fill="#E4007C" />)}
                  <ErrorBar dataKey="interval" width={4} strokeWidth={1.5} stroke="#FFADD8" direction="y" />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <p className="kicker mb-1">Component profile</p>
          <h3 className="font-display text-lg font-semibold text-white">What drives each selection</h3>
          <p className="mt-1 text-xs text-slate-500">Standardised component scores (z). Magenta is above the eligible pool; blue is below.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[430px] border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="px-1.5 py-2 text-left font-medium text-slate-500">Player</th>
                  {componentKeys.map((c) => <th key={c.key} className="px-1 py-2 text-center font-medium text-slate-500">{c.label.replace('Pressure ', '').replace(' rate', '').replace('Ball ', '')}</th>)}
                </tr>
              </thead>
              <tbody>
                {batEvidence.map((p) => (
                  <tr key={p.player_id}>
                    <td className="whitespace-nowrap px-1.5 py-1.5 text-slate-300">
                      <Link to={`/player/bat/${p.player_id}`} className="hover:text-white">{p.player_name}</Link>
                    </td>
                    {p.components.map((c) => (
                      <td key={c.key} className="px-1 py-1.5 text-center">
                        <span className="num inline-block w-10 rounded px-1 py-1 text-[9px] text-white" style={{ background: zColor(c.z) }}>{signed(c.z, 2)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Every eligible batter"
          title="Full ranking table"
          description="Only fully eligible players can enter the final top 10. Switch to the sampled pool to see limited-sample players for transparency — they are scored for context but are not selectable."
          action={
            <button type="button" className="btn" onClick={() => downloadCsv('superr_batter_rankings.csv', exportRows, EXPORT_COLUMNS)}>
              <Download className="h-4 w-4" /> Export table
            </button>
          }
        />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {[
              { key: 'full' as const, label: `Fully eligible (${data.meta.fully_eligible.batters})` },
              { key: 'sampled' as const, label: `Include limited (${data.meta.fully_eligible.batters + data.meta.limited.batters})` },
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => setScope(t.key)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${scope === t.key ? 'bg-royal-500/20 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="input h-9 max-w-xs" placeholder="Filter by player or team…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter batters" />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortHeader label="Rank" column="rank" activeKey={key} direction={direction} onSort={toggle} />
                <SortHeader label="Player" column="name" activeKey={key} direction={direction} onSort={toggle} />
                <th>Team</th>
                <SortHeader label="Inns" column="innings" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Balls" column="balls" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Runs" column="runs" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="SR" column="SR" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Avg" column="average" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="SR lift" column="lift_SR" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Consistency" column="consistency" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Score" column="score" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <th className="text-right">95% interval</th>
                <th className="text-right">Top-10</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.rank ?? '—'}</td>
                  <td>
                    <Link to={`/player/bat/${p.id}`} className="font-medium text-white hover:text-royal-300">{p.name}</Link>
                    <p className="text-[10px] text-slate-500">{shortFormat(p.formats)}</p>
                  </td>
                  <td className="text-slate-400">{p.team}</td>
                  <td className="num text-right">{int(p.innings)}</td>
                  <td className="num text-right">{int(p.balls)}</td>
                  <td className="num text-right">{int(p.runs)}</td>
                  <td className="num text-right">{fmt(p.SR, 1)}</td>
                  <td className="num text-right">{fmt(p.average, 1)}</td>
                  <td className={`num text-right ${(p.lift_SR ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{signed(p.lift_SR, 1)}</td>
                  <td className="num text-right">{fmt(p.consistency, 2)}</td>
                  <td className="num text-right font-semibold text-white">{fmt(p.score, 1)}</td>
                  <td className="num text-right text-slate-400">{fmt(p.boot_low, 1)}–{fmt(p.boot_high, 1)}</td>
                  <td className="num text-right text-slate-400">{pct((p.top10_probability ?? 0) * 100, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">{sorted.length} players shown · sorted by {key} ({direction}) · scores are on a 0–100 scale.</p>
      </section>

      <section className="mt-8">
        <InfoNote>
          <strong className="text-white">How to read the ranking.</strong> The score rewards pressure output (strike rate 30%, average 22%, boundary rate 8%), the lift over the player's own normal level (20%), consistency (15%) and chase record (5%). Each component is measured against the format baseline and shrunk toward a positional prior, so a short hot streak cannot dominate the table. Full definitions are in <Link to="/methodology" className="text-royal-300 underline-offset-4 hover:underline">Methodology</Link>.
        </InfoNote>
      </section>
    </Container>
  )
}
