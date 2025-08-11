'use client'

import { Button } from '@/components/ui/button'
import { Video, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

export function JoinMeetButton() {
  const { user } = useAuthStore()

  // Solo mostrar si es doctor y tiene meetingLink
  const isDoctor = user?.roles?.includes(UserRole.DOCTOR)
  const meetingLink = user?.doctorProfile?.meetingLink

  if (!isDoctor || !meetingLink) {
    return null
  }

  const handleJoinMeet = () => {
    window.open(meetingLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      onClick={handleJoinMeet}
      className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'
      size='sm'
    >
      <Video className='w-4 h-4' />
      Unirse a Meet
      <ExternalLink className='w-3 h-3' />
    </Button>
  )
}
