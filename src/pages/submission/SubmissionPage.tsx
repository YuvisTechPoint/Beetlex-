import { SubmissionPageContent, useSubmissionPage } from '@/features/submission'

export default function SubmissionPage() {
  return <SubmissionPageContent {...useSubmissionPage()} />
}
