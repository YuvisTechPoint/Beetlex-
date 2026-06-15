import { User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SoloTeamFields() {
  return (
    <Alert>
      <User className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Individual registration</AlertTitle>
      <AlertDescription>
        You will compete solo. A personal team workspace is created automatically so you can submit
        projects and track the leaderboard — you can invite teammates later if you change your mind.
      </AlertDescription>
    </Alert>
  )
}
