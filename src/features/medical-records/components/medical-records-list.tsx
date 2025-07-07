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
  FileText,
  User,
  Stethoscope,
  Activity,
  TrendingUp,
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Share,
  Eye,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockRecords = [
  {
    id: '1',
    patientId: 'pat_1',
    doctorId: 'doc_1',
    appointmentId: 'app_1',
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
    },
    recordType: 'CONSULTATION',
    title: 'Routine Cardiology Consultation',
    description:
      'Regular check-up for hypertension management and heart health assessment.',
    symptoms: ['Chest discomfort', 'Shortness of breath', 'Fatigue'],
    diagnosis: 'Hypertension (Stage 1) - Well controlled',
    treatment:
      'Continue current medication regimen. Lifestyle modifications recommended.',
    prescriptions: [
      {
        id: 'presc_1',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
      },
    ],
    vitalSigns: {
      bloodPressure: '130/85 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '165 lbs',
      height: '5\'6"',
    },
    labResults: [
      {
        testName: 'Lipid Panel',
        result: 'Total Cholesterol: 195 mg/dL',
        normalRange: '< 200 mg/dL',
        status: 'Normal',
      },
    ],
    attachments: [
      {
        id: 'att_1',
        fileName: 'ECG_Results.pdf',
        fileType: 'application/pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2024-01-15T14:30:00Z',
      },
    ],
    followUpDate: '2024-04-15T10:00:00Z',
    notes:
      'Patient responding well to current treatment. Continue monitoring BP at home.',
    isConfidential: false,
    status: 'COMPLETED',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T15:45:00Z',
  },
  {
    id: '2',
    patientId: 'pat_2',
    doctorId: 'doc_2',
    appointmentId: 'app_2',
    patient: {
      id: 'pat_2',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      dateOfBirth: '1992-12-05',
      profilePhoto: '/placeholder-avatar.jpg',
    },
    doctor: {
      id: 'doc_2',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      specialty: 'Dermatology',
    },
    recordType: 'EXAMINATION',
    title: 'Dermatological Examination',
    description: 'Skin examination for suspicious mole on left shoulder.',
    symptoms: ['Changing mole', 'Itching', 'Irregular borders'],
    diagnosis: 'Atypical nevus - Benign but requires monitoring',
    treatment: 'Mole removal scheduled. Regular skin checks recommended.',
    prescriptions: [],
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '68 bpm',
      temperature: '98.2°F',
      weight: '130 lbs',
      height: '5\'4"',
    },
    labResults: [],
    attachments: [
      {
        id: 'att_2',
        fileName: 'Dermoscopy_Images.jpg',
        fileType: 'image/jpeg',
        fileSize: '5.2 MB',
        uploadedAt: '2024-01-18T11:20:00Z',
      },
    ],
    followUpDate: '2024-03-18T14:00:00Z',
    notes:
      'Scheduled for mole removal next week. Patient educated on skin cancer prevention.',
    isConfidential: false,
    status: 'COMPLETED',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T12:15:00Z',
  },
]

const mockMetrics = {
  totalRecords: 2847,
  recordsThisMonth: 187,
  pendingRecords: 23,
  completedRecords: 2824,
  recordsByType: {
    CONSULTATION: 1423,
    EXAMINATION: 892,
    FOLLOW_UP: 456,
    EMERGENCY: 76,
  },
  recordsBySpecialty: [
    { specialty: 'Internal Medicine', count: 623 },
    { specialty: 'Cardiology', count: 445 },
    { specialty: 'Dermatology', count: 334 },
    { specialty: 'Endocrinology', count: 278 },
    { specialty: 'Orthopedics', count: 267 },
  ],
}

