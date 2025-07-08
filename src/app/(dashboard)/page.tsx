// app/(dashboard)/page.tsx
import { Suspense } from 'react'
import {
  getServerToken,
  debugCookies,
} from '@/features/auth/actions/auth-actions'
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats'
import { DashboardCharts } from '@/features/dashboard/components/dashboard-charts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Interfaz simplificada para debug de cookies
interface CookieDebugInfo {
  accessToken?: {
    exists: boolean
    preview: string
  } | null
  refreshToken?: {
    exists: boolean
    preview: string
  } | null
  totalCookies?: number
  cookieNames?: string[]
  error?: string
}

// Loading component para Suspense
function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full' />
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Server Component principal - SIMPLIFICADO para evitar errores
export default async function DashboardPage() {
  console.log('🔍 Dashboard Page Loading...')

  let cookieDebugInfo: CookieDebugInfo
  let serverToken: string | null = null

  try {
    // Obtener debug de cookies de forma segura
    cookieDebugInfo = await debugCookies()
    console.log('✅ Dashboard cookie debug success:', cookieDebugInfo)

    // Obtener token de forma segura
    serverToken = await getServerToken()
    console.log('✅ Dashboard server token success:', !!serverToken)
  } catch (error) {
    console.error('❌ Dashboard Server Error:', error)
    cookieDebugInfo = { error: 'Failed to load debug info' }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Resumen general del sistema médico
        </p>
      </div>

      {/* Suspense boundaries para diferentes secciones */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          cookieDebug={cookieDebugInfo}
          hasToken={!!serverToken}
        />
      </Suspense>
    </div>
  )
}

// Componente separado para el contenido del dashboard
function DashboardContent({
  cookieDebug,
  hasToken,
}: {
  cookieDebug: CookieDebugInfo
  hasToken: boolean
}) {
  return (
    <>
      {/* Estadísticas principales - usando el componente existente */}
      <DashboardStats />

      {/* Gráficos y métricas */}
      <DashboardCharts />

      {/* Info de debug - temporal para verificar la autenticación */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>
              🍪 Debug de Autenticación (Server-Side)
            </h3>
            <p className='text-sm text-muted-foreground'>
              Verificación de cookies y tokens desde el Server Component
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div
                className={`p-2 rounded ${
                  hasToken ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <p className='font-medium'>
                  Estado de Autenticación:{' '}
                  {hasToken ? '✅ Autenticado' : '❌ No autenticado'}
                </p>
              </div>
              <pre className='text-xs bg-gray-100 p-2 rounded overflow-auto'>
                {JSON.stringify(cookieDebug, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>📊 Estado del Sistema</h3>
            <p className='text-sm text-muted-foreground'>
              Información del sistema y conexión al backend
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div className='p-2 bg-blue-100 rounded'>
                <p className='font-medium'>✅ Frontend funcionando</p>
                <p>✅ Autenticación integrada</p>
                <p>✅ Server Actions funcionando</p>
                <p>✅ Cookies HTTP-only configuradas</p>
              </div>
              <div className='text-xs text-muted-foreground'>
                <p>
                  Backend URL:{' '}
                  {process.env.NEXT_PUBLIC_API_URL ||
                    'http://192.168.1.11:3001/api'}
                </p>
                <p>Modo: {process.env.NODE_ENV}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
