import * as React from 'react'

import Image from 'next/image'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation'

export function SidebarLogo() {
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          onClick={() => router.push('/')}
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer hover:bg-sidebar-accent/50'
        >
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            {/* Logo que se adapta según el estado */}
            <div className='flex items-center justify-center'>
              {isCollapsed ? (
                // Logo más grande y centrado cuando está colapsado
                <div className='relative'>
                  <Image
                    src='/logo-icon.svg'
                    alt='Medical Date Logo'
                    width={64}
                    height={64}
                    className='transition-all duration-300 ease-in-out hover:scale-110'
                    priority
                  />
                </div>
              ) : (
                // Logo normal cuando está expandido
                <div className='relative'>
                  <Image
                    src='/logo-icon.svg'
                    alt='Medical Date Logo'
                    width={48}
                    height={48}
                    className='transition-all duration-300 ease-in-out hover:scale-105'
                    priority
                  />
                </div>
              )}
            </div>

            {/* Texto que se oculta cuando está colapsado */}
            {!isCollapsed && (
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold text-sidebar-foreground'>
                  Medical Date
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  v1.0.0
                </span>
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
