import { useQuery } from '@tanstack/react-query'
import { getJudgeQueue } from '@/api/judges'

export function useJudgeQueue() {
  return useQuery({
    queryKey: ['judge', 'queue'],
    queryFn: getJudgeQueue,
  })
}
