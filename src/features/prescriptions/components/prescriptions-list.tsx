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
  Calendar,
  Stethoscope,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Pill,
  MapPin,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Download,
  Send,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockPrescriptions = [
  {
    id: '1',
    patientId: 'pat_1',
    doctorId: 'doc_1',
    appointmentId: 'app_1',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    quantity: 30,
    instructions:
      'Take with food in the morning. Monitor blood pressure regularly.',
    refills: 5,
    refillsRemaining: 3,
    patient: {
      id: 'pat_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1985-03-15',
      profilePhoto: '/placeholder-avatar.jpg',
    },
    doctor: {
      id: 'doc_1',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      specialty: 'Cardiology',
      licenseNumber: 'MD123456',
    },
    status: 'ACTIVE',
    prescribedDate: '2024-01-15T10:30:00Z',
    expiryDate: '2024-07-15T10:30:00Z',
    lastFilledDate: '2024-01-15T10:30:00Z',
    pharmacy: {
      id: 'pharm_1',
      name: 'MedPlus Pharmacy',
      address: '123 Main St, New York, NY 10001',
      phone: '+1 (555) 123-4567',
    },
    notes:
      'Patient has been on this medication for 6 months with good tolerance.',
    isGeneric: true,
    cost: 25.5,
    currency: 'USD',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    patientId: 'pat_2',
    doctorId: 'doc_2',
    appointmentId: 'app_2',
    medicationName: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '90 days',
    quantity: 180,
    instructions: 'Take with meals. May cause stomach upset initially.',
    refills: 2,
    refillsRemaining: 1,
    patient: {
      id: 'pat_2',
      firstName: 'James',
      lastName: 'Wilson',
      dateOfBirth: '1970-08-22',
      profilePhoto: '/placeholder-avatar.jpg',
    },
    doctor: {
      id: 'doc_2',
      firstName: 'Dr. Lisa',
      lastName: 'Thompson',
      specialty: 'Endocrinology',
      licenseNumber: 'MD789012',
    },
    status: 'ACTIVE',
    prescribedDate: '2024-01-10T14:00:00Z',
    expiryDate: '2024-07-10T14:00:00Z',
    lastFilledDate: '2024-01-10T14:00:00Z',
    pharmacy: {
      id: 'pharm_2',
      name: 'CVS Pharmacy',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      phone: '+1 (555) 234-5678',
    },
    notes: 'Monitor HbA1c levels quarterly.',
    isGeneric: true,
    cost: 15.75,
    currency: 'USD',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
  },
]

const mockMetrics = {
  totalPrescriptions: 1456,
  activePrescriptions: 1234,
  expiredPrescriptions: 123,
  filledPrescriptions: 1298,
  prescriptionsThisMonth: 156,
  topMedications: [
    { medication: 'Lisinopril', count: 234 },
    { medication: 'Metformin', count: 198 },
    { medication: 'Amlodipine', count: 167 },
    { medication: 'Atorvastatin', count: 145 },
    { medication: 'Omeprazole', count: 123 },
  ],
  prescriptionsByStatus: {
    ACTIVE: 1234,
    FILLED: 1298,
    CANCELLED: 45,
    EXPIRED: 123,
  },
  prescriptionsBySpecialty: [
    { specialty: 'Cardiology', count: 445 },
    { specialty: 'Endocrinology', count: 334 },
    { specialty: 'Internal Medicine', count: 278 },
    { specialty: 'Pulmonology', count: 199 },
    { specialty: 'Psychiatry', count: 156 },
  ],
}

