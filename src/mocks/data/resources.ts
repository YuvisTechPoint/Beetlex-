import type { EventResource } from '@/types'

const DEFAULT_RESOURCES: EventResource[] = [
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'Complete reference for BeetleX platform APIs, webhooks, and SDKs.',
    href: 'https://docs.beetlex.dev/api',
    icon: 'book',
  },
  {
    id: 'problem-statements',
    title: 'Problem Statements',
    description: 'Detailed track challenges, evaluation criteria, and datasets.',
    href: '#problem-statements',
    icon: 'file',
  },
  {
    id: 'mentor-schedule',
    title: 'Mentor Schedule',
    description: 'Book 1:1 office hours with engineers from sponsor companies.',
    href: 'https://cal.beetlex.dev/mentors',
    icon: 'calendar',
  },
  {
    id: 'discord',
    title: 'Discord Community',
    description: 'Get help, find teammates, and attend live AMA sessions.',
    href: 'https://discord.gg/beetlex',
    icon: 'message',
  },
]

export function getEventResources(eventId: string): EventResource[] {
  return DEFAULT_RESOURCES.map((resource) => ({
    ...resource,
    id: `${eventId}-${resource.id}`,
  }))
}
