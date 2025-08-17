import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ReactQueryProvider } from '@/providers/react-query-provider'
import { UserSessionGuard } from '@/components/user-session-guard'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Medical Date - Plataforma de Gestión Medica',
  description:
    'Plataforma integral de gestión sanitaria para profesionales médicos    y pacientes. Administra citas, pacientes, clínicas y más con facilidad.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <UserSessionGuard>{children}</UserSessionGuard>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
