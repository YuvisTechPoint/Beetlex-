import { useAuthStore } from '@/store/authStore'
import { isFirebaseConfigured } from '@/lib/firebase'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const logout = useAuthStore((s) => s.logout)

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    isGoogleSignInEnabled: isFirebaseConfigured(),
  }
}
