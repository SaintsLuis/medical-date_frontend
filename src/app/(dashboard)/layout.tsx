'use client'

import { ReactNode } from 'react'
import { DashboardSidebar } from '@/features/layout/components/dashboard-sidebar'
import { DashboardHeader } from '@/features/layout/components/dashboard-header'
import {
  SidebarProvider,
  useSidebar,
} from '@/features/layout/hooks/use-sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <div
      className={`transition-all duration-300 ${
        collapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}
    >
      <DashboardHeader />
      <main className='py-10'>
        <div className='px-4 sm:px-6 lg:px-8'>{children}</div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
