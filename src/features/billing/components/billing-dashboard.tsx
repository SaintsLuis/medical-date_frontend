'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Invoice } from '../types'
import { formatCurrency, formatInvoiceAmount } from '../types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  DollarSign,
  CreditCard,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  FileText,
  RefreshCw,
  Download,
  Eye,
  Receipt,
  Banknote,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  useAdminBillingStats,
  useDoctorBillingStats,
  useInvoices,
  useMyInvoices,
  useDownloadInvoicePdf,
} from '../hooks/use-billing'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Usando la interfaz Invoice importada desde '../types'

export function BillingDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('payments')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)

  // Billing stats
  const {
    data: adminData,
    isLoading: adminLoading,
    error: adminError,
  } = useAdminBillingStats(!isDoctor)

  const {
    data: doctorData,
    isLoading: doctorLoading,
    error: doctorError,
  } = useDoctorBillingStats(isDoctor)

  // Invoices data - usar el hook correcto según el rol
  const {
    data: adminInvoicesData,
    isLoading: adminInvoicesLoading,
    error: adminInvoicesError,
    refetch: refetchAdminInvoices,
  } = useInvoices({
    page,
    limit,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    includeAppointment: true,
    includePayments: true,
  })

  const {
    data: doctorInvoicesData,
    isLoading: doctorInvoicesLoading,
    error: doctorInvoicesError,
    refetch: refetchDoctorInvoices,
  } = useMyInvoices({
    page,
    limit,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  })

  // Usar los datos correctos según el rol
  const invoicesData = isDoctor ? doctorInvoicesData : adminInvoicesData
  const invoicesLoading = isDoctor
    ? doctorInvoicesLoading
    : adminInvoicesLoading
  const invoicesError = isDoctor ? doctorInvoicesError : adminInvoicesError
  const refetchInvoices = isDoctor
    ? refetchDoctorInvoices
    : refetchAdminInvoices

  // Debug: ver qué datos tenemos
  console.log('🔍 BillingDashboard Debug:', {
    isDoctor,
    invoicesData,
    meta: invoicesData?.meta,
    totalPages: invoicesData?.meta?.totalPages,
    total: invoicesData?.meta?.total,
    page,
    limit,
  })

  // PDF download
  const downloadPdf = useDownloadInvoicePdf()

  const stats = isDoctor ? doctorData : adminData
  const isLoading = isDoctor ? doctorLoading : adminLoading
  const error = isDoctor ? doctorError : adminError

  // Filter invoices based on search and filters
  const filteredInvoices =
    invoicesData?.data?.filter((invoice: Invoice) => {
      const matchesSearch =
        searchTerm === '' ||
        `${invoice.appointment?.patient.firstName} ${invoice.appointment?.patient.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.appointment?.doctor.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        selectedStatus === 'ALL' || invoice.status === selectedStatus

      const matchesMethod =
        selectedMethod === 'ALL' || invoice.paymentMethod === selectedMethod

      return matchesSearch && matchesStatus && matchesMethod
    }) || []

  const handleDownloadPdf = async (invoiceId: string) => {
    await downloadPdf.mutateAsync(invoiceId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completado'
      case 'PENDING':
        return 'Pendiente'
      case 'FAILED':
        return 'Fallido'
      case 'REFUNDED':
        return 'Reembolsado'
      default:
        return status
    }
  }

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'PAYPAL':
        return <CreditCard className='h-4 w-4' />
      case 'CASH':
        return <Banknote className='h-4 w-4' />
      default:
        return <DollarSign className='h-4 w-4' />
    }
  }

  const getMethodText = (method?: string) => {
    switch (method) {
      case 'PAYPAL':
        return 'PayPal'
      case 'CASH':
        return 'Efectivo'
      default:
        return 'No especificado'
    }
  }

  const MetricsCards = () => {
    if (isLoading) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div className='h-4 bg-gray-200 rounded w-20 animate-pulse' />
                <div className='h-4 w-4 bg-gray-200 rounded animate-pulse' />
              </CardHeader>
              <CardContent>
                <div className='h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse' />
                <div className='h-3 bg-gray-200 rounded w-32 animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error || !stats) {
      return (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Error al cargar las estadísticas de facturación.{' '}
            <Button
              variant='link'
              size='sm'
              onClick={() => window.location.reload()}
              className='p-0 h-auto'
            >
              Intentar de nuevo
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ingresos Totales
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.invoices.totalRevenue)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(stats.invoices.pendingRevenue)} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Transacciones</CardTitle>
            <Receipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.payments.total.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.payments.completed} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Facturas Pendientes
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.invoices.pending}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.invoices.overdue} vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pagos Fallidos
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.payments.failed}</div>
            <p className='text-xs text-muted-foreground'>Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-full'>
              {getMethodIcon(invoice.paymentMethod)}
            </div>
            <div>
              <CardTitle className='text-lg'>
                Factura #{invoice.id.slice(-8)}
              </CardTitle>
              <CardDescription className='flex items-center gap-2'>
                {formatInvoiceAmount(invoice)} • {formatDate(invoice.createdAt)}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusText(invoice.status)}
            </Badge>
            <Button variant='ghost' size='sm'>
              {/* Eliminar cualquier referencia a MoreHorizontal. */}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {invoice.appointment && (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarFallback className='text-xs'>
                    {getInitials(
                      invoice.appointment.patient.firstName,
                      invoice.appointment.patient.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='text-sm font-medium'>
                    {invoice.appointment.patient.firstName}{' '}
                    {invoice.appointment.patient.lastName}
                  </div>
                  <div className='text-xs text-muted-foreground'>Paciente</div>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='p-1 bg-green-100 rounded-full'>
                  <Users className='h-3 w-3 text-green-600' />
                </div>
                <div>
                  <div className='text-sm font-medium'>
                    {invoice.appointment.doctor.firstName}{' '}
                    {invoice.appointment.doctor.lastName}
                  </div>
                  <div className='text-xs text-muted-foreground'>Médico</div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='font-medium'>Cita</div>
                  <div className='text-muted-foreground'>
                    {formatDate(invoice.appointment.date)}
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='font-medium'>Duración</div>
                  <div className='text-muted-foreground'>
                    {invoice.appointment.duration} min
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Monto</div>
              <div className='text-muted-foreground'>
                {invoice.formattedAmount ||
                  formatCurrency(invoice.amount, invoice.currency)}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Método</div>
              <div className='text-muted-foreground'>
                {getMethodText(invoice.paymentMethod)}
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm'>
          <div className='font-medium mb-1'>Vencimiento:</div>
          <div className='text-muted-foreground'>
            {formatDate(invoice.dueDate)}
          </div>
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            <div>ID: {invoice.id}</div>
            <div>Creado: {formatDate(invoice.createdAt)}</div>
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              <Eye className='mr-2 h-4 w-4' />
              Ver
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDownloadPdf(invoice.id)}
              disabled={downloadPdf.isPending}
            >
              <Download className='mr-2 h-4 w-4' />
              {downloadPdf.isPending ? 'Descargando...' : 'PDF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const AnalyticsView = () => (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats?.payments.byMethod.map(
                (item: { method: string; count: number; amount: number }) => (
                  <div
                    key={item.method}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      {getMethodIcon(item.method)}
                      <span className='font-medium'>
                        {getMethodText(item.method)}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${
                              (item.count / stats.payments.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {item.count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats?.monthlyRevenue.slice(0, 5).map(
                (
                  month: {
                    month: string
                    revenue: number
                    invoiceCount: number
                    paymentCount: number
                  },
                  index: number
                ) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <div className='font-medium'>{month.month}</div>
                      <div className='text-sm text-muted-foreground'>
                        {month.invoiceCount} facturas
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        {formatCurrency(month.revenue)}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (invoicesLoading && !invoicesData) {
    return (
      <div className='space-y-6'>
        <MetricsCards />
        <div className='text-center py-12'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground' />
          <div className='text-muted-foreground'>
            Cargando datos de facturación...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <MetricsCards />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <div className='flex items-center justify-between'>
          <TabsList>
            <TabsTrigger value='payments'>Facturas</TabsTrigger>
            <TabsTrigger value='analytics'>Analíticas</TabsTrigger>
          </TabsList>

          <Button
            variant='outline'
            size='sm'
            onClick={() => refetchInvoices()}
            disabled={invoicesLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                invoicesLoading ? 'animate-spin' : ''
              }`}
            />
            Actualizar
          </Button>
        </div>

        <TabsContent value='payments' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar facturas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Todos</SelectItem>
                <SelectItem value='PENDING'>Pendiente</SelectItem>
                <SelectItem value='COMPLETED'>Completado</SelectItem>
                <SelectItem value='FAILED'>Fallido</SelectItem>
                <SelectItem value='REFUNDED'>Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Método' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Todos</SelectItem>
                <SelectItem value='PAYPAL'>PayPal</SelectItem>
                <SelectItem value='CASH'>Efectivo</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          {invoicesError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Error al cargar las facturas. Por favor, intenta de nuevo.
              </AlertDescription>
            </Alert>
          )}

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredInvoices.map((invoice: Invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>

          {filteredInvoices.length === 0 && !invoicesLoading && (
            <div className='text-center py-12'>
              <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <div className='text-muted-foreground'>
                No se encontraron facturas que coincidan con los criterios.
              </div>
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const shouldShowPagination =
              invoicesData?.meta && invoicesData.meta.totalPages > 1
            console.log('🔍 Pagination condition:', {
              hasMeta: !!invoicesData?.meta,
              totalPages: invoicesData?.meta?.totalPages,
              shouldShow: shouldShowPagination,
            })
            if (!shouldShowPagination) return null

            return (
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Mostrando {(page - 1) * limit + 1} -{' '}
                    {Math.min(page * limit, invoicesData.meta.total)} de{' '}
                    {invoicesData.meta.total} facturas
                  </span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      setLimit(Number(v))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className='w-24'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10 por página</SelectItem>
                      <SelectItem value='20'>20 por página</SelectItem>
                      <SelectItem value='50'>50 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    Primera
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page - 1)}
                    disabled={!invoicesData.meta.hasPreviousPage}
                  >
                    Anterior
                  </Button>
                  <span className='text-sm font-mono px-2'>
                    &lt; {page} &gt;
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page + 1)}
                    disabled={!invoicesData.meta.hasNextPage}
                  >
                    Siguiente
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(invoicesData.meta.totalPages)}
                    disabled={page === invoicesData.meta.totalPages}
                  >
                    Última
                  </Button>
                </div>
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value='analytics'>
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
