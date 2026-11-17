type CsvValue = string | number | boolean | null | undefined

const escape = (value: CsvValue): string => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function downloadCsv<T extends object>(filename: string, rows: T[], columns?: { key: string; label: string }[]) {
  if (!rows.length) return
  const records = rows as Record<string, CsvValue>[]
  const keys = columns ? columns.map((c) => c.key) : Object.keys(records[0])
  const header = columns ? columns.map((c) => c.label) : keys
  const lines = [header.map(escape).join(',')]
  for (const row of records) {
    lines.push(keys.map((key) => escape(row[key])).join(','))
  }
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
