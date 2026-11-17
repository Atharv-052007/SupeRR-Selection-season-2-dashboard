import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, FlaskConical, Layers, Repeat, ShieldCheck } from 'lucide-react'
import {
  Bar,
  BarChart,
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
import { Badge, Container, InfoNote, PageHeader, ScoreBar, SectionHeader, StatCard } from '../components/ui'
import { fmt, int, pct } from '../lib/format'
import { AXIS_TICK_MUTED, GRID_STROKE, tooltipStyle } from '../lib/chart'

const SCENARIO_LABELS: Record<string, string> = {
  baseline: 'Baseline',
  bat_weights_output_heavy: 'Batting weights · output-heavy',
  bat_weights_lift_heavy: 'Batting weights · lift-heavy',
  bowl_weights_economy_heavy: 'Bowling weights · economy-heavy',
  bowl_weights_wickets_heavy: 'Bowling weights · wickets-heavy',
  no_lift_component: 'Remove pressure lift',
  no_consistency_component: 'Remove consistency',
  strict_eligibility: 'Stricter eligibility',
  relaxed_eligibility: 'Relaxed eligibility',
  strict_thresholds: 'Stricter pressure thresholds',
  lenient_thresholds: 'Looser pressure thresholds',
  ipl_only: 'IPL only',
  t20i_only: 'T20I only',
  without_season_2022: 'Leave out 2022',
  'without_season_2022/23': 'Leave out 2022/23',
  without_season_2023: 'Leave out 2023',
  'without_season_2023/24': 'Leave out 2023/24',
  without_season_2024: 'Leave out 2024',
  'without_season_2024/25': 'Leave out 2024/25',
  without_season_2025: 'Leave out 2025',
  without_season_2026: 'Leave out 2026',
}

const GROUP_ORDER = [
  'baseline',
  'bat_weights_output_heavy',
  'bat_weights_lift_heavy',
  'bowl_weights_economy_heavy',
  'bowl_weights_wickets_heavy',
  'no_lift_component',
  'no_consistency_component',
  'strict_eligibility',
  'relaxed_eligibility',
  'strict_thresholds',
  'lenient_thresholds',
  'ipl_only',
  't20i_only',
  'without_season_2022',
  'without_season_2022/23',
  'without_season_2023',
  'without_season_2023/24',
  'without_season_2024',
  'without_season_2024/25',
  'without_season_2025',
  'without_season_2026',
]

function intervalColor(v: number) {
  return v >= 0.6 ? '#10B981' : v >= 0.35 ? '#F59E0B' : '#F43F5E'
}

export function Reliability() {
  const { data, evidence } = useData()
  const [scenario, setScenario] = useState('baseline')
  if (!data) return null

  const { bootstrap, rankings, players, sensitivity } = data
  const batRows = useMemo(
    () =>
      rankings.batters.map((r) => {
        const p = players.batters.find((x) => x.id === r.id)
        const low = r.boot_low ?? r.score
        const high = r.boot_high ?? r.score
        return {
          name: r.name.split(' ').slice(-1)[0],
          full: r.name,
          props: (p?.top10_probability ?? 0) * 100,
          score: r.score,
          interval: [Math.max(0, r.score - low), Math.max(0, high - r.score)] as [number, number],
          low,
          high,
        }
      }),
    [rankings.batters, players.batters],
  )
  const bowlRows = useMemo(
    () =>
      rankings.bowlers.map((r) => {
        const p = players.bowlers.find((x) => x.id === r.id)
        const low = r.boot_low ?? r.score
        const high = r.boot_high ?? r.score
        return {
          name: r.name.split(' ').slice(-1)[0],
          full: r.name,
          props: (p?.top10_probability ?? 0) * 100,
          score: r.score,
          interval: [Math.max(0, r.score - low), Math.max(0, high - r.score)] as [number, number],
          low,
          high,
        }
      }),
    [rankings.bowlers, players.bowlers],
  )

  const scenarios = GROUP_ORDER.filter((k) => sensitivity[k])
  const active = sensitivity[scenario] ?? sensitivity.baseline
  const baseline = sensitivity.baseline
  const baseBat = new Set(baseline.batters.map((r) => r[1]))
  const baseBowl = new Set(baseline.bowlers.map((r) => r[1]))

  const scenarioRows = scenarios.map((k) => {
    const s = sensitivity[k]
    const batOverlap = baseBat.size ? s.batters.filter((r) => baseBat.has(r[1])).length : 10
    const bowlOverlap = baseBowl.size ? s.bowlers.filter((r) => baseBowl.has(r[1])).length : 10
    return { key: k, label: SCENARIO_LABELS[k] ?? k, batOverlap, bowlOverlap, note: s.note, batter_overlap: s.batter_overlap, bowler_overlap: s.bowler_overlap }
  })

  return (
    <Container>
      <PageHeader
        kicker="Reliability & sensitivity"
        title="How much should you trust the ranking?"
        description="A ranking without uncertainty is a claim, not evidence. This page reports bootstrap intervals, top-10 probabilities and 21 alternative specifications, including weight changes, eligibility rules, pressure thresholds, competition splits and leave-one-season-out tests."
        action={<Link to="/methodology" className="btn"><FlaskConical className="h-4 w-4" /> Methodology</Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bootstrap replicates" value={int(bootstrap.reps)} hint={`Seed ${bootstrap.seed} · fixed before ranking`} icon={<Repeat className="h-5 w-5" />} />
        <StatCard label="Mean absolute score gap" value={fmt(bootstrap.batters.mean_abs_score_gap, 2)} hint={`Batters · ${int(bootstrap.batters.n_players)} scored players`} icon={<Activity className="h-5 w-5" />} accent="gold" />
        <StatCard label="Mean absolute score gap" value={fmt(bootstrap.bowlers.mean_abs_score_gap, 2)} hint={`Bowlers · ${int(bootstrap.bowlers.n_players)} scored players`} icon={<Activity className="h-5 w-5" />} accent="teal" />
        <StatCard label="Scenario tests" value={int(scenarios.length)} hint="All reported, including the uncomfortable ones" icon={<Layers className="h-5 w-5" />} />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Sample-size shrinkage', body: 'Every rate is pulled toward a positional prior. Small samples cannot post extreme scores, and every selected player clears a hard minimum.' },
          { icon: Layers, title: 'Format-relative comparison', body: 'A ball bowled in a T20I is compared with the T20I baseline, not with the higher-scoring IPL environment.' },
          { icon: Repeat, title: 'Resampling, not re-labelling', body: 'The bootstrap resamples each player’s pressure innings 1,000 times. Rank intervals reflect real innings-to-innings variance.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-5">
            <div className="mb-3 inline-flex rounded-xl border border-teal-500/30 bg-teal-500/10 p-2 text-teal-300"><Icon className="h-5 w-5" /></div>
            <h3 className="font-display text-base font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <p className="kicker mb-1">Bootstrap · batters</p>
          <h3 className="font-display text-lg font-semibold text-white">Top-10 probability</h3>
          <p className="mt-1 text-xs text-slate-500">Share of 1,000 resamples in which the player finished in the top 10. The model's first pick is not a certainty.</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batRows} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={92} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v: number) => [`${fmt(v, 0)}%`, 'Top-10 probability']} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ''} />
                <Bar dataKey="props" radius={[0, 5, 5, 0]} barSize={14}>
                  {batRows.map((r) => <Cell key={r.full} fill={intervalColor(r.props / 100)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <p className="kicker mb-1">Bootstrap · bowlers</p>
          <h3 className="font-display text-lg font-semibold text-white">Top-10 probability</h3>
          <p className="mt-1 text-xs text-slate-500">The bowling pool is more stable at the top, but the lower half of the top 10 remains contestable.</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bowlRows} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={92} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v: number) => [`${fmt(v, 0)}%`, 'Top-10 probability']} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ''} />
                <Bar dataKey="props" radius={[0, 5, 5, 0]} barSize={14}>
                  {bowlRows.map((r) => <Cell key={r.full} fill={intervalColor(r.props / 100)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <p className="kicker mb-1">Score uncertainty · batters</p>
          <h3 className="font-display text-lg font-semibold text-white">95% bootstrap score intervals</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={batRows} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-24} textAnchor="end" height={52} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} />
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
                <Bar dataKey="score" fill="#E4007C" radius={[5, 5, 0, 0]}>
                  {batRows.map((r) => <Cell key={r.full} fill="#E4007C" />)}
                  <ErrorBar dataKey="interval" width={4} strokeWidth={1.5} stroke="#FFADD8" direction="y" />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <p className="kicker mb-1">Score uncertainty · bowlers</p>
          <h3 className="font-display text-lg font-semibold text-white">95% bootstrap score intervals</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bowlRows} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-24} textAnchor="end" height={52} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} />
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
                <Bar dataKey="score" fill="#00A6A6" radius={[5, 5, 0, 0]}>
                  {bowlRows.map((r) => <Cell key={r.full} fill="#00A6A6" />)}
                  <ErrorBar dataKey="interval" width={4} strokeWidth={1.5} stroke="#7FF3E4" direction="y" />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Selected players"
          title="Every selection, with its uncertainty"
          description="The table reports the locked score, the 95% score interval, the median bootstrap rank and the share of resamples in which the player made the top 10."
        />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th><th>Batter</th><th className="text-right">Score</th><th className="text-right">95% score interval</th>
                <th className="text-right">Rank interval</th><th className="text-right">Median rank</th><th className="text-right">Top-10 probability</th><th className="w-40">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rankings.batters.map((r) => {
                const p = players.batters.find((x) => x.id === r.id)
                const ev = evidence?.batters.find((x) => x.player_id === r.id)
                return (
                  <tr key={r.id}>
                    <td className="num">{r.rank}</td>
                    <td><Link to={`/player/bat/${r.id}`} className="font-medium text-white hover:text-royal-300">{r.name}</Link></td>
                    <td className="num text-right">{fmt(r.score, 1)}</td>
                    <td className="num text-right text-slate-400">{fmt(r.boot_low, 1)}–{fmt(r.boot_high, 1)}</td>
                    <td className="num text-right text-slate-400">{ev ? `${fmt(ev.bootstrap.rank_ci_low, 0)}–${fmt(ev.bootstrap.rank_ci_high, 0)}` : '—'}</td>
                    <td className="num text-right text-slate-400">{fmt(ev?.bootstrap.rank_median, 0)}</td>
                    <td className="num text-right font-semibold text-white">{pct((p?.top10_probability ?? 0) * 100, 0)}</td>
                    <td><ScoreBar value={r.score} low={r.boot_low} high={r.boot_high} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Rank intervals are read from the per-player bootstrap file; the table shows the score interval and top-10 probability to keep the display compact. Full rank intervals are on each player profile.
        </p>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Specification curve"
          title="Twenty-one ways to test the answer"
          description="Each scenario re-runs the full pipeline with one deliberate change. Overlap counts how many of the baseline top 10 survive. No scenario is hidden, including those that disagree."
          action={<Badge className="border-white/10 bg-white/[0.04] text-slate-300">{scenarios.length} scenarios</Badge>}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {scenarioRows.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScenario(s.key)}
              className={`card card-hover p-4 text-left ${scenario === s.key ? 'border-royal-500/50 bg-royal-500/[0.08]' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white">{s.label}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Batting overlap</p>
                  <p className="num text-lg font-semibold text-royal-300">{s.batOverlap}/10</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Bowling overlap</p>
                  <p className="num text-lg font-semibold text-teal-300">{s.bowlOverlap}/10</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                {s.batter_overlap ? `Bat max rank shift ${fmt(s.batter_overlap.max_rank_change, 0)} · mean ${fmt(s.batter_overlap.mean_rank_change, 1)}` : 'Reference specification'}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 card p-5">
        <div className="flex flex-col gap-2 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker mb-1">Active scenario</p>
            <h3 className="font-display text-xl font-semibold text-white">{SCENARIO_LABELS[scenario] ?? scenario}</h3>
            <p className="mt-1 text-xs text-slate-500">{active.note ?? 'The locked baseline specification.'}</p>
          </div>
          <div className="flex gap-2">
            {scenario !== 'baseline' && (
              <button type="button" className="btn text-xs" onClick={() => setScenario('baseline')}>Reset to baseline</button>
            )}
            <Badge className="border-white/10 bg-white/[0.04] text-slate-300">
              {active.batters.filter((r) => baseBat.has(r[1])).length}/10 batting · {active.bowlers.filter((r) => baseBowl.has(r[1])).length}/10 bowling retained
            </Badge>
          </div>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {[
            { title: 'Batters', rows: active.batters, base: baseBat, tone: 'royal' as const },
            { title: 'Bowlers', rows: active.bowlers, base: baseBowl, tone: 'teal' as const },
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{col.title}</p>
              <div className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.06]">
                {col.rows.map(([rank, pid, name, score]) => (
                  <div key={`${col.title}-${pid}`} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="num w-5 text-slate-500">{rank}</span>
                    <span className={`flex-1 truncate ${col.base.has(pid) ? 'text-white' : 'text-slate-400'}`}>{name}</span>
                    {!col.base.has(pid) && <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-500">new</span>}
                    <span className={`num text-xs ${col.tone === 'royal' ? 'text-royal-300' : 'text-teal-300'}`}>{fmt(score, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <p className="kicker mb-1">Stress test</p>
          <h3 className="font-display text-lg font-semibold text-white">Where the ranking is robust — and where it is not</h3>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">
            <p><span className="text-white">Robust:</span> weight changes retain 7–10 of 10 batters and 10 of 10 bowlers. Removing the lift or consistency component changes little. The bowling top three (Pathirana, Narine, Ashwin) survive every weight variant.</p>
            <p><span className="text-white">Sensitive:</span> pressure thresholds are the largest single lever. Strict thresholds retain 5/10 batters and 2/10 bowlers; looser thresholds retain 4/10 and 6/10. This is expected: strict thresholds cut the bowling pressure sample to 14.1% of legal balls (25,768) and collapse the eligible pool, while looser thresholds include about 49% of balls and dilute what “pressure” means.</p>
            <p><span className="text-white">Format split:</span> IPL-only retains 6/10 batters and 8/10 bowlers; T20I-only retains 3/10 and 1/10. This is a change of player pool and competition environment, not a contradiction. Selected players who appear in both formats hold their level in both (for example, Tim David 170.7 IPL SR vs 200.8 T20I; Pathirana 8.56 IPL economy vs 9.37 T20I).</p>
            <p><span className="text-white">Season removal:</span> leave-one-season-out retains 6–10 batters and 10/10 bowlers. No single season creates the bowling ranking.</p>
          </div>
        </div>
        <div className="card p-5">
          <p className="kicker mb-2">Disclosure</p>
          <div className="space-y-3">
            <div className="flex gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-slate-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div><span className="font-semibold text-white">Rank intervals are wide.</span> The top batter appears in 74% of bootstrap top 10s; rank 10 appears in 33%. Treat ranks 4–10 as a cohort, not a strict order.</div>
            </div>
            <div className="flex gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs leading-relaxed text-slate-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
              <div><span className="font-semibold text-white">Single-format selections.</span> Chapman (T20I) and Ashutosh, Badoni and Narine (IPL) are supported mainly by one competition. The format split on each profile makes this explicit.</div>
            </div>
            <div className="flex gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-xs leading-relaxed text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div><span className="font-semibold text-white">Final status.</span> Ready with disclosed limitations. The ranking is defensible; the exact ordering below the top three is not certain.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <InfoNote>
          <strong className="text-white">What the audit checks.</strong> An independent re-implementation recomputes pressure, player aggregates, scores and ranks, then compares them with the submitted CSVs, report numbers and dashboard. Consistency, duplicate and eligibility checks are run separately. Details are in <Link to="/data" className="text-royal-300 underline-offset-4 hover:underline">Data &amp; Downloads</Link>.
        </InfoNote>
      </section>
    </Container>
  )
}
