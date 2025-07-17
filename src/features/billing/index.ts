// Components
export { BillingDashboard } from './components/billing-dashboard'
export { BillingManagement } from './components/billing-management'
export { InvoiceForm } from './components/invoice-form'
export { InvoiceAnalytics } from './components/invoice-analytics'
export {
  BillingSkeleton,
  BillingAnalyticsSkeleton,
  InvoiceFormSkeleton,
} from './components/billing-skeleton'

// Hooks
export {
  useAdminBillingStats,
  useDoctorBillingStats,
  useInvoices,
  useInvoice,
  useInvoicesByPatient,
  useInvoicesByDoctor,
  useDownloadInvoicePdf,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useBillingManagement,
} from './hooks/use-billing'

// Types
export type {
  Invoice,
  Payment,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
  CreateInvoiceData,
  UpdateInvoiceData,
  QueryInvoicesParams,
  PaginatedInvoicesResponse,
  InvoiceStats,
  PaymentStats,
  BillingStats,
  InvoiceFormData,
  InvoiceFilters,
  InvoiceAnalytics as InvoiceAnalyticsData,
} from './types'

// Utility functions
export {
  formatCurrency,
  getStatusColor,
  getStatusText,
  getPaymentMethodText,
  isOverdue,
  getDaysOverdue,
} from './types'
