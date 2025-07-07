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
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  Shield,
  User,
  Users,
  Activity,
  TrendingUp,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockPatients = [
  {
    id: '1',
    profileId: 'prof_1',
    userId: 'user_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'FEMALE' as const,
    bloodType: 'A+',
    allergies: ['Penicillin', 'Shellfish'],
    medicalConditions: ['Hypertension', 'Diabetes Type 2'],
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Husband',
      phone: '+1 (555) 123-4568',
    },
    insurance: {
      provider: 'BlueCross BlueShield',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP001',
    },
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    profilePhoto: '/placeholder-avatar.jpg',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    profileId: 'prof_2',
    userId: 'user_2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1978-08-22',
    gender: 'MALE' as const,
    bloodType: 'O-',
    allergies: ['Latex'],
    medicalConditions: ['Asthma'],
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Wife',
      phone: '+1 (555) 234-5679',
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET987654321',
    },
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '3',
    profileId: 'prof_3',
    userId: 'user_3',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1992-12-05',
    gender: 'FEMALE' as const,
    bloodType: 'B+',
    allergies: [],
    medicalConditions: [],
    emergencyContact: {
      name: 'Maria Rodriguez',
      relationship: 'Mother',
      phone: '+1 (555) 345-6780',
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG456789123',
    },
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    isActive: true,
    createdAt: '2024-01-08T16:00:00Z',
    updatedAt: '2024-01-22T10:30:00Z',
  },
]

const mockMetrics = {
  totalPatients: 1247,
  newPatientsThisMonth: 89,
  activePatients: 1180,
  patientsWithUpcomingAppointments: 234,
  averageAge: 42.3,
  genderDistribution: {
    male: 580,
    female: 620,
    other: 47,
  },
  bloodTypeDistribution: {
    'A+': 312,
    'A-': 98,
    'B+': 234,
    'B-': 87,
    'AB+': 145,
    'AB-': 45,
    'O+': 267,
    'O-': 59,
  },
  topMedicalConditions: [
    { condition: 'Hypertension', count: 456 },
    { condition: 'Diabetes Type 2', count: 287 },
    { condition: 'Asthma', count: 198 },
    { condition: 'Arthritis', count: 167 },
    { condition: 'Depression', count: 134 },
  ],
}

export function PatientsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('ALL')
  const [selectedBloodType, setSelectedBloodType] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('list')

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      searchTerm === '' ||
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)

    const matchesGender =
      selectedGender === 'ALL' || patient.gender === selectedGender
    const matchesBloodType =
      selectedBloodType === 'ALL' || patient.bloodType === selectedBloodType

    return matchesSearch && matchesGender && matchesBloodType
  })

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

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

  const MetricsCards = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Patients</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.totalPatients.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            +{mockMetrics.newPatientsThisMonth} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Patients</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.activePatients.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {(
              (mockMetrics.activePatients / mockMetrics.totalPatients) *
              100
            ).toFixed(1)}
            % of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Upcoming Appointments
          </CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.patientsWithUpcomingAppointments}
          </div>
          <p className='text-xs text-muted-foreground'>
            Patients with scheduled visits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Average Age</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.averageAge} years
          </div>
          <p className='text-xs text-muted-foreground'>Across all patients</p>
        </CardContent>
      </Card>
    </div>
  )

  const PatientCard = ({ patient }: { patient: (typeof mockPatients)[0] }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src={patient.profilePhoto}
                alt={`${patient.firstName} ${patient.lastName}`}
              />
              <AvatarFallback>
                {getInitials(patient.firstName, patient.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-lg'>
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <CardDescription className='flex items-center gap-2'>
                <User className='h-3 w-3' />
                {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant={patient.isActive ? 'default' : 'secondary'}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center space-x-2 text-sm'>
            <Phone className='h-4 w-4 text-muted-foreground' />
            <span>{patient.phone}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <Mail className='h-4 w-4 text-muted-foreground' />
            <span className='truncate'>{patient.email}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <MapPin className='h-4 w-4 text-muted-foreground' />
            <span>
              {patient.address.city}, {patient.address.state}
            </span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <Heart className='h-4 w-4 text-muted-foreground' />
            <span>Blood Type: {patient.bloodType}</span>
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          {patient.medicalConditions.length > 0 && (
            <div className='flex items-center space-x-2 text-sm'>
              <AlertTriangle className='h-4 w-4 text-orange-500' />
              <span className='font-medium'>Conditions:</span>
              <div className='flex flex-wrap gap-1'>
                {patient.medicalConditions.map((condition, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {patient.allergies.length > 0 && (
            <div className='flex items-center space-x-2 text-sm'>
              <AlertTriangle className='h-4 w-4 text-red-500' />
              <span className='font-medium'>Allergies:</span>
              <div className='flex flex-wrap gap-1'>
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant='destructive' className='text-xs'>
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className='flex items-center space-x-2 text-sm'>
            <Shield className='h-4 w-4 text-blue-500' />
            <span className='font-medium'>Insurance:</span>
            <span>{patient.insurance.provider}</span>
          </div>
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            Registered: {formatDate(patient.createdAt)}
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              View Details
            </Button>
            <Button size='sm'>New Appointment</Button>
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
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Female</span>
                <span>{mockMetrics.genderDistribution.female}</span>
              </div>
              <div className='flex justify-between'>
                <span>Male</span>
                <span>{mockMetrics.genderDistribution.male}</span>
              </div>
              <div className='flex justify-between'>
                <span>Other</span>
                <span>{mockMetrics.genderDistribution.other}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              {Object.entries(mockMetrics.bloodTypeDistribution).map(
                ([type, count]) => (
                  <div key={type} className='flex justify-between'>
                    <span>{type}</span>
                    <span>{count}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Medical Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {mockMetrics.topMedicalConditions.map((condition, index) => (
              <div key={index} className='flex items-center justify-between'>
                <span className='font-medium'>{condition.condition}</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{
                        width: `${
                          (condition.count / mockMetrics.totalPatients) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {condition.count}
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
          <TabsTrigger value='list'>Patient List</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search patients...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Gender' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='MALE'>Male</SelectItem>
                <SelectItem value='FEMALE'>Female</SelectItem>
                <SelectItem value='OTHER'>Other</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedBloodType}
              onValueChange={setSelectedBloodType}
            >
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Blood Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                {Object.keys(mockMetrics.bloodTypeDistribution).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>
                No patients found matching your criteria.
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
