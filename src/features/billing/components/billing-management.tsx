'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Plus,
  DollarSign,
  CreditCard,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Download,
  Eye,
  Receipt,
  Banknote,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  useInvoices,
  useMyInvoices,
  useAdminBillingStats,
  useDoctorBillingStats,
  useDownloadInvoicePdf,
  useDeleteInvoice,
} from '../hooks/use-billing'
import { InvoiceForm } from './invoice-form'
import { InvoiceAnalytics } from './invoice-analytics'
import {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  formatCurrency,
  formatCurrencyFromUSD,
  getStatusColor,
  getStatusText,
  getPaymentMethodText,
  isOverdue,
  getDaysOverdue,
} from '../types'

export function BillingManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('invoices')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const isAdmin = user?.roles.includes(UserRole.ADMIN)

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

  // Invoices data - usar hook diferente según el rol
  const invoicesParams = {
    page,
    limit,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  }

  const {
    data: adminInvoicesData,
    isLoading: adminInvoicesLoading,
    error: adminInvoicesError,
    refetch: refetchAdminInvoices,
  } = useInvoices({
    ...invoicesParams,
    includeAppointment: true,
    includePayments: true,
  })

  const {
    data: doctorInvoicesData,
    isLoading: doctorInvoicesLoading,
    error: doctorInvoicesError,
    refetch: refetchDoctorInvoices,
  } = useMyInvoices(invoicesParams)

  // Usar datos apropiados según el rol
  const invoicesData = isDoctor ? doctorInvoicesData : adminInvoicesData
  const invoicesLoading = isDoctor
    ? doctorInvoicesLoading
    : adminInvoicesLoading
  const invoicesError = isDoctor ? doctorInvoicesError : adminInvoicesError
  const refetchInvoices = isDoctor
    ? refetchDoctorInvoices
    : refetchAdminInvoices

  // Mutations
  const downloadPdf = useDownloadInvoicePdf()
  const deleteInvoice = useDeleteInvoice()

  const stats = isDoctor ? doctorData : adminData
  const isLoading = isDoctor ? doctorLoading : adminLoading
  const error = isDoctor ? doctorError : adminError

  // Filter invoices based on search and filters
  const filteredInvoices =
    (invoicesData?.data as Invoice[] | undefined)?.filter(
      (invoice: Invoice) => {
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
      }
    ) || []

  const handleCreateNew = () => {
    setSelectedInvoice(null)
    setIsFormOpen(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsFormOpen(true)
  }

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return

    await deleteInvoice.mutateAsync(selectedInvoice.id)
    setIsDeleteDialogOpen(false)
    setSelectedInvoice(null)
  }

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailsOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedInvoice(null)
    refetchInvoices()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedInvoice(null)
  }

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

  const getMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'PAYPAL':
        return <CreditCard className='h-4 w-4' />
      case 'CASH':
        return <Banknote className='h-4 w-4' />
      default:
        return <DollarSign className='h-4 w-4' />
    }
  }

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className='h-4 w-4 text-green-600' />
      case 'PENDING':
        return <Clock className='h-4 w-4 text-yellow-600' />
      case 'FAILED':
        return <XCircle className='h-4 w-4 text-red-600' />
      case 'REFUNDED':
        return <AlertTriangle className='h-4 w-4 text-blue-600' />
      default:
        return <AlertCircle className='h-4 w-4 text-gray-600' />
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
            <CardTitle className='text-sm font-medium'>Facturas</CardTitle>
            <Receipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.invoices.total.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.invoices.pending} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pagos Completados
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.payments.completed}</div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(stats.payments.completedAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Facturas Vencidas
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.invoices.overdue}</div>
            <p className='text-xs text-muted-foreground'>Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const InvoicesTable = () => {
    if (invoicesLoading) {
      return (
        <Card>
          <CardContent className='p-6'>
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground' />
              <div className='text-muted-foreground'>Cargando facturas...</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (invoicesError) {
      return (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Error al cargar las facturas. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      )
    }

    if (filteredInvoices.length === 0) {
      return (
        <Card>
          <CardContent className='p-6'>
            <div className='text-center py-12'>
              <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <div className='text-muted-foreground'>
                No se encontraron facturas que coincidan con los criterios.
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <div className='p-2 bg-blue-100 rounded-full'>
                        <Receipt className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <div className='font-medium'>
                          #{invoice.id.slice(-8)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.appointment && (
                      <div className='flex items-center space-x-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback className='text-sm'>
                            {getInitials(
                              invoice.appointment.patient.firstName,
                              invoice.appointment.patient.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>
                            {invoice.appointment.patient.firstName}{' '}
                            {invoice.appointment.patient.lastName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {invoice.appointment.patient.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.appointment && (
                      <div>
                        <div className='font-medium'>
                          {invoice.appointment.doctor.firstName}{' '}
                          {invoice.appointment.doctor.lastName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {invoice.appointment.doctor.email}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>
                      {formatCurrencyFromUSD(invoice.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(invoice.status)}
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                      {isOverdue(invoice.dueDate) &&
                        invoice.status === 'PENDING' && (
                          <Badge variant='destructive' className='text-xs'>
                            {getDaysOverdue(invoice.dueDate)} días vencida
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      {getMethodIcon(invoice.paymentMethod)}
                      <span className='text-sm'>
                        {getPaymentMethodText(invoice.paymentMethod)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>{formatDate(invoice.dueDate)}</div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end space-x-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDownloadPdf(invoice.id)}
                        disabled={downloadPdf.isPending}
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDelete(invoice)}
                            className='text-red-600 hover:text-red-800'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  const InvoiceDetailsDialog = () => {
    if (!selectedInvoice) return null

    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Factura #{selectedInvoice.id.slice(-8)}</DialogTitle>
            <DialogDescription>
              Detalles completos de la factura
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Estado
                </label>
                <div className='flex items-center space-x-2 mt-1'>
                  {getStatusIcon(selectedInvoice.status)}
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {getStatusText(selectedInvoice.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Monto
                </label>
                <div className='text-lg font-semibold mt-1'>
                  {formatCurrencyFromUSD(selectedInvoice.amount)}
                </div>
              </div>
            </div>

            {selectedInvoice.appointment && (
              <>
                <Separator />
                <div>
                  <h4 className='font-medium mb-3'>Información de la Cita</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>
                        Paciente
                      </label>
                      <div className='mt-1'>
                        <div className='font-medium'>
                          {selectedInvoice.appointment.patient.firstName}{' '}
                          {selectedInvoice.appointment.patient.lastName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {selectedInvoice.appointment.patient.email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>
                        Doctor
                      </label>
                      <div className='mt-1'>
                        <div className='font-medium'>
                          {selectedInvoice.appointment.doctor.firstName}{' '}
                          {selectedInvoice.appointment.doctor.lastName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {selectedInvoice.appointment.doctor.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Método de Pago
                </label>
                <div className='flex items-center space-x-2 mt-1'>
                  {getMethodIcon(selectedInvoice.paymentMethod)}
                  <span>
                    {getPaymentMethodText(selectedInvoice.paymentMethod)}
                  </span>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Fecha de Vencimiento
                </label>
                <div className='mt-1'>
                  {formatDate(selectedInvoice.dueDate)}
                  {isOverdue(selectedInvoice.dueDate) &&
                    selectedInvoice.status === 'PENDING' && (
                      <Badge variant='destructive' className='ml-2 text-xs'>
                        Vencida
                      </Badge>
                    )}
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Creada
                </label>
                <div className='mt-1'>
                  {formatDate(selectedInvoice.createdAt)}
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => handleDownloadPdf(selectedInvoice.id)}
                disabled={downloadPdf.isPending}
              >
                <Download className='mr-2 h-4 w-4' />
                Descargar PDF
              </Button>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false)
                    handleEdit(selectedInvoice)
                  }}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Facturación
          </h1>
          <p className='text-muted-foreground'>
            Administra facturas, pagos y estadísticas financieras
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreateNew}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva Factura
          </Button>
        )}
      </div>

      <MetricsCards />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <div className='flex items-center justify-between'>
          <TabsList>
            <TabsTrigger value='invoices'>
              <Receipt className='mr-2 h-4 w-4' />
              Facturas
            </TabsTrigger>
            <TabsTrigger value='analytics'>
              <BarChart3 className='mr-2 h-4 w-4' />
              Analíticas
            </TabsTrigger>
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

        <TabsContent value='invoices' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar facturas por paciente, doctor o ID...'
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

          <InvoicesTable />

          {/* Pagination */}
          {invoicesData?.meta && invoicesData.meta.totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Página {page} de {invoicesData.meta.totalPages} (
                {invoicesData.meta.total} facturas)
              </div>
              <div className='space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPage(page - 1)}
                  disabled={!invoicesData.meta.hasPreviousPage}
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPage(page + 1)}
                  disabled={!invoicesData.meta.hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='analytics'>
          <InvoiceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice ? 'Editar Factura' : 'Nueva Factura'}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice
                ? 'Actualiza la información de la factura'
                : 'Crea una nueva factura para una cita'}
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              factura #{selectedInvoice?.id.slice(-8)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