export function PrescriptionsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('list')

  const filteredPrescriptions = mockPrescriptions.filter((prescription) => {
    const matchesSearch =
      searchTerm === '' ||
      prescription.medicationName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${prescription.patient.firstName} ${prescription.patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.doctor.specialty
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === 'ALL' || prescription.status === selectedStatus
    const matchesSpecialty =
      selectedSpecialty === 'ALL' ||
      prescription.doctor.specialty === selectedSpecialty

    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'FILLED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className='h-4 w-4 text-green-600' />
      case 'FILLED':
        return <Pill className='h-4 w-4 text-blue-600' />
      case 'CANCELLED':
        return <AlertTriangle className='h-4 w-4 text-red-600' />
      case 'EXPIRED':
        return <Clock className='h-4 w-4 text-gray-600' />
      default:
        return <FileText className='h-4 w-4 text-gray-600' />
    }
  }

  const isNearExpiry = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysDifference = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24)
    )
    return daysDifference <= 30 && daysDifference >= 0
  }

  const MetricsCards = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Prescriptions
          </CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.totalPrescriptions.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            +{mockMetrics.prescriptionsThisMonth} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.activePrescriptions.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {(
              (mockMetrics.activePrescriptions /
                mockMetrics.totalPrescriptions) *
              100
            ).toFixed(1)}
            % of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Filled</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.filledPrescriptions.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {(
              (mockMetrics.filledPrescriptions /
                mockMetrics.totalPrescriptions) *
              100
            ).toFixed(1)}
            % fill rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Expired</CardTitle>
          <AlertCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.expiredPrescriptions}
          </div>
          <p className='text-xs text-muted-foreground'>Require renewal</p>
        </CardContent>
      </Card>
    </div>
  )

  const PrescriptionCard = ({ prescription }: { prescription: any }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-full'>
              <Pill className='h-4 w-4 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-lg'>
                {prescription.medicationName}
              </CardTitle>
              <CardDescription className='flex items-center gap-2'>
                {prescription.dosage} • {prescription.frequency}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className={getStatusColor(prescription.status)}>
              {prescription.status}
            </Badge>
            {isNearExpiry(prescription.expiryDate) && (
              <Badge variant='destructive'>
                <AlertTriangle className='h-3 w-3 mr-1' />
                Expiring Soon
              </Badge>
            )}
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
                src={prescription.patient.profilePhoto}
                alt={`${prescription.patient.firstName} ${prescription.patient.lastName}`}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(
                  prescription.patient.firstName,
                  prescription.patient.lastName
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='text-sm font-medium'>
                {prescription.patient.firstName} {prescription.patient.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>Patient</div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Stethoscope className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='text-sm font-medium'>
                {prescription.doctor.firstName} {prescription.doctor.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>
                {prescription.doctor.specialty}
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Duration</div>
              <div className='text-muted-foreground'>
                {prescription.duration}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <RefreshCw className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='font-medium'>Refills</div>
              <div className='text-muted-foreground'>
                {prescription.refillsRemaining}/{prescription.refills}
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm'>
          <div className='font-medium mb-1'>Instructions:</div>
          <div className='text-muted-foreground'>
            {prescription.instructions}
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          {prescription.pharmacy && (
            <div className='flex items-start space-x-2 text-sm'>
              <MapPin className='h-4 w-4 text-green-500 mt-0.5' />
              <div>
                <div className='font-medium'>{prescription.pharmacy.name}</div>
                <div className='text-muted-foreground'>
                  {prescription.pharmacy.address}
                </div>
                <div className='text-muted-foreground'>
                  {prescription.pharmacy.phone}
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center space-x-2'>
              <DollarSign className='h-4 w-4 text-yellow-500' />
              <span className='font-medium'>Cost: ${prescription.cost}</span>
              {prescription.isGeneric && (
                <Badge variant='outline' className='text-xs'>
                  Generic
                </Badge>
              )}
            </div>
            <div className='text-muted-foreground'>
              Qty: {prescription.quantity}
            </div>
          </div>
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            Prescribed: {formatDate(prescription.prescribedDate)}
            {prescription.expiryDate && (
              <div>Expires: {formatDate(prescription.expiryDate)}</div>
            )}
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              Print
            </Button>
            <Button variant='outline' size='sm'>
              <Send className='mr-2 h-4 w-4' />
              Send to Pharmacy
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
            <CardTitle>Top Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMetrics.topMedications.map((medication, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='font-medium'>{medication.medication}</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{
                          width: `${
                            (medication.count /
                              mockMetrics.totalPrescriptions) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {medication.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescriptions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(mockMetrics.prescriptionsByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(status)}
                      <span className='font-medium'>{status}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-green-600 h-2 rounded-full'
                          style={{
                            width: `${
                              (count / mockMetrics.totalPrescriptions) * 100
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescriptions by Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {mockMetrics.prescriptionsBySpecialty.map((specialty, index) => (
              <div key={index} className='flex items-center justify-between'>
                <span className='font-medium'>{specialty.specialty}</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-purple-600 h-2 rounded-full'
                      style={{
                        width: `${
                          (specialty.count / mockMetrics.totalPrescriptions) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {specialty.count}
                  </span>
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
          <TabsTrigger value='list'>Prescriptions List</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search prescriptions...'
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
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='FILLED'>Filled</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                <SelectItem value='EXPIRED'>Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Specialty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Specialties</SelectItem>
                {mockMetrics.prescriptionsBySpecialty.map((specialty) => (
                  <SelectItem
                    key={specialty.specialty}
                    value={specialty.specialty}
                  >
                    {specialty.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
              />
            ))}
          </div>

          {filteredPrescriptions.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>
                No prescriptions found matching your criteria.
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
