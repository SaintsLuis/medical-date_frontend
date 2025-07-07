'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/lib/constants/routes'
import { ICON_MAP } from '@/lib/constants/icons'
import { useSidebar } from '@/features/layout/hooks/use-sidebar'

export function DashboardSidebar() {
  const { collapsed } = useSidebar()
  const pathname = usePathname()

  return (
    <div className='hidden lg:block'>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-background border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex h-14 items-center border-b px-3'>
            <Link
              href='/'
              className={cn(
                'flex items-center space-x-2 transition-all duration-300',
                collapsed ? 'justify-center w-full' : 'w-full'
              )}
            >
              {!collapsed && (
                <span className='font-bold text-xl'>Medical Date</span>
              )}
              {collapsed && <span className='font-bold text-xl'>MD</span>}
            </Link>
          </div>

          {/* Navigation */}
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
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <IconComponent className='h-5 w-5 flex-shrink-0' />
                    {!collapsed && <span>{item.name}</span>}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className='absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50'>
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
