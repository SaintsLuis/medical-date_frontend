'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
//import { NAVIGATION_ITEMS } from '@/lib/constants/routes'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { SidebarLogo } from './sidebar-logo'

import { SidebarUser } from './sidebar-user'
import { SidebarItems } from './sidebar-items'

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // const { collapsed } = useSidebar()
  // const pathname = usePathname()

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarItems />
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
