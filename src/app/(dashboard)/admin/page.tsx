import { AdminDashboardMetrics } from '@/features/dashboard/components/admin-dashboard-metrics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Dashboard Administrativo
          </h1>
          <p className='text-muted-foreground'>
            Resumen general del sistema médico
          </p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Métricas Generales</h2>
        <AdminDashboardMetrics />
      </div>

      {/* Sección de Acciones Rápidas */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Gestionar Usuarios
            </CardTitle>
            <Users className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Crear, editar y administrar usuarios del sistema
            </p>
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Reportes Financieros
            </CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Ver ingresos, facturas y reportes de facturación
            </p>
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Analytics</CardTitle>
            <TrendingUp className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Gráficos y análisis detallados del sistema
            </p>
          </CardContent>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Actividad del Sistema
            </CardTitle>
            <Activity className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Monitorear actividad y rendimiento del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Sistema</CardTitle>
            <CardDescription>
              Estado general de la plataforma médica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Estado del Servidor
                </span>
                <span className='text-sm font-medium text-green-600'>
                  Online
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Última Actualización
                </span>
                <span className='text-sm font-medium'>Hace 5 minutos</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Versión del Sistema
                </span>
                <span className='text-sm font-medium'>v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Recientes</CardTitle>
            <CardDescription>Actividad reciente en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-sm'>Nuevo doctor registrado</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-sm'>Factura generada</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                <span className='text-sm'>Cita programada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
