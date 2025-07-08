'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Settings,
  Search,
  User,
  LogOut,
  Shield,
  Stethoscope,
  Heart,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from './sidebar-trigger'
import { MobileSidebarTrigger } from './mobile-sidebar-trigger'
import { UserRole } from '@/types/auth'

export function DashboardHeader() {
  const { user, logout } = useAuthStore()
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

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className='h-4 w-4' />
      case UserRole.DOCTOR:
        return <Stethoscope className='h-4 w-4' />
      case UserRole.PATIENT:
        return <Heart className='h-4 w-4' />
      default:
        return <User className='h-4 w-4' />
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador'
      case UserRole.DOCTOR:
        return 'Doctor'
      case UserRole.PATIENT:
        return 'Paciente'
      default:
        return role
    }
  }

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

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={
                      user?.doctorProfile?.profilePhoto ||
                      user?.patientProfile?.profilePhoto
                    }
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  />
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {user?.firstName?.charAt(0) || ''}
                    {user?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user?.email}
                  </p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {user?.roles.map((role) => (
                      <span
                        key={role}
                        className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md'
                      >
                        {getRoleIcon(role)}
                        {getRoleName(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className='mr-2 h-4 w-4' />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='text-red-600 focus:text-red-600'
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
