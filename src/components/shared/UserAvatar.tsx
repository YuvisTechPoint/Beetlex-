import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { userInitials } from '@/components/layout/header/utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  avatarUrl?: string
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ name, avatarUrl, className, fallbackClassName }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-7 w-7', className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback
        className={cn('bg-primary/15 text-xs font-semibold text-primary', fallbackClassName)}
      >
        {userInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
