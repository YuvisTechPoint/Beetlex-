import { useQuery } from '@tanstack/react-query'
import { getMyRegistrations } from '@/api/registrations'
import { useAuth } from '@/hooks/useAuth'

export function useMyRegistrations() {
  const { isAuthenticated, isHydrated } = useAuth()

  return useQuery({
    queryKey: ['registrations', 'me'],
    queryFn: getMyRegistrations,
    enabled: isHydrated && isAuthenticated,
  })
}
