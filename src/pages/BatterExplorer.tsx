import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Search, SlidersHorizontal, Users } from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { useData } from '../data/DataContext'
import { Container, PageHeader, SectionHeader, StatCard } from '../components/ui'
import { SortHeader } from '../components/SortHeader'
import { Pager } from '../components/Pager'
import { useSort } from '../lib/useSort'
import { downloadCsv } from '../lib/csv'
import { eligibilityTone, fmt, int, shortFormat } from '../lib/format'
import { AXIS_TICK_MUTED, ELIGIBILITY_COLORS, GRID_STROKE, tooltipStyle } from '../lib/chart'
import type { BattingPlayer, Eligibility } from '../types'

const PAGE_SIZE = 25

export function BatterExplorer() {
  const { data } = useData()
  const [query, setQuery] = useState('')
  const [eligibility, setEligibility] = useState<'All' | Eligibility>('All')
  const [format, setFormat] = useState<'All' | 'IPL' | 'T20I'>('All')
  const [minBalls, setMinBalls] = useState(100)
  const [page, setPage] = useState(0)
  if (!data) return null

  const filtered = useMemo(
    () =>
      data.players.batters.filter((p) => {
        if (eligibility !== 'All' && p.eligibility !== eligibility) return false
        if (format === 'IPL' && !p.formats.includes('T20')) return false
        if (format === 'T20I' && !p.formats.includes('T20I')) return false
        if (p.balls < minBalls) return false
        if (query.trim() && !`${p.name} ${p.team} ${p.teams}`.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [data.players.batters, eligibility, format, minBalls, query],
  )
  const { sorted, key, direction, toggle } = useSort<BattingPlayer>(filtered, 'score', 'desc')
  const rows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const scatter = sorted.filter((p) => p.SR !== null && p.average !== null && p.balls >= Math.max(50, minBalls))
  const medianSR = scatter.length ? [...scatter].sort((a, b) => (a.SR ?? 0) - (b.SR ?? 0))[Math.floor(scatter.length / 2)].SR : null
  const medianAvg = scatter.length ? [...scatter].sort((a, b) => (a.average ?? 0) - (b.average ?? 0))[Math.floor(scatter.length / 2)].average : null
  const groups: Eligibility[] = ['Fully Eligible', 'Limited Sample', 'Insufficient Evidence']

  const setFilter = (fn: () => void) => {
    fn()
    setPage(0)
  }

  const toPoint = (p: BattingPlayer) => ({ x: p.SR, y: p.average, z: p.balls, name: p.name, team: p.team, score: p.score, id: p.id })

  return (
    <Container>
      <PageHeader
        kicker="Batter explorer"
        title="Every batter, every pressure sample"
        description="Search the full player pool and compare pressure strike rate with pressure average. Bubble size is the number of pressure balls faced; colour is eligibility. The top 10 are highlighted wherever they appear."
        action={
          <button type="button" className="btn" onClick={() => downloadCsv('superr_batter_explorer.csv', sorted, [
            { key: 'name', label: 'player_name' }, { key: 'team', label: 'team' }, { key: 'formats', label: 'formats' },
            { key: 'matches', label: 'matches' }, { key: 'innings', label: 'pressure_innings' }, { key: 'balls', label: 'pressure_balls' },
            { key: 'runs', label: 'runs' }, { key: 'SR', label: 'strike_rate' }, { key: 'average', label: 'average' },
            { key: 'boundary_pct', label: 'boundary_pct' }, { key: 'dot_pct', label: 'dot_pct' },
            { key: 'lift_SR', label: 'strike_rate_lift' }, { key: 'consistency', label: 'consistency' },
            { key: 'score', label: 'score' }, { key: 'rank', label: 'rank' }, { key: 'eligibility', label: 'eligibility' },
          ])}>
            <Download className="h-4 w-4" /> Export view
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Batters in view" value={int(filtered.length)} hint={`of ${int(data.players.batters.length)} in the dataset`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Minimum pressure balls" value={int(minBalls)} hint="Adjust the sample floor below" icon={<SlidersHorizontal className="h-5 w-5" />} accent="teal" />
        <StatCard label="Median pressure SR" value={fmt(medianSR, 1)} hint="In the current filtered view" icon={<Search className="h-5 w-5" />} />
        <StatCard label="Median pressure average" value={fmt(medianAvg, 1)} hint="In the current filtered view" icon={<Users className="h-5 w-5" />} accent="gold" />
      </div>

      <section className="mt-6 card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="kicker mb-1">Player map</p>
            <h3 className="font-display text-lg font-semibold text-white">Pressure strike rate vs pressure average</h3>
            <p className="mt-1 text-xs text-slate-500">Top-right is the strongest profile. Dashed lines mark the median of the filtered group.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="input h-9 w-56 pl-9" placeholder="Search player or team…" value={query} onChange={(e) => setFilter(() => setQuery(e.target.value))} aria-label="Search batters" />
            </div>
            <select className="input h-9 w-40" value={eligibility} onChange={(e) => setFilter(() => setEligibility(e.target.value as 'All' | Eligibility))} aria-label="Eligibility filter">
              <option value="All">All eligibility</option>
              <option value="Fully Eligible">Fully eligible</option>
              <option value="Limited Sample">Limited sample</option>
              <option value="Insufficient Evidence">Insufficient</option>
            </select>
            <select className="input h-9 w-32" value={format} onChange={(e) => setFilter(() => setFormat(e.target.value as 'All' | 'IPL' | 'T20I'))} aria-label="Format filter">
              <option value="All">All formats</option>
              <option value="IPL">IPL</option>
              <option value="T20I">T20I</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              Min balls
              <input type="number" min={0} max={800} step={25} value={minBalls} onChange={(e) => setFilter(() => setMinBalls(Number(e.target.value) || 0))} className="input h-9 w-20 text-right" />
            </label>
          </div>
        </div>
        <div className="mt-4 h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid stroke={GRID_STROKE} />
              <XAxis type="number" dataKey="x" name="Strike rate" domain={[40, 280]} ticks={[40, 80, 120, 160, 200, 240, 280]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} label={{ value: 'Pressure strike rate', position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 11 }} height={40} />
              <YAxis type="number" dataKey="y" name="Average" domain={[0, 90]} ticks={[0, 15, 30, 45, 60, 75, 90]} tick={AXIS_TICK_MUTED} axisLine={false} tickLine={false} label={{ value: 'Pressure average', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[30, 320]} />
              <Tooltip
                {...tooltipStyle}
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                formatter={(v: number, n: string) => [n === 'Average' || n === 'Strike rate' ? fmt(v, 1) : int(v), n]}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as { name: string; team: string; x: number; y: number; z: number; score: number }
                  return (
                    <div className="rounded-xl border border-white/10 bg-ink-850/98 px-3 py-2 text-xs shadow-xl">
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-slate-500">{p.team}</p>
                      <p className="mt-1 text-slate-300">SR {fmt(p.x, 1)} · Avg {fmt(p.y, 1)} · {int(p.z)} balls · score {fmt(p.score, 1)}</p>
                    </div>
                  )
                }}
              />
              {medianSR !== null && <ReferenceLine x={medianSR} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />}
              {medianAvg !== null && <ReferenceLine y={medianAvg} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />}
              {groups.map((g) => (
                <Scatter
                  key={g}
                  name={g}
                  data={scatter.filter((p) => p.eligibility === g).map(toPoint)}
                  fill={ELIGIBILITY_COLORS[g]}
                  fillOpacity={g === 'Insufficient Evidence' ? 0.35 : 0.7}
                >
                  {scatter.filter((p) => p.eligibility === g).map((p) => <Cell key={p.id} fill={ELIGIBILITY_COLORS[g]} />)}
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
          {groups.map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ELIGIBILITY_COLORS[g] }} />{g}</span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker="Full player table"
          title="Sort, filter and open any player"
          description="The table uses the same locked metrics as the ranking pages. A dash means the player did not face enough pressure balls for that metric, not zero."
        />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortHeader label="Player" column="name" activeKey={key} direction={direction} onSort={toggle} />
                <th>Team</th>
                <th>Format</th>
                <th>Eligibility</th>
                <SortHeader label="Inns" column="innings" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Balls" column="balls" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Runs" column="runs" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="SR" column="SR" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Avg" column="average" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Boundary %" column="boundary_pct" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Dot %" column="dot_pct" activeKey={key} direction={direction} onSort={toggle} align="right" />
                <SortHeader label="Score" column="score" activeKey={key} direction={direction} onSort={toggle} align="right" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/player/bat/${p.id}`} className="font-medium text-white hover:text-royal-300">{p.name}</Link>
                    {p.rank !== null && p.rank <= 10 && <span className="ml-2 rounded-full bg-royal-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-royal-300">TOP 10</span>}
                  </td>
                  <td className="text-slate-400">{p.team}</td>
                  <td className="text-slate-400">{shortFormat(p.formats)}</td>
                  <td><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${eligibilityTone(p.eligibility)}`}>{p.eligibility}</span></td>
                  <td className="num text-right">{int(p.innings)}</td>
                  <td className="num text-right">{int(p.balls)}</td>
                  <td className="num text-right">{int(p.runs)}</td>
                  <td className="num text-right">{fmt(p.SR, 1)}</td>
                  <td className="num text-right">{fmt(p.average, 1)}</td>
                  <td className="num text-right">{fmt(p.boundary_pct, 1)}</td>
                  <td className="num text-right">{fmt(p.dot_pct, 1)}</td>
                  <td className="num text-right font-semibold text-white">{fmt(p.score, 1)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={12} className="py-10 text-center text-slate-500">No batter matches the current filters.</td></tr>
              )}
            </tbody>
          </table>
          <Pager page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
        </div>
      </section>
    </Container>
  )
}
