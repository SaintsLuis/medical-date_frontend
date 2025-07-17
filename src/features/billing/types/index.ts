// src/features/billing/types/index.ts

// src/features/billing/types/index.ts

export type PaymentMethod = 'PAYPAL' | 'CASH'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type InvoiceStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Invoice {
  id: string
  appointmentId: string
  amount: number
  status: InvoiceStatus
  paymentMethod?: PaymentMethod
  paymentId?: string
  paidAt?: string
  dueDate: string
  createdAt: string
  updatedAt: string
  appointment?: {
    id: string
    date: string
    duration: number
    type: string
    patient: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }
  payments?: Payment[]
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  paymentId: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  appointmentId: string
  amount: number
  dueDate: string
  paymentMethod?: PaymentMethod
}

export interface UpdateInvoiceData {
  amount?: number
  dueDate?: string
  status?: InvoiceStatus
  paymentMethod?: PaymentMethod
}

export interface QueryInvoicesParams {
  page?: number
  limit?: number
  status?: string
  patientId?: string
  doctorId?: string
  includeAppointment?: boolean
  includePayments?: boolean
  sortBy?: 'amount' | 'dueDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedInvoicesResponse {
  data: Invoice[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface InvoiceStats {
  total: number
  pending: number
  completed: number
  failed: number
  overdue: number
  totalRevenue: number
  pendingRevenue: number
  byPaymentMethod: Array<{
    method: PaymentMethod
    count: number
    amount: number
  }>
}

export interface PaymentStats {
  total: number
  completed: number
  pending: number
  failed: number
  refunded: number
  totalAmount: number
  completedAmount: number
  pendingAmount: number
  byMethod: Array<{
    method: PaymentMethod
    count: number
    amount: number
  }>
}

export interface BillingStats {
  invoices: InvoiceStats
  payments: PaymentStats
  monthlyRevenue: Array<{
    month: string
    revenue: number
    invoiceCount: number
    paymentCount: number
  }>
}

export interface InvoiceFormData {
  appointmentId: string
  amount: number
  dueDate: string
  paymentMethod?: PaymentMethod
}

export interface InvoiceFilters {
  search: string
  status: InvoiceStatus | ''
  paymentMethod: PaymentMethod | ''
  patientId: string
  doctorId: string
  startDate: string
  endDate: string
  minAmount: number | null
  maxAmount: number | null
}

export interface InvoiceAnalytics {
  revenueByMonth: Array<{
    month: string
    revenue: number
    invoices: number
  }>
  paymentMethodDistribution: Array<{
    method: PaymentMethod
    count: number
    percentage: number
  }>
  statusDistribution: Array<{
    status: InvoiceStatus
    count: number
    percentage: number
  }>
  topPatients: Array<{
    patientId: string
    patientName: string
    totalAmount: number
    invoiceCount: number
  }>
  overdueInvoices: Array<{
    id: string
    amount: number
    daysOverdue: number
    patientName: string
  }>
}

// Utility functions
const USD_TO_DOP_RATE = 60.5

export const convertUSDToDOP = (amountUSD: number): number => {
  return amountUSD * USD_TO_DOP_RATE
}

export const formatCurrency = (
  amountInDOP: number,
  currency: string = 'DOP'
): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: currency,
  }).format(amountInDOP)
}

export const formatCurrencyFromUSD = (
  amountUSD: number,
  currency: string = 'DOP'
): string => {
  const convertedAmount = convertUSDToDOP(amountUSD)
  return formatCurrency(convertedAmount, currency)
}

export const getStatusColor = (status: InvoiceStatus): string => {
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

export const getStatusText = (status: InvoiceStatus): string => {
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

export const getPaymentMethodText = (method?: PaymentMethod): string => {
  switch (method) {
    case 'PAYPAL':
      return 'PayPal'
    case 'CASH':
      return 'Efectivo'
    default:
      return 'No especificado'
  }
}

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

export const getDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate)
  const now = new Date()
  if (due >= now) return 0
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function mapPaymentFromApi(payment: unknown): Payment {
  const p = payment as Record<string, unknown>
  return {
    id: String(p.id),
    amount: Number(p.amount),
    currency: String(p.currency),
    status: (p.status as PaymentStatus) ?? 'PENDING',
    paymentMethod: (p.paymentMethod as PaymentMethod) ?? 'CASH',
    paymentId: String(p.paymentId),
    createdAt: String(p.createdAt),
    updatedAt: String(p.updatedAt),
  }
}

export function mapInvoiceFromApi(invoice: unknown): Invoice {
  const inv = invoice as Record<string, unknown>
  return {
    id: String(inv.id),
    appointmentId: String(inv.appointmentId),
    amount: Number(inv.amount),
    status: (inv.status as InvoiceStatus) ?? 'PENDING',
    paymentMethod: (inv.paymentMethod as PaymentMethod) ?? undefined,
    paymentId: inv.paymentId ? String(inv.paymentId) : undefined,
    paidAt: inv.paidAt ? String(inv.paidAt) : undefined,
    dueDate: String(inv.dueDate),
    createdAt: String(inv.createdAt),
    updatedAt: String(inv.updatedAt),
    appointment: inv.appointment as Invoice['appointment'],
    payments: Array.isArray(inv.payments)
      ? (inv.payments as unknown[]).map(mapPaymentFromApi)
      : undefined,
  }
}
