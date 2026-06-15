import type { OrganizerTab } from '@/types'
import { TABS } from './constants'

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parseTab(value: string | null): OrganizerTab {
  if (value && TABS.some((t) => t.id === value)) {
    return value as OrganizerTab
  }
  return 'overview'
}
