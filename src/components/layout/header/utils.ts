import type { UserRole } from '@/types'

export function userInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function dashboardPathForRole(role: UserRole) {
  if (role === 'judge') return '/judge'
  if (role === 'organizer') return '/organizer'
  return '/dashboard'
}

export function dashboardLabelForRole(role: UserRole) {
  if (role === 'judge') return 'Judge Panel'
  if (role === 'organizer') return 'Organizer Hub'
  return 'Dashboard'
}

export function isNavActive(to: string, pathname: string, hash: string) {
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1)
  }
  if (to === '/events') {
    return pathname === '/events' || pathname.startsWith('/events/')
  }
  return pathname === to
}
