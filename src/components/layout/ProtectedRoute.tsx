import { Navigate, useLocation } from 'react-router-dom'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isHydrated } = useAuth()
  const location = useLocation()

  if (!isHydrated) {
    return <PageSkeleton />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
