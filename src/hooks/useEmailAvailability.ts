import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { checkRegistrationEmail } from '@/api/registrations'
import { useDebounce } from '@/hooks/useDebounce'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useEmailAvailability(eventId: string | undefined, email: string) {
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 1000)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(Boolean(eventId && EMAIL_PATTERN.test(debouncedEmail)))
  }, [eventId, debouncedEmail])

  const query = useQuery({
    queryKey: ['registrations', 'check-email', eventId, debouncedEmail],
    queryFn: () => checkRegistrationEmail(eventId!, debouncedEmail),
    enabled: enabled && Boolean(eventId),
    staleTime: 30_000,
    retry: false,
  })

  return {
    isChecking: query.isFetching && enabled,
    isAvailable: query.data?.available ?? null,
    message: query.data?.message,
    reason: query.data?.reason,
  }
}
