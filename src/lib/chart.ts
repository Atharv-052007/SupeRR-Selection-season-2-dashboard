export const CAT_COLORS: Record<string, string> = {
  Normal: '#64748B',
  Moderate: '#38BDF8',
  High: '#F94AA3',
  Extreme: '#E4007C',
}

export const tooltipStyle = {
  contentStyle: {
    background: '#0E1528',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: '#E2E8F0', fontWeight: 600 },
  itemStyle: { color: '#CBD5E1' },
}

export const AXIS_TICK = { fill: '#94A3B8', fontSize: 11 }
export const AXIS_TICK_MUTED = { fill: '#64748B', fontSize: 11 }
export const GRID_STROKE = 'rgba(255,255,255,0.06)'

export const ELIGIBILITY_COLORS: Record<string, string> = {
  'Fully Eligible': '#F94AA3',
  'Limited Sample': '#38BDF8',
  'Insufficient Evidence': '#475569',
}
