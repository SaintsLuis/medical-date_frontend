'use client'

import { useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Archive,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileX,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import { useArchivedMedicalRecords } from '../hooks/use-medical-records'
import {
  MedicalRecord,
  QueryMedicalRecordsParams,
  getCategoryText,
  getCategoryColor,
  getStatusText,
  getStatusColor,
  formatDate,
  formatDateTime,
} from '../types'
import { MedicalRecordsSkeleton } from './medical-records-skeleton'
import { MedicalRecordDetails } from './medical-record-details'

export function ArchivedMedicalRecords() {
  const { user } = useAuthStore()
  const isAdmin = user?.roles.includes(UserRole.ADMIN)

  // State management
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  )

  // Query parameters
  const queryParams: QueryMedicalRecordsParams = {
    page,
    limit,
    ...(search && { search }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(user?.roles.includes(UserRole.DOCTOR) && { doctorId: user.id }),
  }

  // Data fetching
  const {
    data: archivedData,
    isLoading,
    error,
    refetch,
  } = useArchivedMedicalRecords(queryParams, isAdmin)

  // Event handlers
  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDetailsOpen(true)
  }

  const handleResetFilters = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'NA'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  if (!isAdmin) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          No tienes permisos para acceder a los registros archivados.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <MedicalRecordsSkeleton />
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          {error.message || 'Error al cargar los registros archivados'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <Archive className='h-8 w-8 text-amber-600' />
            Registros Archivados
          </h1>
          <p className='text-muted-foreground'>
            Registros médicos archivados para preservación y auditoría
          </p>
        </div>
        <Button variant='outline' onClick={() => refetch()}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Actualizar
        </Button>
      </div>

      {/* Information Alert */}
      <Alert className='border-amber-200 bg-amber-50'>
        <Archive className='h-4 w-4 text-amber-600' />
        <AlertDescription className='text-amber-800'>
          <strong>Información:</strong> Los registros archivados son de solo
          lectura y se mantienen por cumplimiento médico y requerimientos
          regulatorios. No pueden ser editados.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter className='mr-2 h-5 w-5' />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Search */}
            <div>
              <label className='text-sm font-medium mb-2 block'>Buscar</label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por paciente, diagnóstico...'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className='text-sm font-medium mb-2 block'>Desde</label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label className='text-sm font-medium mb-2 block'>Hasta</label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Limit */}
            <div>
              <label className='text-sm font-medium mb-2 block'>
                Por página
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(parseInt(value))
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                  <SelectItem value='100'>100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-between items-center mt-4'>
            <Button variant='outline' onClick={handleResetFilters}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>
              Registros Archivados
              {archivedData && (
                <Badge variant='secondary' className='ml-2'>
                  {archivedData.meta.total} total
                </Badge>
              )}
            </CardTitle>
            <div className='text-sm text-muted-foreground'>
              {archivedData && (
                <>
                  Mostrando {(page - 1) * limit + 1} a{' '}
                  {Math.min(page * limit, archivedData.meta.total)} de{' '}
                  {archivedData.meta.total}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {archivedData && archivedData.data.length > 0 ? (
            <div className='space-y-4'>
              {/* Desktop Table */}
              <div className='hidden md:block'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Fecha Original</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Archivado</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedData.data.map((record) => (
                      <TableRow key={record.id} className='hover:bg-muted/50'>
                        {/* Paciente */}
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='text-xs bg-blue-100 text-blue-700'>
                                {getInitials(
                                  record.patientProfile?.user?.firstName,
                                  record.patientProfile?.user?.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium text-sm'>
                                {record.patientProfile?.user?.firstName}{' '}
                                {record.patientProfile?.user?.lastName}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {record.patientProfile?.user?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Doctor */}
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='text-xs bg-green-100 text-green-700'>
                                {getInitials(
                                  record.doctor?.firstName,
                                  record.doctor?.lastName
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
                            </div>
                          </div>
                        </TableCell>

                        {/* Fecha Original */}
                        <TableCell>
                          <div className='text-sm'>
                            {formatDate(record.date)}
                          </div>
                        </TableCell>

                        {/* Categoría */}
                        <TableCell>
                          {record.category ? (
                            <Badge
                              variant='outline'
                              className={getCategoryColor(record.category)}
                            >
                              {getCategoryText(record.category)}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>

                        {/* Diagnóstico */}
                        <TableCell className='max-w-xs'>
                          <p className='text-sm line-clamp-2'>
                            {record.diagnosis}
                          </p>
                        </TableCell>

                        {/* Archivado */}
                        <TableCell>
                          <div className='text-xs space-y-1'>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3 text-amber-500' />
                              <span>
                                {record.archivedAt &&
                                  formatDateTime(record.archivedAt)}
                              </span>
                            </div>
                            {record.archivedBy && (
                              <div className='text-muted-foreground'>
                                Por: {record.archivedBy}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Razón */}
                        <TableCell className='max-w-xs'>
                          <p className='text-xs text-muted-foreground line-clamp-2'>
                            {record.archiveReason || 'Sin razón especificada'}
                          </p>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='md:hidden space-y-4'>
                {archivedData.data.map((record) => (
                  <Card key={record.id} className='p-4'>
                    <div className='space-y-3'>
                      {/* Header */}
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-3'>
                          <Avatar>
                            <AvatarFallback className='bg-blue-100 text-blue-700'>
                              {getInitials(
                                record.patientProfile?.user?.firstName,
                                record.patientProfile?.user?.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>
                              {record.patientProfile?.user?.firstName}{' '}
                              {record.patientProfile?.user?.lastName}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {formatDate(record.date)}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className={getStatusColor(record.status)}
                        >
                          {getStatusText(record.status)}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className='space-y-2'>
                        <div>
                          <span className='text-xs font-medium text-muted-foreground'>
                            Diagnóstico:
                          </span>
                          <p className='text-sm mt-1'>{record.diagnosis}</p>
                        </div>

                        {record.archiveReason && (
                          <div>
                            <span className='text-xs font-medium text-muted-foreground'>
                              Razón de archivo:
                            </span>
                            <p className='text-xs mt-1 text-amber-700'>
                              {record.archiveReason}
                            </p>
                          </div>
                        )}

                        <div className='text-xs text-muted-foreground'>
                          Archivado:{' '}
                          {record.archivedAt &&
                            formatDateTime(record.archivedAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex justify-end pt-2 border-t'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye className='h-4 w-4 mr-1' />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {archivedData.meta.totalPages > 1 && (
                <div className='flex items-center justify-between pt-4 border-t'>
                  <div className='text-sm text-muted-foreground'>
                    Página {page} de {archivedData.meta.totalPages}
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      Anterior
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === archivedData.meta.totalPages}
                    >
                      Siguiente
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4'>
                <FileX className='h-6 w-6 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-medium mb-2'>
                No hay registros archivados
              </h3>
              <p className='text-muted-foreground'>
                {search || startDate || endDate
                  ? 'No se encontraron registros archivados con los filtros aplicados'
                  : 'No hay registros médicos archivados disponibles'}
              </p>
              {(search || startDate || endDate) && (
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={handleResetFilters}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <MedicalRecordDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        record={selectedRecord}
        // Archive records should not be editable
        onEdit={undefined}
      />
    </div>
  )
}
