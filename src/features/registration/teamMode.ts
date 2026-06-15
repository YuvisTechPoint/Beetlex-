export type RegistrationTeamMode = 'solo' | 'create' | 'join'

export function allowsSoloRegistration(teamMinSize: number) {
  return teamMinSize <= 1
}

export function buildSoloTeamName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] || 'Solo'
  const name = `${first}'s Team`
  return name.length > 30 ? name.slice(0, 30) : name
}

export function usesTrackSelectionStep(teamMode: RegistrationTeamMode) {
  return teamMode === 'create' || teamMode === 'solo'
}
