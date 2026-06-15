import type { Announcement } from '@/types'

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    eventId: 'evt-active-1',
    title: 'Submission Deadline Extended by 2 Hours',
    message:
      'Due to widespread GitHub API outages this evening, the submission deadline for DevTools Velocity Hack has been extended to June 13, 2026 at 02:00 UTC. All other deadlines remain unchanged. Please ensure your repos are public or grant judge access before the new deadline.',
    priority: 'urgent',
    createdAt: '2026-06-12T20:00:00.000Z',
    readBy: ['user-participant-1', 'user-participant-2', 'user-organizer-1'],
  },
  {
    id: 'ann-2',
    eventId: 'evt-active-1',
    title: 'Office Hours with JetBrains Team',
    message:
      'JetBrains engineers will host live office hours on Discord (#office-hours) today from 14:00–16:00 UTC. Bring questions about IDE plugin development, LSP integration, and publishing to the JetBrains Marketplace.',
    priority: 'info',
    createdAt: '2026-06-11T10:00:00.000Z',
    readBy: ['user-participant-3', 'user-participant-5', 'user-judge-2'],
  },
  {
    id: 'ann-3',
    eventId: 'evt-active-2',
    title: 'Dataset License Reminder',
    message:
      'All teams using the healthcare imaging dataset must include the data provenance section in their impact report. Redistribution of raw DICOM files is prohibited. Contact mentors in #healthcare-ai if you need additional de-identified samples.',
    priority: 'warning',
    createdAt: '2026-06-09T08:00:00.000Z',
    readBy: ['user-participant-4', 'user-participant-11'],
  },
  {
    id: 'ann-4',
    eventId: 'evt-active-1',
    title: 'Judging Criteria Update',
    message:
      'We have published an updated rubric for the presentation category. Live demo reliability now accounts for 10 of the 20 presentation points. Review the full rubric in the Resources tab before finalizing your submission.',
    priority: 'warning',
    createdAt: '2026-06-10T15:30:00.000Z',
    readBy: [],
  },
  {
    id: 'ann-5',
    eventId: 'evt-upcoming-1',
    title: 'BeetleX AI Forge Registration Opens July 1',
    message:
      'Registration for BeetleX AI Forge 2026 opens on July 1, 2026. Early registrants receive priority access to GPU credit pools and mentor matching. Set a reminder and follow @BeetleX on Twitter for keynote speaker announcements.',
    priority: 'info',
    createdAt: '2026-06-14T09:00:00.000Z',
    readBy: ['user-organizer-1', 'user-organizer-2'],
  },
]

export const mockAnnouncementById = Object.fromEntries(
  mockAnnouncements.map((announcement) => [announcement.id, announcement]),
) as Record<string, Announcement>

export const mockAnnouncementsByEventId = mockAnnouncements.reduce<Record<string, Announcement[]>>(
  (acc, announcement) => {
    const list = acc[announcement.eventId] ?? []
    list.push(announcement)
    acc[announcement.eventId] = list
    return acc
  },
  {},
)
