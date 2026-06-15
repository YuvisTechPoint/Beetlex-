import { z } from 'zod'

const scoreField = z
  .number({ message: 'Score is required' })
  .int()
  .min(1, 'Minimum score is 1')
  .max(10, 'Maximum score is 10')

export const scoringSchema = z.object({
  innovation: scoreField,
  technicalExecution: scoreField,
  impact: scoreField,
  presentation: scoreField,
  comments: z
    .string()
    .min(20, 'Comments must be at least 20 characters')
    .max(1000, 'Comments must be at most 1000 characters'),
})

export type ScoringFormValues = z.infer<typeof scoringSchema>

export const SCORE_CRITERIA = [
  {
    key: 'innovation' as const,
    label: 'Innovation',
    description: 'Novelty of the idea and creative problem-solving approach',
  },
  {
    key: 'technicalExecution' as const,
    label: 'Technical Execution',
    description: 'Code quality, architecture, and implementation depth',
  },
  {
    key: 'impact' as const,
    label: 'Impact',
    description: 'Potential real-world value and problem significance',
  },
  {
    key: 'presentation' as const,
    label: 'Presentation',
    description: 'Clarity of demo, pitch, and overall communication',
  },
] as const

export function computeTotalScore(
  values: Pick<ScoringFormValues, 'innovation' | 'technicalExecution' | 'impact' | 'presentation'>,
) {
  return values.innovation + values.technicalExecution + values.impact + values.presentation
}

export const DEFAULT_SCORE_VALUES: ScoringFormValues = {
  innovation: 5,
  technicalExecution: 5,
  impact: 5,
  presentation: 5,
  comments: '',
}
