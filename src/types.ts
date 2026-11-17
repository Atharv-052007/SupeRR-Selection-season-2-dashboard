export type Eligibility = 'Fully Eligible' | 'Limited Sample' | 'Insufficient Evidence'
export type Kind = 'batters' | 'bowlers'

export interface Meta {
  title: string
  generated_at: string
  seed: number
  scope: string[]
  seasons: string[]
  matches: number
  deliveries: number
  batters: number
  bowlers: number
  eligibility: {
    batting: Record<string, number>
    bowling: Record<string, number>
  }
  bat_weights: Record<string, number>
  bowl_weights: Record<string, number>
  thresholds: Record<string, number>
  pressure_params: Record<string, number>
  priors: Record<string, number>
  fully_eligible: { batters: number; bowlers: number }
  limited: { batters: number; bowlers: number }
  insufficient: { batters: number; bowlers: number }
}

export interface BattingRankRow {
  rank: number
  id: number
  name: string
  team: string
  score: number
  innings: number
  balls: number
  runs: number
  SR: number
  average: number
  lift_SR: number
  consistency: number
  boot_low: number | null
  boot_high: number | null
}

export interface BowlingRankRow {
  rank: number
  id: number
  name: string
  team: string
  score: number
  innings: number
  balls: number
  wickets: number
  economy: number
  average: number
  lift_economy: number
  consistency: number
  boot_low: number | null
  boot_high: number | null
}

export interface BattingPlayer {
  id: number
  name: string
  team: string
  teams: string
  formats: string
  seasons: string
  matches: number
  innings: number
  balls: number
  runs: number
  SR: number | null
  average: number | null
  boundary_pct: number | null
  dot_pct: number | null
  normal_SR: number | null
  normal_average: number | null
  lift_SR: number | null
  lift_average: number | null
  consistency: number | null
  score: number | null
  rank: number | null
  eligibility: Eligibility
  boot_low: number | null
  boot_high: number | null
  top10_probability: number | null
}

export interface BowlingPlayer {
  id: number
  name: string
  team: string
  teams: string
  formats: string
  seasons: string
  matches: number
  innings: number
  balls: number
  wickets: number
  economy: number | null
  average: number | null
  strike_rate: number | null
  dot_pct: number | null
  boundary_pct: number | null
  normal_economy: number | null
  lift_economy: number | null
  lift_wicket_rate: number | null
  consistency: number | null
  score: number | null
  rank: number | null
  eligibility: Eligibility
  boot_low: number | null
  boot_high: number | null
  top10_probability: number | null
}

export interface CategoryRow {
  bat_pressure_cat?: string
  bowl_pressure_cat?: string
  deliveries: number
  balls: number
  runs: number
  dismissals?: number
  wickets?: number
  boundaries: number
  dots: number
  SR?: number
  economy?: number
  dismissal_rate?: number
  wicket_rate?: number
  boundary_pct: number
  dot_pct: number
}

export interface FormatRow {
  match_format: string
  matches: number
  deliveries: number
  runs: number
  legal: number
  wickets: number
  bat_runs: number
  bat_balls: number
  bat_wkts: number
  boundaries: number
  dots: number
  runs_per_over: number
  bat_SR: number
  bat_average: number
  boundary_rate: number
  dot_rate: number
}

export interface CoverageRow {
  season: string
  match_format: string
  matches: number
  deliveries: number
}

export interface PhaseOutcome {
  over_phase: string
  bat_group?: string
  bowl_group?: string
  balls: number
  runs: number
  dismissals?: number
  wickets?: number
  SR?: number
  dismissal_rate?: number
  economy?: number
  wicket_rate?: number
}

export interface PhaseRow {
  over_phase: string
  Normal?: number
  Moderate?: number
  High?: number
  Extreme?: number
  [key: string]: string | number | undefined
}

export interface Validation {
  bat_quantiles: Record<string, number>
  bowl_quantiles: Record<string, number>
  bat_components_corr: Record<string, Record<string, number>>
  bowl_components_corr: Record<string, Record<string, number>>
}

/** Sensitivity top-10 entries are serialised as [rank, player_id, player_name, score]. */
export type ScenarioTop = [rank: number, player_id: number, player_name: string, score: number]

export interface Scenario {
  batters: ScenarioTop[]
  bowlers: ScenarioTop[]
  note?: string
  batter_overlap?: { overlap: number; max_rank_change: number | null; mean_rank_change: number | null }
  bowler_overlap?: { overlap: number; max_rank_change: number | null; mean_rank_change: number | null }
}

export interface BootstrapSummary {
  n_players: number
  n_reps: number
  mean_abs_score_gap: number
  spearman_boot_vs_original: number
}

export interface DashboardData {
  meta: Meta
  rankings: { batters: BattingRankRow[]; bowlers: BowlingRankRow[] }
  players: { batters: BattingPlayer[]; bowlers: BowlingPlayer[] }
  league: { formats: FormatRow[]; coverage: CoverageRow[] }
  pressure: {
    validation: Validation
    batting_categories: CategoryRow[]
    bowling_categories: CategoryRow[]
    batting_phase: PhaseRow[]
    bowling_phase: PhaseRow[]
    batting_phase_outcomes: PhaseOutcome[]
    bowling_phase_outcomes: PhaseOutcome[]
  }
  sensitivity: Record<string, Scenario>
  bootstrap: { batters: BootstrapSummary; bowlers: BootstrapSummary; reps: number; seed: number }
}

export interface Component {
  key: string
  label: string
  z: number
  weight: number
  weighted_z: number
}

export interface TopInnings {
  match_id: number
  date: string
  opponent: string
  season: string
  format: string
  runs?: number
  balls: number
  SR?: number
  dismissed?: boolean
  wickets?: number
  econ?: number
  runs_saved?: number
  pressure: number
  won: boolean
}

export interface ContextSplit {
  balls: number
  runs: number
  dismissals?: number
  wickets?: number
  SR?: number
  econ?: number
  phase?: string
  format?: string
  season?: string
}

export interface Evidence {
  player_id: number
  player_name: string
  team: string
  teams: string
  formats: string
  seasons: string
  matches: number
  kind: 'bat' | 'bowl'
  rank: number
  score: number
  eligibility: Eligibility
  pressure: Record<string, number>
  normal: Record<string, number | null>
  lift: Record<string, number | null>
  components: Component[]
  bootstrap: {
    score_ci_low: number | null
    score_median: number | null
    score_ci_high: number | null
    rank_ci_low: number | null
    rank_median: number | null
    rank_ci_high: number | null
    top10_probability: number | null
  }
  context: {
    categories: Record<string, number>
    by_phase: ContextSplit[]
    by_format: ContextSplit[]
    by_season: ContextSplit[]
    top_innings: TopInnings[]
  }
}

export interface EvidenceData {
  generated_at: string
  seed: number
  batters: Evidence[]
  bowlers: Evidence[]
}
