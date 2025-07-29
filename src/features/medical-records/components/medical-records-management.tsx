'use client'

import { useState, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  useMedicalRecords,
  useMyMedicalRecords,
  useFollowUpRecords,
  useDeleteMedicalRecord,
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
} from '../types'
import { MedicalRecordsSkeleton } from './medical-records-skeleton'
import { MedicalRecordForm } from './medical-record-form'
import { MedicalRecordDetails } from './medical-record-details'
import { MedicalRecordsPagination } from './medical-records-pagination'
import { MedicalRecordAnalytics } from './medical-record-analytics'
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  )

  // Query parameters based on filters
  const queryParams = {
    page,
    limit,
    ...(filters.patientProfileId && {
      patientProfileId: filters.patientProfileId,
    }),
    ...(filters.doctorId && { doctorId: filters.doctorId }),
    ...(filters.category !== 'ALL' && { category: filters.category }),
    ...(filters.priority !== 'ALL' && { priority: filters.priority }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.search && { search: filters.search }),
    ...(filters.followUpOnly && { followUpOnly: true }),
  }

  // Data fetching - Fix conditional hooks
  const myRecordsQuery = useMyMedicalRecords(queryParams, isDoctor)
  const allRecordsQuery = useMedicalRecords(queryParams, isAdmin && !isDoctor)

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
  const deleteMutation = useDeleteMedicalRecord()

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

  const handleDeleteRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRecord) return

    try {
      await deleteMutation.mutateAsync(selectedRecord.id)
      setIsDeleteDialogOpen(false)
      setSelectedRecord(null)

      // Force refetch to ensure UI is updated
      if (isDoctor) {
        myRecordsQuery.refetch()
      } else {
        allRecordsQuery.refetch()
      }
    } catch (error) {
      console.error('Error deleting record:', error)
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
          className={`grid w-full ${isDoctor ? 'grid-cols-3' : 'grid-cols-2'}`}
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
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {/* Search */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Buscar
                  </label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Síntomas, diagnóstico...'
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange('search', e.target.value)
                      }
                      className='pl-10'
                    />
                  </div>
                </div>

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

                {/* Registros por página */}
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Registros por página
                  </label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      const newLimit = parseInt(value)
                      setLimit(newLimit)
                      setPage(1) // Reset to first page when changing limit
                      console.log(
                        '📄 [MedicalRecordsManagement] Limit changed:',
                        {
                          from: limit,
                          to: newLimit,
                        }
                      )
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5 registros</SelectItem>
                      <SelectItem value='10'>10 registros</SelectItem>
                      <SelectItem value='20'>20 registros</SelectItem>
                      <SelectItem value='50'>50 registros</SelectItem>
                      <SelectItem value='100'>100 registros</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {/* Mobile/Desktop responsive list */}
                  <div className='space-y-3'>
                    {recordsData.data.map((record) => (
                      <div
                        key={record.id}
                        className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                      >
                        <div className='flex items-center space-x-4'>
                          {/* Patient/Doctor Avatar */}
                          <Avatar>
                            <AvatarFallback>
                              {(() => {
                                // Use direct patient object instead of patientProfile.user
                                const initials = isDoctor
                                  ? getInitials(
                                      record.patient?.firstName || '',
                                      record.patient?.lastName || ''
                                    )
                                  : getInitials(
                                      record.doctor?.firstName || '',
                                      record.doctor?.lastName || ''
                                    )

                                return initials
                              })()}
                            </AvatarFallback>
                          </Avatar>

                          <div className='space-y-1'>
                            <div className='flex items-center space-x-2'>
                              <h4 className='font-medium'>
                                {(() => {
                                  // Use direct patient object instead of patientProfile.user
                                  const displayName = isDoctor
                                    ? `${record.patient?.firstName || 'N/A'} ${
                                        record.patient?.lastName || 'N/A'
                                      }`
                                    : `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`

                                  return displayName
                                })()}
                              </h4>
                              {getStatusIcon(record)}
                            </div>

                            <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                              <span>{formatDate(record.date)}</span>
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

                            <p className='text-sm text-muted-foreground line-clamp-1'>
                              {record.diagnosis}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                          {record.followUpDate && (
                            <div className='text-right text-sm'>
                              <div className='text-muted-foreground'>
                                Seguimiento:
                              </div>
                              <div
                                className={
                                  isFollowUpOverdue(record.followUpDate)
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }
                              >
                                {formatDate(record.followUpDate)}
                              </div>
                            </div>
                          )}

                          <div className='flex items-center space-x-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>

                            {isDoctor && (
                              <>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEditRecord(record)}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>

                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteRecord(record)}
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {recordsData.meta.totalPages > 1 && (
                    <div className='flex items-center justify-between'>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro médico. Esta
              operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
