import { ALERT_BANNER_LABELS, ALERT_BANNER_STYLES } from '@/components/shared/alertBannerStyles'

export const ANNOUNCEMENT_PRIORITY_PREVIEW = {
  info: {
    label: ALERT_BANNER_LABELS.info,
    className: ALERT_BANNER_STYLES.info.container,
  },
  warning: {
    label: ALERT_BANNER_LABELS.warning,
    className: ALERT_BANNER_STYLES.warning.container,
  },
  urgent: {
    label: ALERT_BANNER_LABELS.urgent,
    className: ALERT_BANNER_STYLES.urgent.container,
  },
} as const