export function MedicalRecordsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('list')

  const filteredRecords = mockRecords.filter((record) => {
    const matchesSearch =
      searchTerm === '' ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${record.patient.firstName} ${record.patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      selectedType === 'ALL' || record.recordType === selectedType
    const matchesStatus =
      selectedStatus === 'ALL' || record.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Stethoscope className='h-4 w-4' />
      case 'EXAMINATION':
        return <ClipboardList className='h-4 w-4' />
      case 'FOLLOW_UP':
        return <Calendar className='h-4 w-4' />
      case 'EMERGENCY':
        return <AlertTriangle className='h-4 w-4' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const MetricsCards = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Records</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.totalRecords.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            +{mockMetrics.recordsThisMonth} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completed</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.completedRecords.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {(
              (mockMetrics.completedRecords / mockMetrics.totalRecords) *
              100
            ).toFixed(1)}
            % completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{mockMetrics.pendingRecords}</div>
          <p className='text-xs text-muted-foreground'>Awaiting completion</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>This Month</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.recordsThisMonth}
          </div>
          <p className='text-xs text-muted-foreground'>New records created</p>
        </CardContent>
      </Card>
    </div>
  )

  const RecordCard = ({ record }: { record: any }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-full'>
              {getRecordTypeIcon(record.recordType)}
            </div>
            <div>
              <CardTitle className='text-lg'>{record.title}</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                <User className='h-3 w-3' />
                {record.patient.firstName} {record.patient.lastName}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className={getStatusColor(record.status)}>
              {record.status}
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
                src={record.patient.profilePhoto}
                alt={`${record.patient.firstName} ${record.patient.lastName}`}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(record.patient.firstName, record.patient.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='text-sm font-medium'>
                {record.patient.firstName} {record.patient.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>Patient</div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Stethoscope className='h-4 w-4 text-muted-foreground' />
            <div>
              <div className='text-sm font-medium'>
                {record.doctor.firstName} {record.doctor.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>
                {record.doctor.specialty}
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm text-gray-600'>{record.description}</div>

        <Separator />

        <div className='space-y-2'>
          {record.diagnosis && (
            <div className='flex items-start space-x-2 text-sm'>
              <ClipboardList className='h-4 w-4 text-green-500 mt-0.5' />
              <div>
                <span className='font-medium'>Diagnosis:</span>
                <div className='text-gray-600'>{record.diagnosis}</div>
              </div>
            </div>
          )}

          {record.prescriptions.length > 0 && (
            <div className='flex items-start space-x-2 text-sm'>
              <FileText className='h-4 w-4 text-blue-500 mt-0.5' />
              <div>
                <span className='font-medium'>Prescriptions:</span>
                <div className='text-gray-600'>
                  {record.prescriptions
                    .map((p: any) => `${p.medicationName} ${p.dosage}`)
                    .join(', ')}
                </div>
              </div>
            </div>
          )}

          {record.labResults.length > 0 && (
            <div className='flex items-start space-x-2 text-sm'>
              <Activity className='h-4 w-4 text-purple-500 mt-0.5' />
              <div>
                <span className='font-medium'>Lab Results:</span>
                <div className='space-y-1 mt-1'>
                  {record.labResults.map((lab: any, index: number) => (
                    <div key={index} className='flex justify-between'>
                      <span className='text-gray-600'>{lab.testName}</span>
                      <Badge
                        variant={
                          lab.status === 'Normal' ? 'default' : 'destructive'
                        }
                        className='text-xs'
                      >
                        {lab.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            Created: {formatDateTime(record.createdAt)}
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              <Eye className='mr-2 h-4 w-4' />
              View
            </Button>
            <Button variant='outline' size='sm'>
              <Share className='mr-2 h-4 w-4' />
              Share
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              Export
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
            <CardTitle>Records by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(mockMetrics.recordsByType).map(
                ([type, count]) => (
                  <div key={type} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      {getRecordTypeIcon(type)}
                      <span className='font-medium'>
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${
                              (count / mockMetrics.totalRecords) * 100
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
            <CardTitle>Records by Specialty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMetrics.recordsBySpecialty.map((specialty, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='font-medium'>{specialty.specialty}</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-green-600 h-2 rounded-full'
                        style={{
                          width: `${
                            (specialty.count / mockMetrics.totalRecords) * 100
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
          <TabsTrigger value='list'>Records List</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search records...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Record Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Types</SelectItem>
                <SelectItem value='CONSULTATION'>Consultation</SelectItem>
                <SelectItem value='EXAMINATION'>Examination</SelectItem>
                <SelectItem value='FOLLOW_UP'>Follow-up</SelectItem>
                <SelectItem value='EMERGENCY'>Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='DRAFT'>Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>
                No records found matching your criteria.
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
