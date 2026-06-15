import { useQuery } from '@tanstack/react-query'
import { getMyTeam } from '@/api/registrations'
import { useAuth } from '@/hooks/useAuth'

export function useMyTeam() {
  const { isAuthenticated, isHydrated } = useAuth()

  return useQuery({
    queryKey: ['teams', 'me'],
    queryFn: getMyTeam,
    enabled: isHydrated && isAuthenticated,
  })
}
