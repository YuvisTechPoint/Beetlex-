import { useAuthSync } from '@/hooks/useAuthSync'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync()
  return children
}
