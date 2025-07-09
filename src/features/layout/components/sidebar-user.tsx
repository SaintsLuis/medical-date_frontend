'use client'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  //Shield,
  //Stethoscope,
  //User,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/features/auth/store/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
// import { UserRole } from '@/types/auth'

export function SidebarUser() {
  const { user, logout } = useAuthStore()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  // const getRoleIcon = (role: UserRole) => {
  //   switch (role) {
  //     case UserRole.ADMIN:
  //       return <Shield className='h-4 w-4' />
  //     case UserRole.DOCTOR:
  //       return <Stethoscope className='h-4 w-4' />
  //     default:
  //       return <User className='h-4 w-4' />
  //   }
  // }

  // const getRoleName = (role: UserRole) => {
  //   switch (role) {
  //     case UserRole.ADMIN:
  //       return 'Administrador'
  //     case UserRole.DOCTOR:
  //       return 'Doctor'
  //     case UserRole.PATIENT:
  //       return 'Paciente'
  //     default:
  //       return role
  //   }
  // }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={
                    user?.doctorProfile?.profilePhoto ||
                    user?.patientProfile?.profilePhoto
                  }
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                />
                <AvatarFallback className='rounded-lg'>
                  {user?.firstName?.charAt(0) || ''}
                  {user?.lastName?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user?.firstName}</span>
                <span className='truncate text-xs'>{user?.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={
                      user?.doctorProfile?.profilePhoto ||
                      user?.patientProfile?.profilePhoto
                    }
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  />
                  <AvatarFallback className='rounded-lg'>
                    {user?.firstName?.charAt(0) || ''}
                    {user?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    {user?.firstName}
                  </span>
                  <span className='truncate text-xs'>{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <BadgeCheck />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut />
              <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
