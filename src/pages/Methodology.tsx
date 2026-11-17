import { Link } from 'react-router-dom'
import { ArrowRight, Gauge, Layers, ShieldCheck, Timer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../data/DataContext'
import { Card, Container, InfoNote, PageHeader, SectionHeader } from '../components/ui'
import { fmt } from '../lib/format'

const CAT_COLORS: Record<string, string> = { Normal: '#64748B', Moderate: '#38BDF8', High: '#F94AA3', Extreme: '#E4007C' }

const tooltipStyle = {
  contentStyle: { background: '#0E1528', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#E2E8F0', fontWeight: 600 },
  itemStyle: { color: '#CBD5E1' },
}

const BAT_LABELS: Record<string, string> = {
  bat_w_task: 'Task difficulty', bat_w_resource: 'Resources', bat_w_phase: 'Phase', bat_w_close: 'Closeness',
}
const BOWL_LABELS: Record<string, string> = {
  bowl_w_threat: 'Threat', bowl_w_resource: 'Resources', bowl_w_phase: 'Phase', bowl_w_close: 'Closeness',
}

function WeightBars({ weights, labels }: { weights: Record<string, number>; labels: Record<string, string> }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-3">
      {Object.entries(labels).map(([key, label]) => {
        const w = weights[key] ?? 0
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-300">{label}</span>
              <span className="num text-slate-400">{(100 * w / total).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-gradient-to-r from-royal-500 to-royal-300" style={{ width: `${(100 * w) / total}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CorrMatrix({ title, matrix }: { title: string; matrix: Record<string, Record<string, number>> }) {
  const keys = Object.keys(matrix)
  const short = (k: string) => k.replace('bat_', '').replace('bowl_', '').replace('_', ' ')
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-[11px]">
          <thead>
            <tr>
              <th />
              {keys.map((k) => <th key={k} className="px-1.5 py-1.5 text-center font-medium text-slate-500">{short(k)}</th>)}
            </tr>
          </thead>
          <tbody>
            {keys.map((rk) => (
              <tr key={rk}>
                <td className="whitespace-nowrap px-1.5 py-1.5 text-slate-500">{short(rk)}</td>
                {keys.map((ck) => {
                  const v = matrix[rk][ck]
                  const bg = v >= 0 ? `rgba(228, 0, 124, ${Math.min(Math.abs(v), 1) * 0.55})` : `rgba(56, 189, 248, ${Math.min(Math.abs(v), 1) * 0.45})`
                  return (
                    <td key={ck} className="rounded px-1.5 py-1.5 text-center font-mono text-[10px] text-white" style={{ background: bg }}>
                      {v.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Methodology() {
  const { data } = useData()
  if (!data) return null
  const { meta, pressure } = data
  const t = meta.thresholds
  const batPhase = pressure.batting_phase_outcomes
  const bowlPhase = pressure.bowling_phase_outcomes

  return (
    <Container>
      <PageHeader
        kicker="Methodology"
        title="A pressure score built before the ball"
        description="Every input to the pressure index is known before the delivery: score, wickets, balls remaining, target or par, phase and a projected finish. Outcomes are used only to validate the index, never to define it."
        action={<Link to="/reliability" className="btn">Sensitivity & audit <ArrowRight className="h-4 w-4" /></Link>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Timer, title: 'No future information', body: 'The pressure state uses the score before the ball, not the result of the ball or the match.' },
          { icon: Layers, title: 'Role-specific indices', body: 'Batting pressure measures task difficulty. Bowling pressure measures the threat posed by the batting side.' },
          { icon: ShieldCheck, title: 'Validated, not assumed', body: 'High and Extreme pressure balls show materially higher dismissal rates and economy than Normal balls.' },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <div className="mb-3 inline-flex rounded-xl border border-royal-500/30 bg-royal-500/10 p-2 text-royal-300"><Icon className="h-5 w-5" /></div>
            <h3 className="font-display text-base font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
          </Card>
        ))}
      </div>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="kicker mb-1">Batting Pressure Index</p>
          <h3 className="font-display text-lg font-semibold text-white">BPI = 100 × weighted sum of four components</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <WeightBars weights={meta.pressure_params} labels={BAT_LABELS} />
            <div className="space-y-2 rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
              <p><span className="text-royal-300">task</span> = sigmoid((RRR − par_RR − 0.30) / 1.60) <span className="text-slate-500">(chase)</span></p>
              <p><span className="text-royal-300">task</span> = sigmoid(deficit_frac / 0.09) <span className="text-slate-500">(first innings)</span></p>
              <p><span className="text-royal-300">resource</span> = 0.5 × (1 − (wkts_left/10)^balls_frac) + 0.5 × (wkts_lost/10)</p>
              <p><span className="text-royal-300">phase</span> = 0.30 / 0.55 / 0.85</p>
              <p><span className="text-royal-300">closeness</span> = exp(−|projected_margin| / 20)</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <p className="kicker mb-1">Bowling Pressure Index</p>
          <h3 className="font-display text-lg font-semibold text-white">WPI = 100 × weighted sum of four components</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <WeightBars weights={meta.pressure_params} labels={BOWL_LABELS} />
            <div className="space-y-2 rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
              <p><span className="text-teal-300">threat</span> = 0.85 × score_threat + 0.15 × (wkts_left/10)</p>
              <p><span className="text-teal-300">score_threat</span> = sigmoid((RRR − par_RR) / 2.20) <span className="text-slate-500">(chase)</span></p>
              <p><span className="text-teal-300">score_threat</span> = sigmoid((run_rate − par) / 0.18) <span className="text-slate-500">(first)</span></p>
              <p><span className="text-teal-300">resource</span> = (wkts_left/10) × (0.5 + 0.5 × balls_frac)</p>
              <p><span className="text-teal-300">closeness</span> = exp(−|projected_margin| / 20)</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Calibration"
          title="Where pressure starts"
          description="The thresholds are calibrated from the observed score distribution and checked against wicket and run outcomes. The ranking sample is High + Extreme; Moderate is a transition band and Normal is each player's comparison level."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 font-display text-base font-semibold text-white">Batting thresholds</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Normal', v: `< ${t.bat_normal_max}`, color: 'text-slate-300' },
                { label: 'Moderate', v: `${t.bat_normal_max}–${t.bat_moderate_max}`, color: 'text-sky-300' },
                { label: 'High', v: `${t.bat_moderate_max}–${t.bat_high_max}`, color: 'text-royal-300' },
                { label: 'Extreme', v: `> ${t.bat_high_max}`, color: 'text-royal-200' },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border border-white/[0.07] bg-ink-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{x.label}</p>
                  <p className={`num mt-1 text-sm font-semibold ${x.color}`}>{x.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Ranking sample: BPI ≥ {t.bat_pressure_min} · 27.2% of batter balls</p>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-display text-base font-semibold text-white">Bowling thresholds</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Normal', v: `< ${t.bowl_normal_max}`, color: 'text-slate-300' },
                { label: 'Moderate', v: `${t.bowl_normal_max}–${t.bowl_moderate_max}`, color: 'text-sky-300' },
                { label: 'High', v: `${t.bowl_moderate_max}–${t.bowl_high_max}`, color: 'text-teal-300' },
                { label: 'Extreme', v: `> ${t.bowl_high_max}`, color: 'text-teal-200' },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border border-white/[0.07] bg-ink-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{x.label}</p>
                  <p className={`num mt-1 text-sm font-semibold ${x.color}`}>{x.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Ranking sample: WPI ≥ {t.bowl_pressure_min} · 30.8% of legal balls</p>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="kicker mb-1">Validation</p>
          <h3 className="font-display text-lg font-semibold text-white">Batting: dismissal rate by band</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pressure.batting_categories} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="bat_pressure_cat" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Dismissal rate']} />
                <Bar dataKey="dismissal_rate" radius={[6, 6, 0, 0]}>
                  {pressure.batting_categories.map((d) => <Cell key={d.bat_pressure_cat} fill={CAT_COLORS[d.bat_pressure_cat ?? 'Normal']} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <p className="kicker mb-1">Validation</p>
          <h3 className="font-display text-lg font-semibold text-white">Bowling: economy by band</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pressure.bowling_categories} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="bowl_pressure_cat" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[7, 11]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toFixed(2), 'Economy']} />
                <Bar dataKey="economy" radius={[6, 6, 0, 0]}>
                  {pressure.bowling_categories.map((d) => <Cell key={d.bowl_pressure_cat} fill={CAT_COLORS[d.bowl_pressure_cat ?? 'Normal']} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Not just death overs"
          title="Pressure separates outcomes inside every phase"
          description="If the index were merely a death-over filter, pressure and normal balls would look the same in the middle overs. They do not."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-4"><h3 className="font-display text-base font-semibold text-white">Batting: Normal vs Pressure</h3></div>
            <div className="table-wrap rounded-none border-0">
              <table className="data-table min-w-[520px]">
                <thead><tr><th>Phase</th><th>Group</th><th>Balls</th><th>SR</th><th>Dismissal %</th></tr></thead>
                <tbody>
                  {batPhase.map((r) => (
                    <tr key={`${r.over_phase}-${r.bat_group}`}>
                      <td>{r.over_phase}</td>
                      <td><span className={r.bat_group === 'Pressure' ? 'text-royal-300' : 'text-slate-400'}>{r.bat_group}</span></td>
                      <td className="num">{r.balls.toLocaleString()}</td>
                      <td className="num">{fmt(r.SR, 1)}</td>
                      <td className="num">{fmt(r.dismissal_rate, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-4"><h3 className="font-display text-base font-semibold text-white">Bowling: Normal vs Pressure</h3></div>
            <div className="table-wrap rounded-none border-0">
              <table className="data-table min-w-[520px]">
                <thead><tr><th>Phase</th><th>Group</th><th>Balls</th><th>Economy</th><th>Wicket %</th></tr></thead>
                <tbody>
                  {bowlPhase.map((r) => (
                    <tr key={`${r.over_phase}-${r.bowl_group}`}>
                      <td>{r.over_phase}</td>
                      <td><span className={r.bowl_group === 'Pressure' ? 'text-teal-300' : 'text-slate-400'}>{r.bowl_group}</span></td>
                      <td className="num">{r.balls.toLocaleString()}</td>
                      <td className="num">{fmt(r.economy, 2)}</td>
                      <td className="num">{fmt(r.wicket_rate, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="kicker mb-2">Component dependence</p>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Batting pressure correlations</h3>
          <CorrMatrix title="Pearson correlation" matrix={pressure.validation.bat_components_corr} />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Task difficulty drives the batting score (0.93), but resource (0.57) and phase (0.36) add separate signal. Closeness is uncorrelated with the others (0.00), so it is not redundant.
          </p>
        </Card>
        <Card className="p-5">
          <p className="kicker mb-2">Component dependence</p>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Bowling pressure correlations</h3>
          <CorrMatrix title="Pearson correlation" matrix={pressure.validation.bowl_components_corr} />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Threat dominates the bowling score (0.88). Closeness (0.41) and phase (0.24) contribute independent information; resource is nearly orthogonal.
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <InfoNote>
          <strong className="text-white">Why this is meaningful.</strong> A pressure index is only useful if it predicts difficulty. In this data, Extreme-pressure batting balls are dismissed at 9.77% versus 5.13% for Normal balls, and Extreme-pressure bowling concedes 10.20 runs per over versus 8.08. The separation survives within each phase. Full formulas, calibration and limitations are in <span className="text-royal-300">submission/FINAL_METHODOLOGY_REPORT.pdf</span>.
        </InfoNote>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link to="/batting" className="btn btn-primary"><Gauge className="h-4 w-4" /> See the batting top 10</Link>
        <Link to="/bowling" className="btn"><Gauge className="h-4 w-4" /> See the bowling top 10</Link>
      </div>
    </Container>
  )
}
