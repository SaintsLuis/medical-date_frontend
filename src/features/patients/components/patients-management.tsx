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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  MapPin,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import {
  usePatients,
  usePatientStats,
  useDeletePatient,
} from '../hooks/use-patients'
import { PatientForm } from './patient-form'
import type { Patient, QueryPatientsParams } from '../types'
import { formatBloodType, formatGender, getAgeGroup } from '../types'
import { Label } from '@/components/ui/label'

// ==============================================
// Función para asignar colores a tipos de sangre
// ==============================================

const getBloodTypeColor = (bloodType: string): string => {
  const colorMap: Record<string, string> = {
    // Tipos de sangre principales - Colores vibrantes
    A_POSITIVE: '#ef4444', // Rojo
    A_NEGATIVE: '#dc2626', // Rojo oscuro
    B_POSITIVE: '#3b82f6', // Azul
    B_NEGATIVE: '#1d4ed8', // Azul oscuro
    AB_POSITIVE: '#8b5cf6', // Púrpura
    AB_NEGATIVE: '#7c3aed', // Púrpura oscuro
    O_POSITIVE: '#10b981', // Verde esmeralda
    O_NEGATIVE: '#059669', // Verde esmeralda oscuro
  }

  return colorMap[bloodType] || '#6b7280' // Gris por defecto
}

const getGenderColor = (gender: string): string => {
  const colorMap: Record<string, string> = {
    MALE: '#3b82f6', // Azul
    FEMALE: '#ec4899', // Rosa
  }

  return colorMap[gender] || '#6b7280' // Gris por defecto
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
]

