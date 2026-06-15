import { BookOpen, Calendar, FileText, MessageCircle } from 'lucide-react'
import type { EventResource } from '@/types'

export const RESOURCE_ICON_MAP = {
  book: BookOpen,
  file: FileText,
  calendar: Calendar,
  message: MessageCircle,
} as const

export function getResourceIcon(icon: EventResource['icon']) {
  return RESOURCE_ICON_MAP[icon]
}
