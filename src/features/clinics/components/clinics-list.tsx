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
  MapPin,
  Phone,
  Clock,
  Building,
  Users,
  Calendar,
  Settings,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react'

// Mock data for clinics
const mockClinics = [
  {
    id: '1',
    name: 'Medical Center Downtown',
    address: '123 Main Street, Downtown, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'info@medicalcenter.com',
    status: 'ACTIVE',
    rating: 4.8,
    totalDoctors: 25,
    totalPatients: 1250,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics'],
    workingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 5:00 PM',
      saturday: '9:00 AM - 1:00 PM',
      sunday: 'Closed',
    },
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'Sunrise Health Clinic',
    address: '456 Oak Avenue, Midtown, NY 10002',
    phone: '+1 (555) 987-6543',
    email: 'contact@sunrisehealth.com',
    status: 'ACTIVE',
    rating: 4.6,
    totalDoctors: 18,
    totalPatients: 890,
    specialties: ['Family Medicine', 'Dermatology', 'Orthopedics'],
    workingHours: {
      monday: '7:00 AM - 7:00 PM',
      tuesday: '7:00 AM - 7:00 PM',
      wednesday: '7:00 AM - 7:00 PM',
      thursday: '7:00 AM - 7:00 PM',
      friday: '7:00 AM - 6:00 PM',
      saturday: '8:00 AM - 2:00 PM',
      sunday: 'Closed',
    },
    createdAt: '2024-02-20T08:00:00Z',
  },
  {
    id: '3',
    name: 'Westside Medical Group',
    address: '789 Pine Street, Westside, NY 10003',
    phone: '+1 (555) 456-7890',
    email: 'admin@westsidemedical.com',
    status: 'INACTIVE',
    rating: 4.2,
    totalDoctors: 12,
    totalPatients: 550,
    specialties: ['Internal Medicine', 'Psychiatry', 'Endocrinology'],
    workingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    createdAt: '2024-03-10T08:00:00Z',
  },
]

export function ClinicsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredClinics = mockClinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'ALL' || clinic.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Active
          </Badge>
        )
      case 'INACTIVE':
        return (
          <Badge variant='secondary' className='bg-red-100 text-red-800'>
            Inactive
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const ClinicCard = ({ clinic }: { clinic: any }) => (
    <Card className='hover:shadow-lg transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Building className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-lg'>{clinic.name}</CardTitle>
              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                <div className='flex items-center space-x-1'>
                  <Star className='h-4 w-4 fill-current text-yellow-400' />
                  <span>{clinic.rating}</span>
                </div>
                <span>•</span>
                <span>{clinic.totalDoctors} doctors</span>
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {getStatusBadge(clinic.status)}
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center space-x-2 text-sm'>
            <MapPin className='h-4 w-4 text-muted-foreground' />
            <span className='text-muted-foreground'>{clinic.address}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <Phone className='h-4 w-4 text-muted-foreground' />
            <span className='text-muted-foreground'>{clinic.phone}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <span className='text-muted-foreground'>
              {clinic.totalPatients} patients
            </span>
          </div>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>Specialties</div>
            <div className='flex flex-wrap gap-1'>
              {clinic.specialties.map((specialty: string) => (
                <Badge key={specialty} variant='outline' className='text-xs'>
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>Working Hours</div>
            <div className='text-sm text-muted-foreground'>
              Mon-Fri: {clinic.workingHours.monday} <br />
              Sat: {clinic.workingHours.saturday} <br />
              Sun: {clinic.workingHours.sunday}
            </div>
          </div>

          <div className='flex space-x-2 pt-2'>
            <Button size='sm' variant='outline'>
              <Settings className='h-4 w-4 mr-1' />
              Manage
            </Button>
            <Button size='sm' variant='outline'>
              <Calendar className='h-4 w-4 mr-1' />
              Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const StatsCard = ({
    title,
    value,
    change,
    icon: Icon,
  }: {
    title: string
    value: string
    change: string
    icon: any
  }) => (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground'>{change}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='clinics'>All Clinics</TabsTrigger>
          <TabsTrigger value='schedules'>Schedules</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatsCard
              title='Total Clinics'
              value={mockClinics.length.toString()}
              change='+2 from last month'
              icon={Building}
            />
            <StatsCard
              title='Active Clinics'
              value={mockClinics
                .filter((c) => c.status === 'ACTIVE')
                .length.toString()}
              change='+1 from last month'
              icon={CheckCircle}
            />
            <StatsCard
              title='Total Doctors'
              value={mockClinics
                .reduce((sum, c) => sum + c.totalDoctors, 0)
                .toString()}
              change='+5 from last month'
              icon={Users}
            />
            <StatsCard
              title='Total Patients'
              value={mockClinics
                .reduce((sum, c) => sum + c.totalPatients, 0)
                .toString()}
              change='+120 from last month'
              icon={Users}
            />
          </div>
        </TabsContent>

        <TabsContent value='clinics'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search clinics...'
                  className='pl-10'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Status</SelectItem>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' size='sm'>
                <Filter className='h-4 w-4 mr-2' />
                Filter
              </Button>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>

            {filteredClinics.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-muted-foreground'>
                  No clinics found matching your criteria.
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='schedules'>
          <Card>
            <CardHeader>
              <CardTitle>Clinic Schedules</CardTitle>
              <CardDescription>
                Manage working hours and schedules for all clinics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Schedule management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics'>
          <Card>
            <CardHeader>
              <CardTitle>Clinic Analytics</CardTitle>
              <CardDescription>
                Performance metrics and analytics for all clinics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Analytics features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
