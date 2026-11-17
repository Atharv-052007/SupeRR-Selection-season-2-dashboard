import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Database,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../data/DataContext'
import { Container, PageHeader, SectionHeader, StatCard } from '../components/ui'
import { LeaderCard } from '../components/LeaderCard'
import { RankingList } from '../components/RankingList'
import { fmt } from '../lib/format'

const CAT_COLORS: Record<string, string> = {
  Normal: '#64748B',
  Moderate: '#38BDF8',
  High: '#F94AA3',
  Extreme: '#E4007C',
}

const chartTooltip = {
  contentStyle: { background: '#0E1528', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#E2E8F0', fontWeight: 600 },
  itemStyle: { color: '#CBD5E1' },
}

export function Overview() {
  const { data } = useData()
  if (!data) return null
  const { meta, rankings, pressure } = data
  const batCat = pressure.batting_categories
  const bowlCat = pressure.bowling_categories
  const pressureShare = ((batCat.find((d) => d.bat_pressure_cat === 'High')?.balls ?? 0) +
    (batCat.find((d) => d.bat_pressure_cat === 'Extreme')?.balls ?? 0)) /
    batCat.reduce((a, d) => a + d.balls, 0)

  return (
    <Container>
      <PageHeader
        kicker="SupeRR Selector Season 2 · Round 1"
        title="The players who rise when it matters"
        description="A pressure-first ranking of IPL and T20I batters and bowlers. Pressure is measured before each ball — score, wickets, balls left, target and phase — then every player is judged on what they did next, against their own normal level and their format baseline."
        action={
          <>
            <Link to="/batting" className="btn btn-primary">
              <Trophy className="h-4 w-4" /> Batting top 10
            </Link>
            <Link to="/bowling" className="btn">
              <Target className="h-4 w-4" /> Bowling top 10
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matches analysed" value={meta.matches.toLocaleString()} hint={`${meta.deliveries.toLocaleString()} deliveries · ${meta.scope.join(' + ')}`} icon={<Database className="h-5 w-5" />} />
        <StatCard label="Pressure deliveries" value={`${(pressureShare * 100).toFixed(1)}%`} hint="Share of batter balls in the High + Extreme bands" icon={<Gauge className="h-5 w-5" />} accent="gold" />
        <StatCard label="Fully eligible players" value={(meta.fully_eligible.batters + meta.fully_eligible.bowlers).toLocaleString()} hint={`${meta.fully_eligible.batters} batters · ${meta.fully_eligible.bowlers} bowlers`} icon={<Users className="h-5 w-5" />} accent="teal" />
        <StatCard label="Model seed" value={meta.seed.toString()} hint="Fixed before the final rankings; 1,000-replicate bootstrap" icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LeaderCard kind="bat" row={rankings.batters[0]} />
        <LeaderCard kind="bowl" row={rankings.bowlers[0]} />
      </div>

      <section className="mt-10">
        <SectionHeader
          kicker="The model in one page"
          title="Pressure is a pre-delivery state"
          description="No outcome leakage. No future information. The score uses only what was known before the ball: the score, wickets lost, legal balls left, the target or par total, the phase and a projection of the finish."
          action={<Link to="/methodology" className="btn">Read the method <ArrowRight className="h-4 w-4" /></Link>}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Gauge, title: 'Measure the situation', body: 'Task difficulty, resources, phase and closeness produce a 0–100 batting and bowling pressure index for every delivery.' },
            { icon: Layers, title: 'Separate pressure from normal', body: 'High + Extreme deliveries form the ranking sample. Normal deliveries form each player’s own comparison baseline.' },
            { icon: BarChart3, title: 'Score what happened', body: 'Format-relative strike rate, average, boundary and dot rates, pressure lift and consistency are shrunk and standardised.' },
            { icon: ShieldCheck, title: 'Test the answer', body: 'Eligibility rules, bootstrap intervals, threshold and weight sensitivity, competition splits and an independent audit.' },
          ].map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="card card-hover relative p-5">
              <span className="num absolute right-4 top-3 text-3xl font-semibold text-white/[0.06]">0{i + 1}</span>
              <div className="mb-3 inline-flex rounded-xl border border-royal-500/30 bg-royal-500/10 p-2 text-royal-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="kicker mb-1">Validation · batting</p>
              <h3 className="font-display text-lg font-semibold text-white">Dismissal rate rises with pressure</h3>
              <p className="mt-1 text-xs text-slate-500">Normal 5.13% → Extreme 9.77%</p>
            </div>
            <Sparkles className="h-5 w-5 text-royal-300" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batCat} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="bat_pressure_cat" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip {...chartTooltip} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Dismissal rate']} />
                <Bar dataKey="dismissal_rate" radius={[6, 6, 0, 0]}>
                  {batCat.map((d) => <Cell key={d.bat_pressure_cat} fill={CAT_COLORS[d.bat_pressure_cat ?? 'Normal']} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="kicker mb-1">Validation · bowling</p>
              <h3 className="font-display text-lg font-semibold text-white">Economy rises with pressure</h3>
              <p className="mt-1 text-xs text-slate-500">Normal 8.08 → Extreme 10.20 runs per over</p>
            </div>
            <Gauge className="h-5 w-5 text-teal-300" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bowlCat} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="bowl_pressure_cat" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[7, 11]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} formatter={(v: number) => [v.toFixed(2), 'Economy']} />
                <Bar dataKey="economy" radius={[6, 6, 0, 0]}>
                  {bowlCat.map((d) => <Cell key={d.bowl_pressure_cat} fill={CAT_COLORS[d.bowl_pressure_cat ?? 'Normal']} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 xl:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="kicker mb-0.5">Final ranking</p>
              <h3 className="font-display text-lg font-semibold text-white">Top 10 batters</h3>
            </div>
            <Link to="/batting" className="btn text-xs">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <RankingList kind="bat" rows={rankings.batters} />
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="kicker mb-0.5">Final ranking</p>
              <h3 className="font-display text-lg font-semibold text-white">Top 10 bowlers</h3>
            </div>
            <Link to="/bowling" className="btn text-xs">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <RankingList kind="bowl" rows={rankings.bowlers} />
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <p className="kicker mb-1">Scope & fairness</p>
          <h3 className="font-display text-lg font-semibold text-white">Two formats, one standard</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            IPL and T20I scoring levels differ. Every player is compared with the baseline of the format in which the ball was bowled, so a T20I innings is never judged against an IPL run rate.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.league.formats.map((f) => (
              <div key={f.match_format} className="rounded-xl border border-white/[0.07] bg-ink-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{f.match_format === 'T20' ? 'IPL' : 'T20I'}</p>
                  <span className="chip">{f.matches} matches</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-slate-500">Batting SR</p><p className="num text-base font-semibold text-slate-100">{fmt(f.bat_SR, 1)}</p></div>
                  <div><p className="text-slate-500">Runs / over</p><p className="num text-base font-semibold text-slate-100">{fmt(f.runs_per_over, 2)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card flex flex-col justify-between p-5">
          <div>
            <p className="kicker mb-1">Evidence trail</p>
            <h3 className="font-display text-lg font-semibold text-white">Every number is traceable</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              The same scored tables feed the submission CSVs, the report and this dashboard. Nothing is hand-typed or manually reordered.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/data" className="btn btn-primary text-xs"><Database className="h-3.5 w-3.5" /> Downloads</Link>
            <Link to="/reliability" className="btn text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Reliability</Link>
          </div>
        </div>
      </section>
    </Container>
  )
}
