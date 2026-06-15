/** Maps REST paths to pre-generated JSON under /static-api/ (Lighthouse perf builds). */
export function resolveStaticApiUrl(path: string): string | null {
  if (!import.meta.env.VITE_STATIC_API) {
    return null
  }

  const [pathname, query = ''] = path.split('?')

  if (pathname === '/events') {
    return query.includes('status=active')
      ? '/static-api/events-active.json'
      : '/static-api/events-list.json'
  }

  const eventMatch = pathname.match(/^\/events\/([^/]+)$/)
  if (eventMatch && !pathname.includes('/announcements') && !pathname.includes('/resources')) {
    return `/static-api/events/${eventMatch[1]}.json`
  }

  const leaderboardMatch = pathname.match(/^\/leaderboard\/([^/]+)$/)
  if (leaderboardMatch) {
    return `/static-api/leaderboard/${leaderboardMatch[1]}.json`
  }

  const statusMatch = pathname.match(/^\/leaderboard\/([^/]+)\/status$/)
  if (statusMatch) {
    return `/static-api/leaderboard/${statusMatch[1]}-status.json`
  }

  return null
}
