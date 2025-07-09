'use client'

import { ReactNode } from 'react'
import { DashboardSidebar } from '@/features/layout/components/dashboard-sidebar'
import { DashboardHeader } from '@/features/layout/components/dashboard-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className='flex h-screen'>
          <DashboardSidebar />
          <SidebarInset>
            <DashboardHeader />
            <main className='flex flex-1 flex-col gap-4 p-4 pt-0'>
              {/* Los children se renderizan directamente aquí con el espacio completo */}
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
