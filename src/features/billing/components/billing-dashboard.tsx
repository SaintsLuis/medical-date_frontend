'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Plus,
  MoreHorizontal,
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
  Wallet,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockPayments = [
  {
    id: 'pay_1',
    patientId: 'pat_1',
    appointmentId: 'app_1',
    amount: 250.0,
    currency: 'USD',
    status: 'PAID',
    method: 'CARD',
    paymentIntentId: 'pi_1234567890',
    stripeChargeId: 'ch_1234567890',
    patient: {
      id: 'pat_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      profilePhoto: '/placeholder-avatar.jpg',
    },
    doctor: {
      id: 'doc_1',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      specialty: 'Cardiology',
    },
    service: {
      id: 'serv_1',
      name: 'Cardiology Consultation',
      description: 'Comprehensive cardiac evaluation and consultation',
      price: 250.0,
    },
    invoice: {
      id: 'inv_1',
      number: 'INV-2024-001',
      dueDate: '2024-01-30T00:00:00Z',
      issueDate: '2024-01-15T00:00:00Z',
    },
    insurance: {
      provider: 'BlueCross BlueShield',
      policyNumber: 'BC123456789',
      claimNumber: 'CLM789012',
      coverageAmount: 200.0,
      deductible: 50.0,
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
  },
  {
    id: 'pay_2',
    patientId: 'pat_2',
    appointmentId: 'app_2',
    amount: 150.0,
    currency: 'USD',
    status: 'PENDING',
    method: 'INSURANCE',
    patient: {
      id: 'pat_2',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@email.com',
      phone: '+1 (555) 234-5678',
      profilePhoto: '/placeholder-avatar.jpg',
    },
    doctor: {
      id: 'doc_2',
      firstName: 'Dr. Lisa',
      lastName: 'Thompson',
      specialty: 'Endocrinology',
    },
    service: {
      id: 'serv_2',
      name: 'Diabetes Management',
      description: 'Comprehensive diabetes care and management',
      price: 150.0,
    },
    invoice: {
      id: 'inv_2',
      number: 'INV-2024-002',
      dueDate: '2024-02-10T00:00:00Z',
      issueDate: '2024-01-20T00:00:00Z',
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET987654321',
      claimNumber: 'CLM345678',
      coverageAmount: 120.0,
      deductible: 30.0,
    },
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
  },
]

const mockMetrics = {
  totalRevenue: 125670.5,
  revenueThisMonth: 18430.25,
  pendingPayments: 12,
  failedPayments: 3,
  totalTransactions: 1247,
  averageTransactionValue: 186.75,
  paymentsByMethod: {
    CARD: 756,
    INSURANCE: 345,
    CASH: 89,
    BANK_TRANSFER: 45,
    CHECK: 12,
  },
  revenueByMonth: [
    { month: 'Jan', revenue: 18430.25, transactions: 125 },
    { month: 'Dec', revenue: 16890.5, transactions: 118 },
    { month: 'Nov', revenue: 19245.75, transactions: 134 },
    { month: 'Oct', revenue: 17656.25, transactions: 121 },
    { month: 'Sep', revenue: 18990.0, transactions: 128 },
  ],
  topServices: [
    { service: 'General Consultation', revenue: 45230.0, count: 234 },
    { service: 'Cardiology Consultation', revenue: 32145.5, count: 156 },
    { service: 'Orthopedic Consultation', revenue: 28675.25, count: 123 },
    { service: 'Dental Cleaning', revenue: 19890.75, count: 189 },
  ],
}

export function BillingDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('payments')

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      searchTerm === '' ||
      `${payment.patient.firstName} ${payment.patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice?.number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === 'ALL' || payment.status === selectedStatus
    const matchesMethod =
      selectedMethod === 'ALL' || payment.method === selectedMethod

    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD':
        return <CreditCard className='h-4 w-4' />
      case 'CASH':
        return <Banknote className='h-4 w-4' />
      case 'BANK_TRANSFER':
        return <Wallet className='h-4 w-4' />
      case 'INSURANCE':
        return <Receipt className='h-4 w-4' />
      case 'CHECK':
        return <FileText className='h-4 w-4' />
      default:
        return <DollarSign className='h-4 w-4' />
    }
  }

  const MetricsCards = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatCurrency(mockMetrics.totalRevenue)}
          </div>
          <p className='text-xs text-muted-foreground'>
            +{formatCurrency(mockMetrics.revenueThisMonth)} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
          <Receipt className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.totalTransactions.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            Avg: {formatCurrency(mockMetrics.averageTransactionValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.pendingPayments}
          </div>
          <p className='text-xs text-muted-foreground'>Awaiting payment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Failed</CardTitle>
          <AlertCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{mockMetrics.failedPayments}</div>
          <p className='text-xs text-muted-foreground'>Require attention</p>
        </CardContent>
      </Card>
    </div>
  )

  const PaymentCard = ({ payment }: { payment: any }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-green-100 rounded-full'>
              {getMethodIcon(payment.method)}
            </div>
            <div>
              <CardTitle className='text-lg'>{payment.service.name}</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                {payment.invoice?.number} • {formatCurrency(payment.amount)}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center space-x-2'>
            <Avatar className='h-6 w-6'>
              <AvatarImage
                src={payment.patient.profilePhoto}
                alt={`${payment.patient.firstName} ${payment.patient.lastName}`}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(
                  payment.patient.firstName,
                  payment.patient.lastName
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='text-sm font-medium'>
                {payment.patient.firstName} {payment.patient.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>Patient</div>
            </div>
          </div>
          {payment.doctor && (
            <div className='flex items-center space-x-2'>
              <div className='p-1 bg-blue-100 rounded-full'>
                <Users className='h-3 w-3 text-blue-600' />
              </div>
              <div>
                <div className='text-sm font-medium'>
                  {payment.doctor.firstName} {payment.doctor.lastName}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {payment.doctor.specialty}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Amount</div>
              <div className='text-muted-foreground'>
                {formatCurrency(payment.amount)}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Date</div>
              <div className='text-muted-foreground'>
                {formatDate(payment.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm'>
          <div className='font-medium mb-1'>Service:</div>
          <div className='text-muted-foreground'>
            {payment.service.description}
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          {payment.insurance && (
            <div className='flex items-start space-x-2 text-sm'>
              <Receipt className='h-4 w-4 text-blue-500 mt-0.5' />
              <div>
                <div className='font-medium'>
                  Insurance: {payment.insurance.provider}
                </div>
                <div className='text-muted-foreground'>
                  Coverage: {formatCurrency(payment.insurance.coverageAmount)} •
                  Deductible: {formatCurrency(payment.insurance.deductible)}
                </div>
                {payment.insurance.claimNumber && (
                  <div className='text-xs text-muted-foreground'>
                    Claim: {payment.insurance.claimNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {payment.failureReason && (
            <div className='flex items-start space-x-2 text-sm'>
              <AlertCircle className='h-4 w-4 text-red-500 mt-0.5' />
              <div>
                <div className='font-medium text-red-600'>Failure Reason:</div>
                <div className='text-red-500'>{payment.failureReason}</div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            {payment.invoice && <div>Invoice: {payment.invoice.number}</div>}
            <div>Method: {payment.method}</div>
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              <Eye className='mr-2 h-4 w-4' />
              View
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              Receipt
            </Button>
            {payment.status === 'FAILED' && (
              <Button size='sm'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            )}
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
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(mockMetrics.paymentsByMethod).map(
                ([method, count]) => (
                  <div
                    key={method}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      {getMethodIcon(method)}
                      <span className='font-medium'>
                        {method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${
                              (count / mockMetrics.totalTransactions) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {count}
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
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMetrics.topServices.map((service, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>{service.service}</div>
                    <div className='text-sm text-muted-foreground'>
                      {service.count} transactions
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium'>
                      {formatCurrency(service.revenue)}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {formatCurrency(service.revenue / service.count)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {mockMetrics.revenueByMonth.map((month, index) => (
              <div key={index} className='flex items-center justify-between'>
                <span className='font-medium'>{month.month}</span>
                <div className='flex items-center space-x-4'>
                  <div className='text-right'>
                    <div className='font-medium'>
                      {formatCurrency(month.revenue)}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {month.transactions} transactions
                    </div>
                  </div>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${
                          (month.revenue /
                            Math.max(
                              ...mockMetrics.revenueByMonth.map(
                                (m) => m.revenue
                              )
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className='space-y-6'>
      <MetricsCards />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='payments' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search payments...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='PAID'>Paid</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='FAILED'>Failed</SelectItem>
                <SelectItem value='REFUNDED'>Refunded</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='CARD'>Card</SelectItem>
                <SelectItem value='CASH'>Cash</SelectItem>
                <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
                <SelectItem value='INSURANCE'>Insurance</SelectItem>
                <SelectItem value='CHECK'>Check</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>
                No payments found matching your criteria.
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='analytics'>
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
