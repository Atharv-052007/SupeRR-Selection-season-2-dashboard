export const fmt = (value: number | null | undefined, digits = 2): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return value.toFixed(digits)
}

export const int = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return Math.round(value).toLocaleString('en-US')
}

export const pct = (value: number | null | undefined, digits = 1): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(digits)}%`
}

export const signed = (value: number | null | undefined, digits = 2): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const TEAM_COLORS: Record<string, string> = {
  'Mumbai Indians': '#0B5CD5',
  'Chennai Super Kings': '#F5C518',
  'Royal Challengers Bengaluru': '#D71920',
  'Kolkata Knight Riders': '#6A2C91',
  'Rajasthan Royals': '#E4007C',
  'Delhi Capitals': '#17479E',
  'Punjab Kings': '#D71920',
  'Gujarat Titans': '#1B2A4A',
  'Lucknow Super Giants': '#00A3E0',
  'Sunrisers Hyderabad': '#F26522',
  India: '#1F6FEB',
  Australia: '#F5C518',
  England: '#1D4ED8',
  Pakistan: '#0B6E4F',
  'New Zealand': '#111827',
  'West Indies': '#7A1E2B',
  'Sri Lanka': '#1E3A8A',
  Afghanistan: '#1E40AF',
  Bangladesh: '#0F766E',
  Zimbabwe: '#B91C1C',
  Ireland: '#15803D',
}

export const teamColor = (team: string): string => {
  if (TEAM_COLORS[team]) return TEAM_COLORS[team]
  const key = Object.keys(TEAM_COLORS).find((t) => team.includes(t) || t.includes(team))
  return key ? TEAM_COLORS[key] : '#64748B'
}

export const shortFormat = (formats: string): string => {
  if (formats.includes('T20I') && formats.includes('T20')) return 'IPL + T20I'
  if (formats.includes('T20I')) return 'T20I'
  return 'IPL'
}

export const eligibilityTone = (eligibility: string): string => {
  if (eligibility === 'Fully Eligible') return 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10'
  if (eligibility === 'Limited Sample') return 'text-amber-300 border-amber-400/30 bg-amber-400/10'
  return 'text-slate-400 border-white/10 bg-white/5'
}
