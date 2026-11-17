import { Link } from 'react-router-dom'
import { ArrowUpRight, Crown } from 'lucide-react'
import type { BattingRankRow, BowlingRankRow } from '../types'
import { fmt, int, signed, teamColor } from '../lib/format'
import { Avatar, Badge, ScoreBar } from './ui'

export function LeaderCard({ kind, row }: { kind: 'bat' | 'bowl'; row: BattingRankRow | BowlingRankRow }) {
  const isBat = kind === 'bat'
  const b = row as BattingRankRow
  const w = row as BowlingRankRow
  return (
    <Link
      to={`/player/${kind}/${row.id}`}
      className="card card-hover group relative overflow-hidden p-5"
      style={{ background: `linear-gradient(135deg, ${teamColor(row.team)}22 0%, rgba(255,255,255,0.03) 55%)` }}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20 blur-3xl" style={{ background: teamColor(row.team) }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.name} team={row.team} size="lg" />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge className="border-gold-400/40 bg-gold-400/10 text-gold-300">
                <Crown className="h-3 w-3" /> Rank 1
              </Badge>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{isBat ? 'Batter' : 'Bowler'}</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-white">{row.name}</h3>
            <p className="text-xs text-slate-400">{row.team}</p>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:text-white" />
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reliability score</p>
          <p className="num text-4xl font-semibold text-white">{fmt(row.score, 1)}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Inns</p>
            <p className="num text-sm font-semibold text-slate-200">{int(row.innings)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{isBat ? 'SR' : 'Econ'}</p>
            <p className="num text-sm font-semibold text-slate-200">{isBat ? fmt(b.SR, 1) : fmt(w.economy, 2)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{isBat ? 'Avg' : 'Wkts'}</p>
            <p className="num text-sm font-semibold text-slate-200">{isBat ? fmt(b.average, 1) : int(w.wickets)}</p>
          </div>
        </div>
      </div>
      <div className="relative mt-4">
        <ScoreBar value={row.score} low={row.boot_low} high={row.boot_high} tone={isBat ? 'royal' : 'teal'} />
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
          <span>Bootstrap interval {fmt(row.boot_low, 1)}–{fmt(row.boot_high, 1)}</span>
          <span>{isBat ? `SR lift ${signed(b.lift_SR, 1)}` : `Econ improvement ${signed(w.lift_economy, 2)}`}</span>
        </div>
      </div>
    </Link>
  )
}
