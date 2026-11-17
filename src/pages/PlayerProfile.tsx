import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Gauge,
  Info,
  ShieldCheck,
  Target,
  Trophy,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../data/DataContext'
import { Avatar, Badge, Container, InfoNote, Metric, ScoreBar, SectionHeader } from '../components/ui'
import { fmt, int, pct, shortFormat, signed } from '../lib/format'
import { AXIS_TICK_MUTED, GRID_STROKE, tooltipStyle } from '../lib/chart'
import type { BattingPlayer, BowlingPlayer } from '../types'

type Kind = 'bat' | 'bowl'

const METRIC_LABELS: Record<string, string> = {
  sr: 'Strike rate',
  avg: 'Average',
  boundary: 'Boundary rate',
  lift: 'Pressure lift',
  consistency: 'Consistency',
  chase: 'Chase record',
  econ: 'Economy',
  wkt_rate: 'Wicket rate',
  dot: 'Dot-ball rate',
  defend: 'Defence record',
}

function BarList({ rows, tone }: { rows: { label: string; value: number; hint?: string }[]; tone: 'royal' | 'teal' }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)))
  const grad = tone === 'royal' ? 'from-royal-500 to-royal-300' : 'from-teal-500 to-teal-400'
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-300">{r.label}</span>
            <span className="num text-slate-400">{r.hint ?? fmt(r.value, 2)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${(Math.abs(r.value) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CompareRow({ label, pressure, normal, lowerBetter = false }: { label: string; pressure: number | null; normal: number | null; lowerBetter?: boolean }) {
  const diff = pressure !== null && normal !== null ? pressure - normal : null
  const good = diff === null ? false : lowerBetter ? diff < 0 : diff > 0
  return (
    <tr>
      <td className="text-slate-400">{label}</td>
      <td className="num text-right text-white">{fmt(pressure, 2)}</td>
      <td className="num text-right text-slate-400">{fmt(normal, 2)}</td>
      <td className={`num text-right ${diff === null ? 'text-slate-500' : good ? 'text-emerald-300' : 'text-rose-300'}`}>{signed(diff, 2)}</td>
    </tr>
  )
}

export function PlayerProfile() {
  const { kind, id } = useParams<{ kind: string; id: string }>()
  const { data, evidence } = useData()
  if (!data || !evidence) return null

  const k: Kind = kind === 'bowl' ? 'bowl' : 'bat'
  const playerId = Number(id)
  const player = (k === 'bat' ? data.players.batters : data.players.bowlers).find((p) => p.id === playerId) as
    | (BattingPlayer & BowlingPlayer)
    | undefined
  const ev = (k === 'bat' ? evidence.batters : evidence.bowlers).find((p) => p.player_id === playerId)

  if (!player) {
    return (
      <Container>
        <div className="card p-10 text-center">
          <h1 className="font-display text-xl font-semibold text-white">Player not found</h1>
          <p className="mt-2 text-sm text-slate-400">The requested player is not in the scored dataset.</p>
          <Link to="/batting" className="btn mt-5">Back to rankings</Link>
        </div>
      </Container>
    )
  }

  const isBat = k === 'bat'
  const role = isBat ? 'Batter' : 'Bowler'
  const top10 = (isBat ? data.rankings.batters : data.rankings.bowlers).some((r) => r.id === player.id)
  const accentTone = isBat ? 'royal' : 'teal'
  const scoringWeights = isBat ? data.meta.bat_weights : data.meta.bowl_weights

  const pressureRows = isBat
    ? [
        { label: 'Strike rate', value: player.SR ?? 0, hint: fmt(player.SR, 1) },
        { label: 'Average', value: player.average ?? 0, hint: fmt(player.average, 1) },
        { label: 'Boundary rate', value: player.boundary_pct ?? 0, hint: pct(player.boundary_pct) },
        { label: 'Dot-ball rate', value: player.dot_pct ?? 0, hint: pct(player.dot_pct) },
        { label: 'Consistency', value: (player.consistency ?? 0) * 100, hint: fmt(player.consistency, 2) },
      ]
    : [
        { label: 'Economy', value: player.economy ?? 0, hint: fmt(player.economy, 2) },
        { label: 'Average', value: player.average ?? 0, hint: fmt(player.average, 2) },
        { label: 'Balls per wicket', value: player.strike_rate ?? 0, hint: fmt(player.strike_rate, 1) },
        { label: 'Dot-ball rate', value: player.dot_pct ?? 0, hint: pct(player.dot_pct) },
        { label: 'Boundary rate', value: player.boundary_pct ?? 0, hint: pct(player.boundary_pct) },
      ]

  return (
    <Container>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-white">Overview</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={isBat ? '/batting' : '/bowling'} className="hover:text-white">{role} rankings</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">{player.name}</span>
      </nav>

      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${isBat ? 'bg-royal-500/20' : 'bg-teal-500/20'}`} />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={player.name} team={player.team} size="xl" />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className={isBat ? 'border-royal-400/40 bg-royal-400/10 text-royal-300' : 'border-teal-400/40 bg-teal-400/10 text-teal-300'}>
                  {isBat ? <Trophy className="h-3 w-3" /> : <Target className="h-3 w-3" />} {role}
                </Badge>
                {top10 && <Badge className="border-gold-400/40 bg-gold-400/10 text-gold-300">Final top 10 · rank {player.rank}</Badge>}
                <Badge className="border-white/10 bg-white/[0.04] text-slate-300">{player.eligibility}</Badge>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{player.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{player.team} · {shortFormat(player.formats)} · {player.matches} matches</p>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">{player.seasons} · {player.teams}</p>
            </div>
          </div>
          <div className="flex items-end gap-5">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reliability score</p>
              <p className="num text-5xl font-semibold text-white">{fmt(player.score, 1)}</p>
              <p className="mt-1 text-[11px] text-slate-500">{player.eligibility === 'Fully Eligible' ? 'Ranked selection pool' : 'Not selectable for the final 10'}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isBat ? (
            <>
              <Metric label="Pressure SR" value={fmt(player.SR, 1)} hint={`${int(player.runs)} runs / ${int(player.balls)} pressure balls`} />
              <Metric label="Pressure average" value={fmt(player.average, 1)} hint={`${int(player.innings)} pressure innings`} />
              <Metric label="SR lift vs normal" value={signed(player.lift_SR, 1)} hint={`Normal SR ${fmt(player.normal_SR, 1)}`} tone={(player.lift_SR ?? 0) >= 0 ? 'good' : 'bad'} />
              <Metric label="Bootstrap 95%" value={`${fmt(player.boot_low, 1)}–${fmt(player.boot_high, 1)}`} hint={`Top-10 probability ${pct((player.top10_probability ?? 0) * 100, 0)}`} />
            </>
          ) : (
            <>
              <Metric label="Pressure economy" value={fmt(player.economy, 2)} hint={`${int(player.wickets)} wickets / ${int(player.balls)} balls`} />
              <Metric label="Pressure average" value={fmt(player.average, 2)} hint={`${fmt(player.strike_rate, 1)} balls per wicket`} />
              <Metric label="Economy improvement" value={signed(player.lift_economy, 2)} hint={`Normal economy ${fmt(player.normal_economy, 2)} · positive is better`} tone={(player.lift_economy ?? 0) >= 0 ? 'good' : 'bad'} />
              <Metric label="Bootstrap 95%" value={`${fmt(player.boot_low, 1)}–${fmt(player.boot_high, 1)}`} hint={`Top-10 probability ${pct((player.top10_probability ?? 0) * 100, 0)}`} />
            </>
          )}
        </div>

        <div className="relative mt-4">
          <ScoreBar value={player.score ?? 0} low={player.boot_low} high={player.boot_high} tone={accentTone} />
          <span className="mt-1.5 block text-[10px] text-slate-500">Bootstrap interval for the score. Wide intervals are disclosed, not hidden.</span>
        </div>
      </section>

      {ev ? (
        <>
          <section className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="card p-5 xl:col-span-2">
              <p className="kicker mb-1">Selection case</p>
              <h2 className="font-display text-lg font-semibold text-white">Why this player ranks here</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {isBat ? (
                  <>
                    Across <span className="text-white">{int(ev.pressure.balls)} pressure balls</span> in {int(ev.pressure.innings)} innings, {player.name} scored {int(ev.pressure.runs)} runs at a strike rate of{' '}
                    <span className="text-white">{fmt(ev.pressure.SR, 1)}</span> and an average of <span className="text-white">{fmt(ev.pressure.average, 1)}</span>.
                    The strike-rate lift over the player's own normal level is <span className={ev.lift.SR !== null && ev.lift.SR >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{signed(ev.lift.SR, 1)}</span>.
                  </>
                ) : (
                  <>
                    Across <span className="text-white">{int(ev.pressure.balls)} pressure balls</span> in {int(ev.pressure.innings)} innings, {player.name} took {int(ev.pressure.wickets)} wickets at an economy of{' '}
                    <span className="text-white">{fmt(ev.pressure.economy, 2)}</span> and an average of <span className="text-white">{fmt(ev.pressure.average, 2)}</span>.
                    The economy improvement over the player's own normal level is <span className={ev.lift.economy !== null && ev.lift.economy >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{signed(ev.lift.economy, 2)}</span> runs per over (normal minus pressure; positive is better).
                  </>
                )}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                The bootstrap places the score between <span className="text-white">{fmt(ev.bootstrap.score_ci_low, 1)}</span> and{' '}
                <span className="text-white">{fmt(ev.bootstrap.score_ci_high, 1)}</span>, with a median rank interval of{' '}
                <span className="text-white">{fmt(ev.bootstrap.rank_ci_low, 0)}–{fmt(ev.bootstrap.rank_ci_high, 0)}</span>. The player appeared in{' '}
                <span className="text-white">{pct((ev.bootstrap.top10_probability ?? 0) * 100, 0)}</span> of 1,000 bootstrap top 10s.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {Object.entries(ev.context.categories).map(([cat, balls]) => (
                  <div key={cat} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-ink-900/60 px-3 py-2 text-xs">
                    <span className="text-slate-400">{cat} pressure</span>
                    <span className="num text-slate-200">{int(balls)} balls</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <p className="kicker mb-1">Component contribution</p>
              <h2 className="font-display text-lg font-semibold text-white">Standardised score drivers</h2>
              <p className="mt-1 text-xs text-slate-500">Weighted z-scores sum to the raw model score before scaling.</p>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...ev.components].sort((a, b) => b.weighted_z - a.weighted_z)} layout="vertical" margin={{ top: 4, right: 10, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" width={92} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [signed(v, 2), n === 'weighted_z' ? 'Weighted z' : 'z']} />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
                    <Bar dataKey="weighted_z" radius={[0, 4, 4, 0]}>
                      {ev.components.map((c) => <Cell key={c.key} fill={c.weighted_z >= 0 ? (isBat ? '#F94AA3' : '#2DD4BF') : '#3B82F6'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="card p-5">
              <p className="kicker mb-1">Pressure vs normal</p>
              <h2 className="font-display text-lg font-semibold text-white">Does the player rise or fade?</h2>
              <p className="mt-1 text-xs text-slate-500">Pressure sample against the same player's Normal-pressure deliveries. Green is an improvement in the desired direction.</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.07]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-850/80 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2 text-left font-medium">Metric</th>
                      <th className="px-3 py-2 text-right font-medium">Pressure</th>
                      <th className="px-3 py-2 text-right font-medium">Normal</th>
                      <th className="px-3 py-2 text-right font-medium" title="Pressure minus normal. For economy, a positive change is worse.">Change (P−N)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {isBat ? (
                      <>
                        <CompareRow label="Strike rate" pressure={ev.pressure.SR} normal={ev.normal.SR} />
                        <CompareRow label="Average" pressure={ev.pressure.average} normal={ev.normal.average} />
                        <CompareRow label="Boundary rate %" pressure={ev.pressure.boundary_pct} normal={ev.normal.boundary_pct} />
                        <CompareRow label="Dot-ball rate %" pressure={ev.pressure.dot_pct} normal={ev.normal.dot_pct} lowerBetter />
                      </>
                    ) : (
                      <>
                        <CompareRow label="Economy" pressure={ev.pressure.economy} normal={ev.normal.economy} lowerBetter />
                        <CompareRow label="Average" pressure={ev.pressure.average} normal={ev.normal.average} lowerBetter />
                        <CompareRow label="Dot-ball rate %" pressure={ev.pressure.dot_pct} normal={ev.normal.dot_pct} />
                        <CompareRow label="Boundary rate %" pressure={ev.pressure.boundary_pct} normal={ev.normal.boundary_pct} lowerBetter />
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <BarList rows={pressureRows} tone={accentTone} />
              </div>
            </div>

            <div className="card p-5">
              <p className="kicker mb-1">Score weights</p>
              <h2 className="font-display text-lg font-semibold text-white">How the model values each skill</h2>
              <p className="mt-1 text-xs text-slate-500">Fixed before the final rankings; sensitivity to these weights is reported.</p>
              <div className="mt-4 space-y-2.5">
                {Object.entries(scoringWeights).map(([k2, w]) => (
                  <div key={k2}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{METRIC_LABELS[k2] ?? k2.replace('_', ' ')}</span><span className="num text-slate-400">{pct(w * 100, 0)}</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className={`h-full rounded-full bg-gradient-to-r ${isBat ? 'from-royal-500 to-royal-300' : 'from-teal-500 to-teal-400'}`} style={{ width: `${w * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 text-xs leading-relaxed text-slate-400">
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-200"><ShieldCheck className="h-3.5 w-3.5" /> Reliability controls</p>
                <p>Empirical-Bayes shrinkage toward the positional prior, format-relative baselines, and a minimum sample rule. The eligibility bar for this role is {isBat ? `${data.meta.eligibility.batting.full_balls} balls / ${data.meta.eligibility.batting.full_inn} innings` : `${data.meta.eligibility.bowling.full_balls} balls / ${data.meta.eligibility.bowling.full_inn} innings`}.</p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <p className="kicker mb-0.5">Context split</p>
                <h2 className="font-display text-lg font-semibold text-white">By phase</h2>
              </div>
              <div className="table-wrap rounded-none border-0">
                <table className="data-table min-w-[420px]">
                  <thead><tr><th>Phase</th><th className="text-right">Balls</th><th className="text-right">{isBat ? 'Runs' : 'Wickets'}</th><th className="text-right">{isBat ? 'SR' : 'Economy'}</th><th className="text-right">{isBat ? 'Dismissals' : 'Runs'}</th></tr></thead>
                  <tbody>
                    {ev.context.by_phase.map((r) => (
                      <tr key={r.phase}>
                        <td className="text-slate-300">{r.phase}</td>
                        <td className="num text-right">{int(r.balls)}</td>
                        <td className="num text-right">{int(isBat ? r.runs : r.wickets)}</td>
                        <td className="num text-right">{fmt(isBat ? r.SR : r.econ, isBat ? 1 : 2)}</td>
                        <td className="num text-right">{int(isBat ? r.dismissals : r.runs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ev.context.by_season} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                      <XAxis dataKey="season" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [fmt(v, isBat ? 1 : 2), isBat ? 'SR' : 'Economy']} />
                      <Bar dataKey={isBat ? 'SR' : 'econ'} radius={[4, 4, 0, 0]} fill={isBat ? '#E4007C' : '#00A6A6'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-center text-[10px] text-slate-500">{isBat ? 'Strike rate' : 'Economy'} by season</p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <p className="kicker mb-0.5">Context split</p>
                <h2 className="font-display text-lg font-semibold text-white">By format</h2>
              </div>
              <div className="table-wrap rounded-none border-0">
                <table className="data-table min-w-[420px]">
                  <thead><tr><th>Format</th><th className="text-right">Balls</th><th className="text-right">{isBat ? 'Runs' : 'Wickets'}</th><th className="text-right">{isBat ? 'SR' : 'Economy'}</th><th className="text-right">{isBat ? 'Dismissals' : 'Runs'}</th></tr></thead>
                  <tbody>
                    {ev.context.by_format.map((r) => (
                      <tr key={r.format}>
                        <td className="text-slate-300">{r.format === 'T20' ? 'IPL (T20)' : 'T20I'}</td>
                        <td className="num text-right">{int(r.balls)}</td>
                        <td className="num text-right">{int(isBat ? r.runs : r.wickets)}</td>
                        <td className="num text-right">{fmt(isBat ? r.SR : r.econ, isBat ? 1 : 2)}</td>
                        <td className="num text-right">{int(isBat ? r.dismissals : r.runs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/[0.06] px-5 py-4 text-xs leading-relaxed text-slate-400">
                A single-format player is not penalised for the missing format. The reliability model uses the format of each delivery and the available sample; the split is shown for transparency.
              </div>
              <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                <Metric label="Top-10 probability" value={pct((ev.bootstrap.top10_probability ?? 0) * 100, 0)} hint="Bootstrap replicates" />
                <Metric label="Rank interval" value={`${fmt(ev.bootstrap.rank_ci_low, 0)}–${fmt(ev.bootstrap.rank_ci_high, 0)}`} hint={`Median rank ${fmt(ev.bootstrap.rank_median, 0)}`} />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <SectionHeader kicker="Innings evidence" title="Highest-pressure innings in the sample" description="Ranked by peak pressure reached during the innings, not by runs alone. Every row is traceable to a match in the cleaned delivery data." />
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Opponent</th><th>Format</th><th>Season</th>
                    {isBat ? <><th className="text-right">Runs</th><th className="text-right">Balls</th><th className="text-right">SR</th><th className="text-right">Out</th></> : <><th className="text-right">Balls</th><th className="text-right">Runs</th><th className="text-right">Wkts</th><th className="text-right">Econ</th></>}
                    <th className="text-right">Peak pressure</th><th className="text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {ev.context.top_innings.map((inn) => (
                    <tr key={`${inn.match_id}-${inn.date}`}>
                      <td className="whitespace-nowrap text-slate-400">{inn.date}</td>
                      <td className="text-slate-300">{inn.opponent}</td>
                      <td className="text-slate-400">{inn.format === 'T20' ? 'IPL' : 'T20I'}</td>
                      <td className="text-slate-400">{inn.season}</td>
                      {isBat ? (
                        <>
                          <td className="num text-right font-semibold text-white">{int(inn.runs)}</td>
                          <td className="num text-right">{int(inn.balls)}</td>
                          <td className="num text-right">{fmt(inn.SR, 1)}</td>
                          <td className="num text-right">{inn.dismissed ? 'Yes' : 'No'}</td>
                        </>
                      ) : (
                        <>
                          <td className="num text-right">{int(inn.balls)}</td>
                          <td className="num text-right">{int(inn.runs)}</td>
                          <td className="num text-right font-semibold text-white">{int(inn.wickets)}</td>
                          <td className="num text-right">{fmt(inn.econ, 2)}</td>
                        </>
                      )}
                      <td className="num text-right">{fmt(inn.pressure, 1)}</td>
                      <td className="text-right"><span className={inn.won ? 'text-emerald-300' : 'text-slate-400'}>{inn.won ? 'Won' : 'Lost'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <InfoNote>
              <strong className="text-white">Reading the uncertainty.</strong> The bootstrap interval resamples the player's pressure innings with replacement. It captures innings-to-innings variance, not model uncertainty about the pressure definition itself. Threshold and format sensitivity are disclosed on the <Link to="/reliability" className="text-royal-300 underline-offset-4 hover:underline">Reliability</Link> page.
            </InfoNote>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="card p-5 xl:col-span-2">
              <p className="kicker mb-1">Sample profile</p>
              <h2 className="font-display text-lg font-semibold text-white">Scored, but outside the final evidence set</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {player.eligibility === 'Fully Eligible'
                  ? 'This player clears the full eligibility bar but finished outside the top 10. The complete scoring table is available in the downloads section.'
                  : 'This player did not clear the full eligibility bar, so they are not selectable for the final top 10. Their score is shown for transparency only.'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pressureRows.map((r) => (
                  <Metric key={r.label} label={r.label} value={r.hint} hint={r.label === 'Consistency' ? 'Higher is more repeatable' : 'Pressure sample'} />
                ))}
              </div>
            </div>
            <div className="card p-5">
              <p className="kicker mb-1">Availability</p>
              <h2 className="font-display text-lg font-semibold text-white">What is shown</h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-400">
                <li className="flex gap-2"><Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal-300" /> Pressure and normal aggregates are available for every player.</li>
                <li className="flex gap-2"><BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" /> Component z-scores, context splits and top innings are generated for the final 20 selected players.</li>
                <li className="flex gap-2"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" /> Season and match attribution are preserved in the cleaned dataset.</li>
              </ul>
              <Link to={isBat ? '/batters' : '/bowlers'} className="btn mt-4 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Back to explorer</Link>
            </div>
          </section>
          <section className="mt-6">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div>
                Detailed pressure evidence is published for the final top 10 only. This is a presentation choice, not an eligibility rule. The full scored table, including every player's components, is available in <Link to="/data" className="text-royal-300 underline-offset-4 hover:underline">Data &amp; Downloads</Link>.
              </div>
            </div>
          </section>
        </>
      )}
    </Container>
  )
}
