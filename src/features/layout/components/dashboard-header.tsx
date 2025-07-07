'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Bell, Settings, Search } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from './sidebar-trigger'
import { MobileSidebarTrigger } from './mobile-sidebar-trigger'

export function DashboardHeader() {
  const { user } = useAuthStore()

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center space-x-4'>
          {/* Mobile trigger */}
          <MobileSidebarTrigger />

          {/* Desktop trigger */}
          <SidebarTrigger className='-ml-1' />

          <Separator
            orientation='vertical'
            className='mx-2 data-[orientation=vertical]:h-4 hidden lg:block'
          />

          {/* Search bar */}
          <div className='relative hidden md:block'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input placeholder='Buscar...' className='pl-8 w-64' />
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm'>
            <Bell className='h-5 w-5' />
            <span className='sr-only'>Notificaciones</span>
          </Button>
          <Button variant='ghost' size='sm'>
            <Settings className='h-5 w-5' />
            <span className='sr-only'>Configuración</span>
          </Button>

          {/* User profile */}
          <div className='flex items-center space-x-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='' alt={user?.firstName || ''} />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                {user?.firstName?.charAt(0) || ''}
                {user?.lastName?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div className='hidden md:block'>
              <div className='text-sm font-medium'>
                {user?.firstName} {user?.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