export function PatientsManagement() {
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar el tab activo del localStorage al inicializar
    if (typeof window !== 'undefined') {
      return localStorage.getItem('patients-management-tab') || 'overview'
    }
    return 'overview'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<string>('')
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)

  // Parámetros de consulta
  const queryParams: QueryPatientsParams = {
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    gender: (genderFilter as 'MALE' | 'FEMALE') || undefined,
    bloodType:
      (bloodTypeFilter as
        | 'A_POSITIVE'
        | 'A_NEGATIVE'
        | 'B_POSITIVE'
        | 'B_NEGATIVE'
        | 'AB_POSITIVE'
        | 'AB_NEGATIVE'
        | 'O_POSITIVE'
        | 'O_NEGATIVE') || undefined,
    location: locationFilter || undefined,
    includeUser: true,
    includeMedicalRecords: true,
    includeAppointments: true,
  }

  // Hooks
  const {
    data: patientsResponse,
    isLoading,
    error,
    refetch,
  } = usePatients(queryParams)
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
  } = usePatientStats()
  const deleteMutation = useDeletePatient()

  const patients = patientsResponse?.data?.data || []
  const meta = patientsResponse?.data?.meta
  const stats = statsResponse?.data

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleGenderFilter = (gender: string) => {
    setGenderFilter(gender)
    setCurrentPage(1)
  }

  const handleBloodTypeFilter = (bloodType: string) => {
    setBloodTypeFilter(bloodType)
    setCurrentPage(1)
  }

  const handleLocationFilter = (location: string) => {
    setLocationFilter(location)
    setCurrentPage(1)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem('patients-management-tab', tab)
    }
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowEditDialog(true)
  }

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      await deleteMutation.mutateAsync(patientToDelete.id)
      setShowDeleteDialog(false)
      setPatientToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setShowEditDialog(false)
    setSelectedPatient(null)
    refetch()
  }

  const handleFormCancel = () => {
    setShowEditDialog(false)
    setSelectedPatient(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Componentes de UI
  const StatsCards = () => {
    if (isLoadingStats) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-20' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-24' />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (statsError || !stats) {
      return (
        <Alert>
          <AlertDescription>
            Error al cargar estadísticas:{' '}
            {statsError?.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-900'>
              Total Pacientes
            </CardTitle>
            <div className='h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {stats.total}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {stats.total}
            </div>
            <p className='text-xs text-blue-700'>Pacientes registrados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-900'>
              Pacientes Activos
            </CardTitle>
            <div className='h-8 w-8 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {stats.active}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {stats.active}
            </div>
            <p className='text-xs text-green-700'>Cuentas activas</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-900'>
              Con Alergias
            </CardTitle>
            <div className='h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center'>
              <AlertTriangle className='h-4 w-4 text-white' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {
                patients.filter((p) => p.allergies && p.allergies.length > 0)
                  .length
              }
            </div>
            <p className='text-xs text-purple-700'>Pacientes con alergias</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-orange-900'>
              Edad Promedio
            </CardTitle>
            <div className='h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center'>
              <Calendar className='h-4 w-4 text-white' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-900'>
              {patients.length > 0
                ? Math.round(
                    patients.reduce((sum, p) => sum + p.age, 0) /
                      patients.length
                  )
                : 0}
            </div>
            <p className='text-xs text-orange-700'>Años promedio</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const GenderDistributionChart = () => {
    if (!stats?.byGender) return null

    const data = stats.byGender.map((item) => ({
      name: formatGender(item.gender),
      value: item.count,
      color: getGenderColor(item.gender),
    }))

    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
          <CardDescription>Pacientes por género</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const BloodTypeDistributionChart = () => {
    if (!stats?.byBloodType) return null

    const data = stats.byBloodType.map((item) => ({
      name: formatBloodType(item.bloodType),
      value: item.count,
      color: getBloodTypeColor(item.bloodType),
    }))

    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Tipo de Sangre</CardTitle>
          <CardDescription>Pacientes por tipo de sangre</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const PatientsTable = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                  <Skeleton className='h-8 w-20' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Error al cargar pacientes: {error.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      )
    }

    if (patients.length === 0) {
      return (
        <Card>
          <CardContent className='p-8 text-center'>
            <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No hay pacientes</h3>
            <p className='text-muted-foreground'>
              No se encontraron pacientes con los filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className='space-y-4'>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Tipo de Sangre</TableHead>
                <TableHead>Alergias</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={patient.profilePhoto?.thumbnailUrl}
                          alt={`${patient.user.firstName} ${patient.user.lastName}`}
                        />
                        <AvatarFallback className='text-xs'>
                          {getInitials(
                            patient.user.firstName,
                            patient.user.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>
                          {patient.user.firstName} {patient.user.lastName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {patient.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div className='font-medium'>{patient.age} años</div>
                      <div className='text-muted-foreground'>
                        {getAgeGroup(patient.age)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {formatGender(patient.gender)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='font-mono'>
                      {formatBloodType(patient.bloodType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        {patient.allergies.slice(0, 2).map((allergy, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='text-xs'
                          >
                            {allergy}
                          </Badge>
                        ))}
                        {patient.allergies.length > 2 && (
                          <Badge variant='secondary' className='text-xs'>
                            +{patient.allergies.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className='text-muted-foreground text-sm'>
                        Ninguna
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-1 text-sm text-muted-foreground'>
                      <MapPin className='h-3 w-3' />
                      <span className='truncate max-w-32'>
                        {patient.address || 'No especificada'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEdit(patient)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar paciente</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDelete(patient)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar paciente</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {meta && (
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Mostrando {(meta.page - 1) * meta.limit + 1} a{' '}
              {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}{' '}
              pacientes
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(meta.page - 1)}
                disabled={!meta.hasPreviousPage}
              >
                Anterior
              </Button>
              <span className='text-sm'>
                Página {meta.page} de {meta.totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(meta.page + 1)}
                disabled={!meta.hasNextPage}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Gestión de Pacientes</h1>
          <p className='text-muted-foreground'>
            Administra y visualiza la información de los pacientes
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Actualizar
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='patients'>Pacientes</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <StatsCards />

          <div className='grid gap-4 md:grid-cols-2'>
            <GenderDistributionChart />
            <BloodTypeDistributionChart />
          </div>
        </TabsContent>

        <TabsContent value='patients' className='space-y-4'>
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-4'>
                <div className='space-y-2'>
                  <Label>Búsqueda</Label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Buscar pacientes...'
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Género</Label>
                  <Select
                    value={genderFilter}
                    onValueChange={handleGenderFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todos los géneros' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='MALE'>Masculino</SelectItem>
                      <SelectItem value='FEMALE'>Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Tipo de Sangre</Label>
                  <Select
                    value={bloodTypeFilter}
                    onValueChange={handleBloodTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todos los tipos' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='A_POSITIVE'>A+</SelectItem>
                      <SelectItem value='A_NEGATIVE'>A-</SelectItem>
                      <SelectItem value='B_POSITIVE'>B+</SelectItem>
                      <SelectItem value='B_NEGATIVE'>B-</SelectItem>
                      <SelectItem value='AB_POSITIVE'>AB+</SelectItem>
                      <SelectItem value='AB_NEGATIVE'>AB-</SelectItem>
                      <SelectItem value='O_POSITIVE'>O+</SelectItem>
                      <SelectItem value='O_NEGATIVE'>O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Ubicación</Label>
                  <Input
                    placeholder='Filtrar por ubicación'
                    value={locationFilter}
                    onChange={(e) => handleLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <PatientsTable />
        </TabsContent>
      </Tabs>

      {/* Diálogo de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-5xl max-h-[95vh] overflow-hidden p-0'>
          <DialogHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200'>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold text-gray-900'>
              <User className='h-6 w-6 text-blue-600' />
              Editar Paciente
            </DialogTitle>
            <DialogDescription className='text-gray-600 mt-1'>
              Actualiza la información médica del paciente
            </DialogDescription>
          </DialogHeader>
          <div className='overflow-y-auto max-h-[calc(95vh-120px)]'>
            {selectedPatient && (
              <div className='p-6'>
                <PatientForm
                  patient={selectedPatient}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader className='text-center'>
            <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <DialogTitle className='text-lg font-semibold text-gray-900'>
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className='text-gray-600 mt-2'>
              ¿Estás seguro de que quieres eliminar al paciente{' '}
              <span className='font-semibold text-gray-900'>
                {patientToDelete?.user.firstName}{' '}
                {patientToDelete?.user.lastName}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
              className='px-4'
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className='px-4'
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
