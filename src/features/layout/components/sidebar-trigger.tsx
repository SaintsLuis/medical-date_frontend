'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSidebar } from '@/features/layout/hooks/use-sidebar'

interface SidebarTriggerProps {
  className?: string
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={() => setCollapsed(!collapsed)}
      className={`hidden lg:flex ${className || ''}`}
    >
      {collapsed ? (
        <ChevronRight className='h-4 w-4' />
      ) : (
        <ChevronLeft className='h-4 w-4' />
      )}
      <span className='sr-only'>Toggle sidebar</span>
    </Button>
  )
}
