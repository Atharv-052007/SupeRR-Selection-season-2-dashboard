import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BattingRankRow, BowlingRankRow } from '../types'
import { fmt, signed } from '../lib/format'
import { Avatar, RankBadge, ScoreBar } from './ui'

export function RankingList({ kind, rows }: { kind: 'bat' | 'bowl'; rows: (BattingRankRow | BowlingRankRow)[] }) {
  const isBat = kind === 'bat'
  return (
    <div className="divide-y divide-white/[0.05]">
      {rows.map((row) => {
        const b = row as BattingRankRow
        const w = row as BowlingRankRow
        return (
          <Link
            key={row.id}
            to={`/player/${kind}/${row.id}`}
            className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.04] sm:px-5"
          >
            <RankBadge rank={row.rank} />
            <Avatar name={row.name} team={row.team} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{row.name}</p>
              <p className="truncate text-[11px] text-slate-500">
                {row.team} · {row.innings} pressure inns · {row.balls} balls
              </p>
            </div>
            <div className="hidden w-28 sm:block">
              <ScoreBar value={row.score} low={row.boot_low} high={row.boot_high} tone={isBat ? 'royal' : 'teal'} />
            </div>
            <div className="w-16 text-right">
              <p className="num text-sm font-semibold text-white">{fmt(row.score, 1)}</p>
              <p className="text-[10px] text-slate-500">{isBat ? `SR ${fmt(b.SR, 1)}` : `Econ ${fmt(w.economy, 2)}`}</p>
            </div>
            <span className="hidden w-20 text-right text-[11px] text-slate-400 md:block">
              {isBat ? `Lift ${signed(b.lift_SR, 1)}` : `Impr ${signed(w.lift_economy, 2)}`}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        )
      })}
    </div>
  )
}
