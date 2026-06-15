import { useQuery } from '@tanstack/react-query'
import { getMySubmission } from '@/api/submissions'
import { useAuth } from '@/hooks/useAuth'

export function useMySubmission() {
  const { isAuthenticated, isHydrated } = useAuth()

  return useQuery({
    queryKey: ['submissions', 'my'],
    queryFn: getMySubmission,
    enabled: isHydrated && isAuthenticated,
  })
}
