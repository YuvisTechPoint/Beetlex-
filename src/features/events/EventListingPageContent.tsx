import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EventFilters } from './EventFilters'
import { EventGrid } from './EventGrid'
import { RecommendedSection } from './RecommendedSection'
import type { EventListingPageState } from './useEventListingPage'

export function EventListingPageContent({
  filters,
  isAuthenticated,
  tracks,
  recommended,
  recommendedLoading,
  showRecommended,
  total,
  showing,
  isLoading,
  isError,
  isFetching,
  events,
  paginationPage,
  totalPages,
  handleFiltersChange,
  clearFilters,
  onPageChange,
  refetch,
  filtersActive,
}: EventListingPageState) {
  return (
    <>
      <Header />
      <main id="main-content">
        <PageBackNav to="/" label="Back to Home" title="All Hackathons" />
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-label">Discover</p>
              <h1 className="text-heading mt-2">Hackathons</h1>
              <p className="text-subtitle mt-2">
                {total} events · filter by status, track, or prize pool
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/organize">Organize</Link>
                </Button>
                <Button asChild>
                  <Link to="/organize/create">Create Event</Link>
                </Button>
              </div>
            )}
          </header>

          {showRecommended && (
            <RecommendedSection events={recommended} isLoading={recommendedLoading} />
          )}

          <div className="sticky top-[var(--site-header-height,4rem)] z-30 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <EventFilters filters={filters} onChange={handleFiltersChange} tracks={tracks} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Showing {showing} of {total} events
                {isFetching && !isLoading ? ' (updating…)' : ''}
              </span>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {isError && (
            <Alert variant="destructive" className="mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load events</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-3">
                <span>Check your connection and try again.</span>
                <Button type="button" variant="outline" size="sm" onClick={refetch}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8">
            <EventGrid
              events={events}
              isLoading={isLoading}
              page={paginationPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onClearFilters={clearFilters}
              hasActiveFilters={filtersActive}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
