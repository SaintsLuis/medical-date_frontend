'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Plus,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Archive,
  RefreshCw,
  Heart,
  Activity,
  Thermometer,
  Weight,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  useMedicalRecords,
  useMyMedicalRecords,
  useFollowUpRecords,
  useArchiveMedicalRecord,
} from '../hooks/use-medical-records'
import {
  MedicalRecord,
  MedicalRecordCategory,
  Priority,
  MedicalRecordFilters,
  MEDICAL_RECORD_FILTER_DEFAULTS,
  getCategoryText,
  getPriorityText,
  getPriorityColor,
  getCategoryColor,
  formatDate,
  isFollowUpOverdue,
  getDaysUntilFollowUp,
  formatBloodType,
} from '../types'
import { MedicalRecordsSkeleton } from './medical-records-skeleton'
import { MedicalRecordForm } from './medical-record-form'
import { MedicalRecordDetails } from './medical-record-details'
import { MedicalRecordsPagination } from './medical-records-pagination'
import { MedicalRecordAnalytics } from './medical-record-analytics'
import { ArchiveMedicalRecordDialog } from './archive-medical-record-dialog'
import { ArchivedMedicalRecords } from './archived-medical-records'
import { usePatients } from '../hooks/use-patients'
import { useDebounce } from '@/hooks/use-debounce'
// import { MedicalRecordsAnalytics } from './medical-records-analytics'

