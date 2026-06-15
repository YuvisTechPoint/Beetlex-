import { useQuery } from '@tanstack/react-query'
import { getJudgeSubmission } from '@/api/judges'

export function useJudgeSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ['judge', 'submissions', id],
    queryFn: () => getJudgeSubmission(id!),
    enabled: Boolean(id),
  })
}
