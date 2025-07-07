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
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Award,
  Users,
  Activity,
  TrendingUp,
  Stethoscope,
  GraduationCap,
  CheckCircle,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockDoctors = [
  {
    id: '1',
    profileId: 'prof_1',
    userId: 'user_1',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@medicaldate.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1980-03-15',
    gender: 'FEMALE' as const,
    specialtyId: 'spec_1',
    specialty: {
      id: 'spec_1',
      name: 'Cardiology',
      description: 'Heart and cardiovascular system',
      icon: '❤️',
    },
    licenseNumber: 'MD123456',
    experience: 12,
    education: 'Harvard Medical School',
    certifications: [
      'Board Certified Cardiologist',
      'ACLS Certified',
      'Echo Certified',
    ],
    biography:
      'Dr. Johnson is a board-certified cardiologist with over 12 years of experience in treating heart conditions and cardiovascular diseases.',
    consultationFee: 250,
    currency: 'USD',
    address: {
      street: '123 Medical Center Dr',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    profilePhoto: '/placeholder-avatar.jpg',
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    totalReviews: 127,
    totalAppointments: 890,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    profileId: 'prof_2',
    userId: 'user_2',
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'michael.chen@medicaldate.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1975-08-22',
    gender: 'MALE' as const,
    specialtyId: 'spec_2',
    specialty: {
      id: 'spec_2',
      name: 'Orthopedics',
      description: 'Musculoskeletal system',
      icon: '🦴',
    },
    licenseNumber: 'MD789012',
    experience: 18,
    education: 'Johns Hopkins Medical School',
    certifications: [
      'Board Certified Orthopedic Surgeon',
      'Sports Medicine Specialist',
    ],
    biography:
      'Dr. Chen specializes in orthopedic surgery with a focus on sports medicine and joint replacement.',
    consultationFee: 300,
    currency: 'USD',
    address: {
      street: '456 Hospital Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    isActive: true,
    isAvailable: false,
    rating: 4.9,
    totalReviews: 203,
    totalAppointments: 1245,
    createdAt: '2022-08-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '3',
    profileId: 'prof_3',
    userId: 'user_3',
    firstName: 'Dr. Emma',
    lastName: 'Rodriguez',
    email: 'emma.rodriguez@medicaldate.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1983-12-05',
    gender: 'FEMALE' as const,
    specialtyId: 'spec_3',
    specialty: {
      id: 'spec_3',
      name: 'Pediatrics',
      description: "Children's health and development",
      icon: '👶',
    },
    licenseNumber: 'MD345678',
    experience: 8,
    education: 'Stanford Medical School',
    certifications: [
      'Board Certified Pediatrician',
      'PALS Certified',
      'Newborn Care Specialist',
    ],
    biography:
      'Dr. Rodriguez is passionate about providing comprehensive care for children from infancy through adolescence.',
    consultationFee: 200,
    currency: 'USD',
    address: {
      street: "789 Children's Way",
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    isActive: true,
    isAvailable: true,
    rating: 4.7,
    totalReviews: 89,
    totalAppointments: 456,
    createdAt: '2023-06-08T16:00:00Z',
    updatedAt: '2024-01-22T10:30:00Z',
  },
]

const mockMetrics = {
  totalDoctors: 47,
  activeDoctors: 45,
  availableDoctors: 38,
  doctorsWithAppointmentsToday: 32,
  averageRating: 4.6,
  averageExperience: 12.4,
  specialtyDistribution: [
    { specialtyName: 'Cardiology', count: 8 },
    { specialtyName: 'Orthopedics', count: 7 },
    { specialtyName: 'Pediatrics', count: 6 },
    { specialtyName: 'Dermatology', count: 5 },
    { specialtyName: 'Neurology', count: 4 },
    { specialtyName: 'Psychiatry', count: 4 },
    { specialtyName: 'Internal Medicine', count: 13 },
  ],
  topRatedDoctors: [
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      rating: 4.9,
      totalReviews: 203,
    },
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      rating: 4.8,
      totalReviews: 127,
    },
    {
      id: '3',
      name: 'Dr. Emma Rodriguez',
      specialty: 'Pediatrics',
      rating: 4.7,
      totalReviews: 89,
    },
  ],
}

export function DoctorsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL')
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('list')

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      searchTerm === '' ||
      `${doctor.firstName} ${doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty =
      selectedSpecialty === 'ALL' || doctor.specialty.name === selectedSpecialty
    const matchesAvailability =
      selectedAvailability === 'ALL' ||
      (selectedAvailability === 'available' && doctor.isAvailable) ||
      (selectedAvailability === 'unavailable' && !doctor.isAvailable)

    return matchesSearch && matchesSpecialty && matchesAvailability
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.split(' ').pop()?.charAt(0) || ''}${lastName.charAt(0)}`
  }

  const MetricsCards = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Doctors</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{mockMetrics.totalDoctors}</div>
          <p className='text-xs text-muted-foreground'>
            {mockMetrics.activeDoctors} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Available Today</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.availableDoctors}
          </div>
          <p className='text-xs text-muted-foreground'>
            {mockMetrics.doctorsWithAppointmentsToday} with appointments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Average Rating</CardTitle>
          <Star className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{mockMetrics.averageRating}</div>
          <p className='text-xs text-muted-foreground'>Across all doctors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Average Experience
          </CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {mockMetrics.averageExperience} years
          </div>
          <p className='text-xs text-muted-foreground'>Clinical experience</p>
        </CardContent>
      </Card>
    </div>
  )

  const DoctorCard = ({ doctor }: { doctor: (typeof mockDoctors)[0] }) => (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src={doctor.profilePhoto}
                alt={`${doctor.firstName} ${doctor.lastName}`}
              />
              <AvatarFallback>
                {getInitials(doctor.firstName, doctor.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-lg'>
                {doctor.firstName} {doctor.lastName}
              </CardTitle>
              <CardDescription className='flex items-center gap-2'>
                <Stethoscope className='h-3 w-3' />
                {doctor.specialty.name} • {doctor.experience} years exp.
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant={doctor.isAvailable ? 'default' : 'secondary'}>
              {doctor.isAvailable ? 'Available' : 'Unavailable'}
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
            <span>{doctor.phone}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <Mail className='h-4 w-4 text-muted-foreground' />
            <span className='truncate'>{doctor.email}</span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <MapPin className='h-4 w-4 text-muted-foreground' />
            <span>
              {doctor.address.city}, {doctor.address.state}
            </span>
          </div>
          <div className='flex items-center space-x-2 text-sm'>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
            <span>${doctor.consultationFee} consultation</span>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-medium'>{doctor.rating}</span>
            </div>
            <span className='text-sm text-muted-foreground'>
              ({doctor.totalReviews} reviews)
            </span>
          </div>
          <div className='text-sm text-muted-foreground'>
            {doctor.totalAppointments} appointments
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          <div className='flex items-center space-x-2 text-sm'>
            <GraduationCap className='h-4 w-4 text-blue-500' />
            <span className='font-medium'>Education:</span>
            <span>{doctor.education}</span>
          </div>

          <div className='flex items-center space-x-2 text-sm'>
            <Award className='h-4 w-4 text-green-500' />
            <span className='font-medium'>License:</span>
            <span>{doctor.licenseNumber}</span>
          </div>

          {doctor.certifications.length > 0 && (
            <div className='space-y-1'>
              <div className='flex items-center space-x-2 text-sm'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <span className='font-medium'>Certifications:</span>
              </div>
              <div className='flex flex-wrap gap-1 ml-6'>
                {doctor.certifications.map((cert, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className='flex justify-between items-center'>
          <div className='text-xs text-muted-foreground'>
            Joined: {formatDate(doctor.createdAt)}
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm'>
              View Profile
            </Button>
            <Button size='sm' disabled={!doctor.isAvailable}>
              <Calendar className='mr-2 h-4 w-4' />
              Schedule
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
            <CardTitle>Specialty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMetrics.specialtyDistribution.map((specialty, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='font-medium'>{specialty.specialtyName}</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{
                          width: `${
                            (specialty.count / mockMetrics.totalDoctors) * 100
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

        <Card>
          <CardHeader>
            <CardTitle>Top Rated Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMetrics.topRatedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className='flex items-center justify-between'
                >
                  <div>
                    <div className='font-medium'>{doctor.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {doctor.specialty}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center space-x-1'>
                      <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-sm font-medium'>
                        {doctor.rating}
                      </span>
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {doctor.totalReviews} reviews
                    </div>
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
          <TabsTrigger value='list'>Doctor List</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search doctors...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Specialty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Specialties</SelectItem>
                {mockMetrics.specialtyDistribution.map((specialty) => (
                  <SelectItem
                    key={specialty.specialtyName}
                    value={specialty.specialtyName}
                  >
                    {specialty.specialtyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedAvailability}
              onValueChange={setSelectedAvailability}
            >
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='available'>Available</SelectItem>
                <SelectItem value='unavailable'>Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>
                No doctors found matching your criteria.
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
