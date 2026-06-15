import { z } from 'zod'

const repoUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => /github\.com|gitlab\.com/i.test(url),
    'Must be a GitHub or GitLab URL',
  )

const videoUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => /youtube\.com|youtu\.be|loom\.com/i.test(url),
    'Must be a YouTube or Loom URL',
  )

export const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z
    .string()
    .min(100, 'Description must be at least 100 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  techStack: z.array(z.string().min(1)).min(1, 'Add at least one technology'),
  demoUrl: z.string().url('Demo link must be a valid URL'),
  repoUrl: repoUrlSchema,
  pitchDeckUrl: z.string().optional(),
  videoUrl: z.union([videoUrlSchema, z.literal('')]).optional(),
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>
