'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/lib/constants/routes'
import { ICON_MAP } from '@/lib/constants/icons'

interface MobileNavProps {
  setOpen: (open: boolean) => void
}

export function MobileNav({ setOpen }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <div className='flex h-full flex-col'>
      <div className='flex h-14 items-center border-b px-6'>
        <Link href='/' className='flex items-center space-x-2'>
          <span className='font-bold text-xl'>Medical Date</span>
        </Link>
        <Button
          variant='ghost'
          size='sm'
          className='ml-auto'
          onClick={() => setOpen(false)}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
      <div className='flex-1 px-3 py-4 overflow-y-auto'>
        <nav className='space-y-2'>
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.icon]
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setOpen(false)}
              >
                <IconComponent className='h-5 w-5' />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
