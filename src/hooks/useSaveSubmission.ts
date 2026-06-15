import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveSubmission, uploadSubmissionFile, type SaveSubmissionPayload } from '@/api/submissions'

export function useSaveSubmission() {
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (payload: SaveSubmissionPayload) => saveSubmission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, field }: { file: File; field: string }) =>
      uploadSubmissionFile(file, field),
  })

  return { saveMutation, uploadMutation }
}
