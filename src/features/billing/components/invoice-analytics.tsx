'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import {
  useAdminBillingStats,
  useDoctorBillingStats,
  useInvoices,
} from '../hooks/use-billing'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  formatCurrency,
  formatCurrencyFromUSD,
  getPaymentMethodText,
  getDaysOverdue,
  isOverdue,
} from '../types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function InvoiceAnalytics() {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)

  // Get billing stats
  const { data: adminData, isLoading: adminLoading } = useAdminBillingStats(
    !isDoctor
  )

  const { data: doctorData, isLoading: doctorLoading } =
    useDoctorBillingStats(isDoctor)

  // Get recent invoices for overdue analysis
  const { data: invoicesData } = useInvoices({
    limit: 100,
    includeAppointment: true,
    includePayments: true,
  })

  const stats = isDoctor ? doctorData : adminData
  const isLoading = isDoctor ? doctorLoading : adminLoading

  if (isLoading) {
    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className='h-4 bg-gray-200 rounded w-32 animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='h-32 bg-gray-200 rounded animate-pulse' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className='text-center py-12'>
        <Receipt className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
        <div className='text-muted-foreground'>
          No hay datos de facturación disponibles
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const monthlyRevenueData = stats.monthlyRevenue.map((item) => ({
    month: item.month,
    ingresos: item.revenue,
    facturas: item.invoiceCount,
    pagos: item.paymentCount,
  }))

  const paymentMethodData = stats.payments.byMethod.map((item) => ({
    name: getPaymentMethodText(item.method),
    value: item.count,
    amount: item.amount,
  }))

  const statusDistributionData = [
    { name: 'Completadas', value: stats.invoices.completed, color: '#00C49F' },
    { name: 'Pendientes', value: stats.invoices.pending, color: '#FFBB28' },
    { name: 'Fallidas', value: stats.invoices.failed, color: '#FF8042' },
    { name: 'Vencidas', value: stats.invoices.overdue, color: '#FF4444' },
  ]

  // Get overdue invoices
  const overdueInvoices =
    invoicesData?.data?.filter(
      (invoice) => invoice.status === 'PENDING' && isOverdue(invoice.dueDate)
    ) || []

  // Get current month data (last element in the array)
  const currentMonthData = stats.monthlyRevenue[
    stats.monthlyRevenue.length - 1
  ] || {
    revenue: 0,
    invoiceCount: 0,
    paymentCount: 0,
  }

  // Get previous month data for growth calculation
  const previousMonthData = stats.monthlyRevenue[
    stats.monthlyRevenue.length - 2
  ] || {
    revenue: 0,
    invoiceCount: 0,
    paymentCount: 0,
  }

  // Calculate growth trends
  const revenueGrowth =
    previousMonthData.revenue > 0
      ? (
          ((currentMonthData.revenue - previousMonthData.revenue) /
            previousMonthData.revenue) *
          100
        ).toFixed(1)
      : currentMonthData.revenue > 0
      ? 100
      : 0

  const invoiceGrowth =
    previousMonthData.invoiceCount > 0
      ? (
          ((currentMonthData.invoiceCount - previousMonthData.invoiceCount) /
            previousMonthData.invoiceCount) *
          100
        ).toFixed(1)
      : currentMonthData.invoiceCount > 0
      ? 100
      : 0

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className='space-y-6'>
      {/* Revenue Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ingresos del Mes
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(currentMonthData.revenue)}
            </div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <TrendingUp className='mr-1 h-3 w-3 text-green-600' />+
              {revenueGrowth}% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Facturas Generadas
            </CardTitle>
            <Receipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {currentMonthData.invoiceCount}
            </div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <TrendingUp className='mr-1 h-3 w-3 text-green-600' />+
              {invoiceGrowth}% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tasa de Cobro</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.invoices.total > 0
                ? Math.round(
                    (stats.invoices.completed / stats.invoices.total) * 100
                  )
                : 0}
              %
            </div>
            <div className='text-xs text-muted-foreground'>
              {stats.invoices.completed} de {stats.invoices.total} facturas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tiempo Promedio de Pago
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>15 días</div>
            <div className='text-xs text-muted-foreground'>
              Promedio desde la facturación
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Monthly Revenue Chart */}
        <Card className='col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <BarChart className='mr-2 h-5 w-5' />
              Tendencia de Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'ingresos'
                      ? formatCurrency(value as number)
                      : value,
                    name === 'ingresos'
                      ? 'Ingresos'
                      : name === 'facturas'
                      ? 'Facturas'
                      : 'Pagos',
                  ]}
                />
                <Legend />
                <Area
                  type='monotone'
                  dataKey='ingresos'
                  stackId='1'
                  stroke='#8884d8'
                  fill='#8884d8'
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <CreditCard className='mr-2 h-5 w-5' />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} transacciones`,
                    `Total: ${formatCurrency(props.payload.amount)}`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Receipt className='mr-2 h-5 w-5' />
              Estado de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={statusDistributionData} layout='horizontal'>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis type='number' />
                <YAxis dataKey='name' type='category' />
                <Tooltip />
                <Bar dataKey='value'>
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Invoices Alert */}
      {overdueInvoices.length > 0 && (
        <Card className='border-orange-200 bg-orange-50'>
          <CardHeader>
            <CardTitle className='flex items-center text-orange-800'>
              <AlertTriangle className='mr-2 h-5 w-5' />
              Facturas Vencidas ({overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {overdueInvoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className='flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200'
                >
                  <div className='flex items-center space-x-3'>
                    {invoice.appointment && (
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='text-sm'>
                          {getInitials(
                            invoice.appointment.patient.firstName,
                            invoice.appointment.patient.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className='font-medium'>
                        Factura #{invoice.id.slice(-8)}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {invoice.appointment?.patient.firstName}{' '}
                        {invoice.appointment?.patient.lastName}
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium'>
                      {formatCurrencyFromUSD(invoice.amount)}
                    </div>
                    <Badge variant='destructive' className='text-xs'>
                      {getDaysOverdue(invoice.dueDate)} días vencida
                    </Badge>
                  </div>
                </div>
              ))}
              {overdueInvoices.length > 5 && (
                <div className='text-center text-sm text-muted-foreground'>
                  Y {overdueInvoices.length - 5} facturas más vencidas...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Ingresos Totales:</span>
              <span className='font-medium'>
                {formatCurrency(stats.invoices.totalRevenue)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                Ingresos Pendientes:
              </span>
              <span className='font-medium text-yellow-600'>
                {formatCurrency(stats.invoices.pendingRevenue)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                Ingresos Confirmados:
              </span>
              <span className='font-medium text-green-600'>
                {formatCurrency(stats.payments.completedAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Métricas de Cobro</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Facturas Emitidas:</span>
              <span className='font-medium'>{stats.invoices.total}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Facturas Pagadas:</span>
              <span className='font-medium text-green-600'>
                {stats.invoices.completed}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Tasa de Éxito:</span>
              <span className='font-medium'>
                {stats.invoices.total > 0
                  ? Math.round(
                      (stats.invoices.completed / stats.invoices.total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Pagos Procesados</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Total Procesados:</span>
              <span className='font-medium'>{stats.payments.total}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Exitosos:</span>
              <span className='font-medium text-green-600'>
                {stats.payments.completed}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Fallidos:</span>
              <span className='font-medium text-red-600'>
                {stats.payments.failed}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
