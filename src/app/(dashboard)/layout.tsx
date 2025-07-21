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
        <div className='flex h-screen w-full'>
          <DashboardSidebar />
          <SidebarInset className='flex flex-1 flex-col overflow-hidden'>
            <DashboardHeader />
            <main className='flex-1 overflow-auto'>
              <div className='h-full p-6 pt-4'>
                {/* Los children se renderizan con el ancho completo disponible */}
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
