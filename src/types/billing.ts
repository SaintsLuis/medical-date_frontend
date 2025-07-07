export interface Payment {
  id: string
  patientId: string
  appointmentId?: string
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  method: 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'INSURANCE'
  paymentIntentId?: string
  stripeChargeId?: string
  patient: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    profilePhoto?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialty: string
  }
  service: {
    id: string
    name: string
    description: string
    price: number
  }
  invoice?: {
    id: string
    number: string
    dueDate: string
    issueDate: string
  }
  insurance?: {
    provider: string
    policyNumber: string
    claimNumber?: string
    coverageAmount: number
    deductible: number
  }
  metadata?: Record<string, unknown>
  failureReason?: string
  refundAmount?: number
  refundDate?: string
  createdAt: string
  updatedAt: string
}

export interface BillingMetrics {
  totalRevenue: number
  revenueThisMonth: number
  pendingPayments: number
  failedPayments: number
  totalTransactions: number
  averageTransactionValue: number
  paymentsByMethod: Record<string, number>
  revenueByMonth: Array<{
    month: string
    revenue: number
    transactions: number
  }>
  topServices: Array<{
    service: string
    revenue: number
    count: number
  }>
}

export interface BillingFilters {
  search?: string
  status?: string
  method?: string
  dateRange?: {
    start: string
    end: string
  }
  patientId?: string
  doctorId?: string
  minAmount?: number
  maxAmount?: number
}

export interface CreatePaymentData {
  patientId: string
  appointmentId?: string
  amount: number
  currency: string
  method: 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'INSURANCE'
  serviceId: string
  metadata?: Record<string, unknown>
}

export interface RefundPaymentData {
  paymentId: string
  amount: number
  reason: string
}
