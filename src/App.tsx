import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DevToolbar } from '@/components/layout/DevToolbar'
import { HashScrollHandler } from '@/components/layout/HashScrollHandler'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useUiStore } from '@/store/uiStore'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const EventListingPage = lazy(() => import('@/pages/events/EventListingPage'))
const EventDetailPage = lazy(() => import('@/pages/events/EventDetailPage'))
const RegistrationPage = lazy(() => import('@/pages/registration/RegistrationPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const SubmissionPage = lazy(() => import('@/pages/submission/SubmissionPage'))
const JudgeDashboardPage = lazy(() => import('@/pages/judge/JudgeDashboardPage'))
const JudgeCompletedPage = lazy(() => import('@/pages/judge/JudgeCompletedPage'))
const OrganizerDashboardPage = lazy(() => import('@/pages/organizer/OrganizerDashboardPage'))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function DarkModeSync() {
  const darkMode = useUiStore((s) => s.darkMode)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <DarkModeSync />
        <HashScrollHandler />
        <PageWrapper>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventListingPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/events/:id/register" element={<RegistrationPage />} />
              <Route path="/legal/privacy" element={<PrivacyPage />} />
              <Route path="/legal/terms" element={<TermsPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="participant">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/submit"
                element={
                  <ProtectedRoute requiredRole="participant">
                    <SubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge"
                element={
                  <ProtectedRoute requiredRole="judge">
                    <JudgeDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge/completed"
                element={
                  <ProtectedRoute requiredRole="judge">
                    <JudgeCompletedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </Suspense>
          </ErrorBoundary>
        </PageWrapper>
        <DevToolbar />
        <Toaster richColors position="bottom-right" offset={16} />
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