export function MedicalRecordsManagement() {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const isAdmin = user?.roles.includes(UserRole.ADMIN)

  // State management
  const [activeTab, setActiveTab] = useState('records')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState<MedicalRecordFilters>(
    MEDICAL_RECORD_FILTER_DEFAULTS
  )
  const [searchInput, setSearchInput] = useState('') // Estado local para la búsqueda
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  )

  // Aplicar debounce a la búsqueda
  const debouncedSearch = useDebounce(searchInput, 500) // 500ms de retraso

  // Actualizar filtros cuando cambie la búsqueda con debounce
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }))
    setPage(1) // Reset to first page when searching
  }, [debouncedSearch])

  // Query parameters based on filters
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(filters.patientProfileId &&
        filters.patientProfileId !== 'ALL_PATIENTS' && {
          patientProfileId: filters.patientProfileId,
        }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.category !== 'ALL' && { category: filters.category }),
      ...(filters.priority !== 'ALL' && { priority: filters.priority }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.search && { search: filters.search }),
      ...(filters.followUpOnly && { followUpOnly: true }),
    }),
    [page, limit, filters]
  )

  // Data fetching - Fix conditional hooks
  const myRecordsQuery = useMyMedicalRecords(queryParams, isDoctor)
  const allRecordsQuery = useMedicalRecords(queryParams, isAdmin && !isDoctor)

  // Pacientes para filtro (solo para doctores)
  const { data: patientsData } = usePatients({
    search: '',
    limit: 100, // Cargar muchos pacientes para el dropdown
  })

  // Force refetch when query params change
  useEffect(() => {
    if (isDoctor) {
      myRecordsQuery.refetch()
    } else {
      allRecordsQuery.refetch()
    }
  }, [queryParams, isDoctor, myRecordsQuery, allRecordsQuery])

  const recordsData = isDoctor ? myRecordsQuery.data : allRecordsQuery.data
  const recordsLoading = isDoctor
    ? myRecordsQuery.isLoading
    : allRecordsQuery.isLoading
  const recordsError = isDoctor ? myRecordsQuery.error : allRecordsQuery.error

  // Debug logs for data loading
  console.log('🏥 [MedicalRecordsManagement] Component render:', {
    user: user?.firstName + ' ' + user?.lastName,
    userRole: user?.roles,
    isDoctor,
    isAdmin,
    queryParams,
    recordsLoading,
    recordsDataExists: !!recordsData,
    recordsDataLength: recordsData?.data?.length || 0,
  })

  if (recordsData?.data?.length) {
    console.log('📋 [MedicalRecordsManagement] Records data:', {
      firstRecord: recordsData.data[0],
      doctor: recordsData.data[0]?.doctor,
      patient: recordsData.data[0]?.patient,
    })
  }

  const { data: followUpData, isLoading: followUpLoading } =
    useFollowUpRecords(isDoctor)

  // Mutations
  const archiveMutation = useArchiveMedicalRecord()

  // Event handlers
  const handleFilterChange = (
    key: keyof MedicalRecordFilters,
    value: string | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filtering
  }

  const handleResetFilters = () => {
    setFilters(MEDICAL_RECORD_FILTER_DEFAULTS)
    setSearchInput('') // Limpiar también el input de búsqueda
    setPage(1)
  }

  const handleCreateRecord = () => {
    setSelectedRecord(null)
    setIsFormOpen(true)
  }

  const handleEditRecord = (record: MedicalRecord) => {
    console.log('✏️ [MedicalRecordsManagement] Edit record clicked:', {
      record,
      doctor: record.doctor,
      doctorName: record.doctor?.firstName + ' ' + record.doctor?.lastName,
      patient: record.patient,
      patientName: record.patient?.firstName + ' ' + record.patient?.lastName,
    })
    setSelectedRecord(record)
    setIsFormOpen(true)
  }

  const handleViewRecord = (record: MedicalRecord) => {
    console.log('👁️ [MedicalRecordsManagement] View record clicked:', {
      record,
      doctor: record.doctor,
      doctorName: record.doctor?.firstName + ' ' + record.doctor?.lastName,
      patient: record.patient,
      patientName: record.patient?.firstName + ' ' + record.patient?.lastName,
    })
    setSelectedRecord(record)
    setIsDetailsOpen(true)
  }

  const handleArchiveRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsArchiveDialogOpen(true)
  }

  const confirmArchive = async (reason: string) => {
    if (!selectedRecord) return

    try {
      await archiveMutation.mutateAsync({
        id: selectedRecord.id,
        data: { reason },
      })
      setIsArchiveDialogOpen(false)
      setSelectedRecord(null)

      // Force refetch to ensure UI is updated
      if (isDoctor) {
        myRecordsQuery.refetch()
      } else {
        allRecordsQuery.refetch()
      }
    } catch (error) {
      console.error('Error archiving record:', error)
      // Error is already handled by the mutation's onError
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusIcon = (record: MedicalRecord) => {
    if (record.followUpDate) {
      if (isFollowUpOverdue(record.followUpDate)) {
        return <AlertTriangle className='h-4 w-4 text-red-500' />
      }
      return <Clock className='h-4 w-4 text-yellow-500' />
    }
    return <CheckCircle className='h-4 w-4 text-green-500' />
  }

  if (recordsLoading) {
    return <MedicalRecordsSkeleton />
  }

  if (recordsError) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          {recordsError.message || 'Error al cargar los registros médicos'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Registros Médicos
          </h1>
          <p className='text-muted-foreground'>
            {isDoctor
              ? 'Gestiona los registros médicos de tus pacientes'
              : 'Consulta tu historial médico completo'}
          </p>
        </div>
        {isDoctor && (
          <Button onClick={handleCreateRecord}>
            <Plus className='mr-2 h-4 w-4' />
            Nuevo Registro
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList
          className={`grid w-full ${
            isDoctor && isAdmin
              ? 'grid-cols-4'
              : isDoctor
              ? 'grid-cols-3'
              : 'grid-cols-2'
          }`}
        >
          <TabsTrigger value='records'>
            <FileText className='mr-2 h-4 w-4' />
            Registros
          </TabsTrigger>
          {isDoctor && (
            <TabsTrigger value='analytics'>
              <TrendingUp className='mr-2 h-4 w-4' />
              Analíticas
            </TabsTrigger>
          )}
          <TabsTrigger value='follow-up'>
            <Clock className='mr-2 h-4 w-4' />
            Seguimientos
            {followUpData && followUpData.length > 0 && (
              <Badge variant='destructive' className='ml-2'>
                {followUpData.length}
              </Badge>
            )}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value='archived'>
              <Archive className='mr-2 h-4 w-4' />
              Archivados
            </TabsTrigger>
          )}
        </TabsList>

        {/* Records Tab */}
        <TabsContent value='records' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Filter className='mr-2 h-5 w-5' />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`grid gap-4 ${
                  isDoctor
                    ? 'md:grid-cols-2 lg:grid-cols-5'
                    : 'md:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {/* Search */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Buscar
                  </label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Buscar por paciente, síntomas, diagnóstico...'
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className='pl-10'
                    />
                    {searchInput !== debouncedSearch && (
                      <div className='absolute right-3 top-3'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Filter - Only for doctors */}
                {isDoctor && (
                  <div>
                    <label className='text-sm font-medium mb-2 block'>
                      Paciente
                    </label>
                    <Select
                      value={filters.patientProfileId}
                      onValueChange={(value) =>
                        handleFilterChange('patientProfileId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Todos los pacientes' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='ALL_PATIENTS'>
                          Todos los pacientes
                        </SelectItem>
                        {patientsData?.data?.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.user.firstName} {patient.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Categoría
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange('category', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todas las categorías' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>Todas las categorías</SelectItem>
                      {Object.values(MedicalRecordCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryText(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Prioridad
                  </label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      handleFilterChange('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todas las prioridades' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>Todas las prioridades</SelectItem>
                      {Object.values(Priority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getPriorityText(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Fecha desde
                  </label>
                  <Input
                    type='date'
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange('startDate', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4'>
                <Button variant='outline' onClick={handleResetFilters}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Limpiar Filtros
                </Button>

                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                  {/* Records per page selector */}
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm whitespace-nowrap'>
                      Registros por página:
                    </label>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(parseInt(value))
                        setPage(1) // Reset to first page when changing limit
                      }}
                    >
                      <SelectTrigger className='w-20'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='5'>5</SelectItem>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='20'>20</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Follow-up only checkbox */}
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm whitespace-nowrap'>
                      Solo seguimientos:
                    </label>
                    <input
                      type='checkbox'
                      checked={filters.followUpOnly}
                      onChange={(e) =>
                        handleFilterChange('followUpOnly', e.target.checked)
                      }
                      className='rounded'
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>
                  Registros Médicos
                  {recordsData && (
                    <Badge variant='secondary' className='ml-2'>
                      {recordsData.meta.total} total
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <MedicalRecordsSkeleton />
              ) : recordsData && recordsData.data.length > 0 ? (
                <div className='space-y-4'>
                  {/* Desktop Table View */}
                  <div className='hidden lg:block overflow-x-auto'>
                    <table className='w-full border-collapse'>
                      <thead>
                        <tr className='border-b'>
                          <th className='text-left p-3 font-semibold'>
                            Paciente
                          </th>
                          {isAdmin && (
                            <th className='text-left p-3 font-semibold'>
                              Doctor
                            </th>
                          )}
                          <th className='text-left p-3 font-semibold'>Fecha</th>
                          <th className='text-left p-3 font-semibold'>
                            Categoría
                          </th>
                          <th className='text-left p-3 font-semibold'>
                            Prioridad
                          </th>
                          <th className='text-left p-3 font-semibold'>
                            Diagnóstico
                          </th>
                          <th className='text-left p-3 font-semibold'>
                            Signos Vitales
                          </th>
                          <th className='text-left p-3 font-semibold'>
                            Seguimiento
                          </th>
                          <th className='text-center p-3 font-semibold'>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recordsData.data.map((record) => (
                          <tr
                            key={record.id}
                            className='border-b hover:bg-muted/50 transition-colors'
                          >
                            {/* Paciente */}
                            <td className='p-3'>
                              <div className='flex items-center space-x-3'>
                                <Avatar className='h-10 w-10'>
                                  <AvatarFallback className='bg-blue-100 text-blue-700'>
                                    {getInitials(
                                      record.patient?.firstName || '',
                                      record.patient?.lastName || ''
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className='font-medium text-sm'>
                                    {record.patient?.firstName}{' '}
                                    {record.patient?.lastName}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {record.patient?.email}
                                  </div>
                                  {record.patient?.bloodType && (
                                    <div className='text-xs text-red-600 font-medium'>
                                      {formatBloodType(
                                        record.patient.bloodType
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Doctor - Solo para administradores */}
                            {isAdmin && (
                              <td className='p-3'>
                                <div className='flex items-center space-x-3'>
                                  <Avatar className='h-10 w-10'>
                                    <AvatarFallback className='bg-green-100 text-green-700'>
                                      {getInitials(
                                        record.doctor?.firstName || '',
                                        record.doctor?.lastName || ''
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className='font-medium text-sm'>
                                      {record.doctor?.firstName}{' '}
                                      {record.doctor?.lastName}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                      {record.doctor?.email}
                                    </div>
                                    {record.doctor?.doctorProfile?.license && (
                                      <div className='text-xs text-green-600 font-medium'>
                                        Lic:{' '}
                                        {record.doctor.doctorProfile.license}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Fecha */}
                            <td className='p-3'>
                              <div className='text-sm font-medium'>
                                {formatDate(record.date)}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {new Date(record.date).toLocaleTimeString(
                                  'es-ES',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </div>
                            </td>

                            {/* Categoría */}
                            <td className='p-3'>
                              {record.category && (
                                <Badge
                                  variant='outline'
                                  className={`${getCategoryColor(
                                    record.category
                                  )} text-xs`}
                                >
                                  {getCategoryText(record.category)}
                                </Badge>
                              )}
                            </td>

                            {/* Prioridad */}
                            <td className='p-3'>
                              {record.priority && (
                                <Badge
                                  variant='outline'
                                  className={`${getPriorityColor(
                                    record.priority
                                  )} text-xs`}
                                >
                                  {getPriorityText(record.priority)}
                                </Badge>
                              )}
                            </td>

                            {/* Diagnóstico */}
                            <td className='p-3 max-w-xs'>
                              <div className='text-sm font-medium line-clamp-2'>
                                {record.diagnosis}
                              </div>
                              {record.symptoms &&
                                record.symptoms.length > 0 && (
                                  <div className='text-xs text-muted-foreground mt-1'>
                                    Síntomas:{' '}
                                    {record.symptoms.slice(0, 2).join(', ')}
                                    {record.symptoms.length > 2 && '...'}
                                  </div>
                                )}
                            </td>

                            {/* Signos Vitales */}
                            <td className='p-3'>
                              {record.vitalSigns ? (
                                <div className='space-y-1 text-xs'>
                                  {record.vitalSigns.bloodPressure && (
                                    <div className='flex items-center gap-1'>
                                      <Heart className='h-3 w-3 text-red-500' />
                                      {record.vitalSigns.bloodPressure}
                                    </div>
                                  )}
                                  {record.vitalSigns.heartRate && (
                                    <div className='flex items-center gap-1'>
                                      <Activity className='h-3 w-3 text-pink-500' />
                                      {record.vitalSigns.heartRate} bpm
                                    </div>
                                  )}
                                  {record.vitalSigns.temperature && (
                                    <div className='flex items-center gap-1'>
                                      <Thermometer className='h-3 w-3 text-orange-500' />
                                      {record.vitalSigns.temperature}°C
                                    </div>
                                  )}
                                  {record.vitalSigns.weight && (
                                    <div className='flex items-center gap-1'>
                                      <Weight className='h-3 w-3 text-purple-500' />
                                      {record.vitalSigns.weight} kg
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className='text-xs text-muted-foreground italic'>
                                  No registrados
                                </span>
                              )}
                            </td>

                            {/* Seguimiento */}
                            <td className='p-3'>
                              {record.followUpDate ? (
                                <div className='text-xs'>
                                  <div className='font-medium'>
                                    {formatDate(record.followUpDate)}
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${
                                      isFollowUpOverdue(record.followUpDate)
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {isFollowUpOverdue(record.followUpDate) ? (
                                      <AlertTriangle className='h-3 w-3' />
                                    ) : (
                                      <Clock className='h-3 w-3' />
                                    )}
                                    {isFollowUpOverdue(record.followUpDate)
                                      ? `Vencido (${Math.abs(
                                          getDaysUntilFollowUp(
                                            record.followUpDate
                                          )
                                        )}d)`
                                      : `En ${getDaysUntilFollowUp(
                                          record.followUpDate
                                        )}d`}
                                  </div>
                                </div>
                              ) : (
                                <span className='text-xs text-muted-foreground italic'>
                                  Sin seguimiento
                                </span>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className='p-3'>
                              <div className='flex items-center justify-center space-x-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleViewRecord(record)}
                                  className='h-8 w-8 p-0'
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>

                                {isDoctor && (
                                  <>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleEditRecord(record)}
                                      className='h-8 w-8 p-0'
                                    >
                                      <Edit className='h-4 w-4' />
                                    </Button>

                                    {isAdmin && (
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleArchiveRecord(record)
                                        }
                                        className='h-8 w-8 p-0 text-amber-600 hover:text-amber-700'
                                      >
                                        <Archive className='h-4 w-4' />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className='lg:hidden space-y-3'>
                    {recordsData.data.map((record) => (
                      <div
                        key={record.id}
                        className='border rounded-lg p-4 space-y-4 hover:bg-muted/50 transition-colors'
                      >
                        {/* Header con paciente y doctor */}
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-12 w-12'>
                              <AvatarFallback className='bg-blue-100 text-blue-700'>
                                {getInitials(
                                  record.patient?.firstName || '',
                                  record.patient?.lastName || ''
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium text-sm'>
                                {record.patient?.firstName}{' '}
                                {record.patient?.lastName}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {record.patient?.email}
                              </div>
                              {record.patient?.bloodType && (
                                <Badge
                                  variant='outline'
                                  className='text-xs mt-1'
                                >
                                  {formatBloodType(record.patient.bloodType)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Doctor - Solo para administradores */}
                          {isAdmin && (
                            <div className='text-right'>
                              <div className='text-xs text-muted-foreground'>
                                Doctor
                              </div>
                              <div className='text-sm font-medium'>
                                {record.doctor?.firstName}{' '}
                                {record.doctor?.lastName}
                              </div>
                            </div>
                          )}
                        </div>{' '}
                        {/* Información médica */}
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2 text-sm'>
                            <span className='font-medium'>Fecha:</span>
                            <span>{formatDate(record.date)}</span>
                            {getStatusIcon(record)}
                          </div>

                          <div className='flex flex-wrap gap-2'>
                            {record.category && (
                              <Badge
                                variant='outline'
                                className={getCategoryColor(record.category)}
                              >
                                {getCategoryText(record.category)}
                              </Badge>
                            )}
                            {record.priority && (
                              <Badge
                                variant='outline'
                                className={getPriorityColor(record.priority)}
                              >
                                {getPriorityText(record.priority)}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <span className='text-xs font-medium text-muted-foreground'>
                              Diagnóstico:
                            </span>
                            <p className='text-sm mt-1 line-clamp-2'>
                              {record.diagnosis}
                            </p>
                          </div>

                          {/* Signos vitales resumidos */}
                          {record.vitalSigns && (
                            <div className='grid grid-cols-2 gap-2 text-xs'>
                              {record.vitalSigns.bloodPressure && (
                                <div className='flex items-center gap-1'>
                                  <Heart className='h-3 w-3 text-red-500' />
                                  {record.vitalSigns.bloodPressure}
                                </div>
                              )}
                              {record.vitalSigns.heartRate && (
                                <div className='flex items-center gap-1'>
                                  <Activity className='h-3 w-3 text-pink-500' />
                                  {record.vitalSigns.heartRate} bpm
                                </div>
                              )}
                              {record.vitalSigns.temperature && (
                                <div className='flex items-center gap-1'>
                                  <Thermometer className='h-3 w-3 text-orange-500' />
                                  {record.vitalSigns.temperature}°C
                                </div>
                              )}
                              {record.vitalSigns.weight && (
                                <div className='flex items-center gap-1'>
                                  <Weight className='h-3 w-3 text-purple-500' />
                                  {record.vitalSigns.weight} kg
                                </div>
                              )}
                            </div>
                          )}

                          {/* Seguimiento */}
                          {record.followUpDate && (
                            <div className='text-xs'>
                              <span className='font-medium text-muted-foreground'>
                                Seguimiento:
                              </span>
                              <div
                                className={`inline-flex items-center gap-1 ml-2 ${
                                  isFollowUpOverdue(record.followUpDate)
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {isFollowUpOverdue(record.followUpDate) ? (
                                  <AlertTriangle className='h-3 w-3' />
                                ) : (
                                  <Clock className='h-3 w-3' />
                                )}
                                {formatDate(record.followUpDate)}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Acciones */}
                        <div className='flex items-center justify-end space-x-2 pt-2 border-t'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className='h-4 w-4 mr-1' />
                            Ver
                          </Button>

                          {isDoctor && (
                            <>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleEditRecord(record)}
                              >
                                <Edit className='h-4 w-4 mr-1' />
                                Editar
                              </Button>

                              {isAdmin && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleArchiveRecord(record)}
                                  className='text-amber-600 hover:text-amber-700'
                                >
                                  <Archive className='h-4 w-4 mr-1' />
                                  Archivar
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {recordsData.meta.totalPages > 1 && (
                    <div className='flex items-center justify-between mt-6'>
                      <div className='text-sm text-muted-foreground'>
                        Mostrando {(page - 1) * limit + 1} a{' '}
                        {Math.min(page * limit, recordsData.meta.total)} de{' '}
                        {recordsData.meta.total} registros
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Anterior
                        </Button>

                        <span className='text-sm'>
                          Página {page} de {recordsData.meta.totalPages}
                        </span>

                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page === recordsData.meta.totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                  <div className='text-muted-foreground'>
                    {filters.search ||
                    filters.category !== 'ALL' ||
                    filters.priority !== 'ALL'
                      ? 'No se encontraron registros con los filtros aplicados'
                      : 'No hay registros médicos disponibles'}
                  </div>
                  {isDoctor && (
                    <Button className='mt-4' onClick={handleCreateRecord}>
                      <Plus className='mr-2 h-4 w-4' />
                      Crear Primer Registro
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {recordsData?.data &&
                recordsData.data.length > 0 &&
                recordsData.meta && (
                  <MedicalRecordsPagination
                    currentPage={recordsData.meta.page}
                    totalPages={recordsData.meta.totalPages}
                    hasNextPage={recordsData.meta.hasNextPage}
                    hasPrevPage={recordsData.meta.hasPrevPage}
                    total={recordsData.meta.total}
                    limit={recordsData.meta.limit}
                    onPageChange={(newPage) => {
                      console.log(
                        '📄 [MedicalRecordsManagement] Page change:',
                        {
                          from: page,
                          to: newPage,
                        }
                      )
                      setPage(newPage)
                    }}
                  />
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        {isDoctor && (
          <TabsContent value='analytics' className='space-y-6'>
            <MedicalRecordAnalytics doctorId={user?.id || ''} />
          </TabsContent>
        )}

        {/* Follow-up Tab */}
        <TabsContent value='follow-up' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Clock className='mr-2 h-5 w-5' />
                Seguimientos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followUpLoading ? (
                <div className='space-y-4'>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='flex items-center space-x-4 p-4 border rounded animate-pulse'
                    >
                      <div className='h-10 w-10 bg-gray-200 rounded-full' />
                      <div className='space-y-2 flex-1'>
                        <div className='h-4 bg-gray-200 rounded w-32' />
                        <div className='h-3 bg-gray-200 rounded w-24' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : followUpData && followUpData.length > 0 ? (
                <div className='space-y-4'>
                  {followUpData.map((record) => (
                    <div
                      key={record.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(
                              record.patient?.firstName ||
                                record.patientProfile?.user.firstName ||
                                '',
                              record.patient?.lastName ||
                                record.patientProfile?.user.lastName ||
                                ''
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className='font-medium'>
                            {record.patient?.firstName ||
                              record.patientProfile?.user.firstName}{' '}
                            {record.patient?.lastName ||
                              record.patientProfile?.user.lastName}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {record.diagnosis}
                          </p>
                        </div>
                      </div>

                      <div className='text-right'>
                        <div className='text-sm font-medium'>
                          {record.followUpDate &&
                            formatDate(record.followUpDate)}
                        </div>
                        <div
                          className={`text-xs ${
                            isFollowUpOverdue(record.followUpDate)
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {record.followUpDate &&
                          isFollowUpOverdue(record.followUpDate)
                            ? `Vencido hace ${Math.abs(
                                getDaysUntilFollowUp(record.followUpDate)
                              )} días`
                            : `En ${getDaysUntilFollowUp(
                                record.followUpDate
                              )} días`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
                  <div className='text-muted-foreground'>
                    No hay seguimientos pendientes
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archived Tab */}
        {isAdmin && (
          <TabsContent value='archived' className='space-y-6'>
            <ArchivedMedicalRecords />
          </TabsContent>
        )}
      </Tabs>

      {/* Form Dialog */}
      <MedicalRecordForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        record={selectedRecord}
        onSuccess={() => {
          setSelectedRecord(null)
          // Force refetch to ensure UI is updated
          if (isDoctor) {
            myRecordsQuery.refetch()
          } else {
            allRecordsQuery.refetch()
          }
        }}
      />

      {/* Details Dialog */}
      <MedicalRecordDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        record={selectedRecord}
        onEdit={(record) => {
          setSelectedRecord(record)
          setIsDetailsOpen(false)
          setIsFormOpen(true)
        }}
      />

      {/* Archive Confirmation Dialog */}
      <ArchiveMedicalRecordDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        record={selectedRecord}
        onConfirm={confirmArchive}
        isLoading={archiveMutation.isPending}
      />
    </div>
  )
}
