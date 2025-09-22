'use client'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  MedicalRecord,
  MedicalRecordCategory,
  Priority,
  MedicalRecordFilters,
  PaginatedMedicalRecordsResponse,
  getCategoryText,
  getPriorityText,
  getPriorityColor,
  getCategoryColor,
  formatDate,
  isFollowUpOverdue,
  getDaysUntilFollowUp,
} from '../types'
import { MedicalRecordTableSkeleton } from './medical-records-skeleton'

interface MedicalRecordsTableProps {
  data?: PaginatedMedicalRecordsResponse
  isLoading: boolean
  error?: Error | null
  filters: MedicalRecordFilters
  onFilterChange: (
    key: keyof MedicalRecordFilters,
    value: string | boolean
  ) => void
  onResetFilters: () => void
  page: number
  limit: number
  onPageChange: (page: number) => void
  onView: (record: MedicalRecord) => void
  onEdit: (record: MedicalRecord) => void
  onArchive: (record: MedicalRecord) => void
}

export function MedicalRecordsTable({
  data,
  isLoading,
  error,
  filters,
  onFilterChange,
  onResetFilters,
  page,
  limit,
  onPageChange,
  onView,
  onEdit,
  onArchive,
}: MedicalRecordsTableProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const isAdmin = user?.roles.includes(UserRole.ADMIN)

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'NA'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getUserName = (record: MedicalRecord, isDoctor: boolean) => {
    if (isDoctor) {
      const firstName = record.patientProfile?.user?.firstName
      const lastName = record.patientProfile?.user?.lastName
      if (!firstName || !lastName) return 'Paciente no disponible'
      return `${firstName} ${lastName}`
    } else {
      // Debug: vamos a ver qué está llegando
      console.log('Debug - Doctor data:', record.doctor)
      const firstName = record.doctor?.firstName
      const lastName = record.doctor?.lastName
      if (!firstName || !lastName) return 'Doctor no disponible'
      return `${firstName} ${lastName}`
    }
  }

  const getUserEmail = (record: MedicalRecord, isDoctor: boolean) => {
    if (isDoctor) {
      return record.patientProfile?.user?.email || 'Email no disponible'
    } else {
      return record.doctor?.email || 'Email no disponible'
    }
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando registros médicos...</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicalRecordTableSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-red-600'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2 text-red-600'>
            <AlertTriangle className='h-4 w-4' />
            <span>
              {error.message || 'Error al cargar los registros médicos'}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter className='mr-2 h-5 w-5' />
            Filtros Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
            {/* Search */}
            <div className='lg:col-span-2'>
              <label className='text-sm font-medium mb-2 block'>Buscar</label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Síntomas, diagnóstico, tratamiento...'
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
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
                onValueChange={(value) => onFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Todas' />
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
                onValueChange={(value) => onFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Todas' />
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

            {/* Follow-up only toggle */}
            <div className='flex items-end'>
              <label className='flex items-center space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.followUpOnly}
                  onChange={(e) =>
                    onFilterChange('followUpOnly', e.target.checked)
                  }
                  className='rounded border-gray-300'
                />
                <span className='text-sm font-medium'>Solo seguimientos</span>
              </label>
            </div>
          </div>

          {/* Date filters */}
          <div className='grid gap-4 md:grid-cols-3 mt-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>
                Fecha desde
              </label>
              <Input
                type='date'
                value={filters.startDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium mb-2 block'>
                Fecha hasta
              </label>
              <Input
                type='date'
                value={filters.endDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={onResetFilters}
                className='w-full'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>
              Registros Médicos
              {data && (
                <Badge variant='secondary' className='ml-2'>
                  {data.meta.total} total
                </Badge>
              )}
            </CardTitle>
            <div className='text-sm text-muted-foreground'>
              {data && (
                <>
                  Mostrando {(page - 1) * limit + 1} a{' '}
                  {Math.min(page * limit, data.meta.total)} de {data.meta.total}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data && data.data.length > 0 ? (
            <div className='space-y-4'>
              {/* Desktop Table */}
              <div className='hidden md:block'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isDoctor ? 'Paciente' : 'Doctor'}</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className='text-right'>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((record) => (
                      <TableRow key={record.id} className='hover:bg-muted/50'>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='text-xs'>
                                {getInitials(
                                  isDoctor
                                    ? record.patientProfile?.user?.firstName
                                    : record.doctor?.firstName,
                                  isDoctor
                                    ? record.patientProfile?.user?.lastName
                                    : record.doctor?.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>
                                {getUserName(record, !!isDoctor)}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {getUserEmail(record, !!isDoctor)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className='text-sm'>
                            {formatDate(record.date)}
                          </div>
                        </TableCell>

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

                        <TableCell>
                          {record.priority ? (
                            <Badge
                              variant='outline'
                              className={getPriorityColor(record.priority)}
                            >
                              {getPriorityText(record.priority)}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className='max-w-xs'>
                            <p className='text-sm line-clamp-2'>
                              {record.diagnosis}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(record)}
                            {record.followUpDate && (
                              <div className='text-xs'>
                                <div
                                  className={
                                    isFollowUpOverdue(record.followUpDate)
                                      ? 'text-red-600'
                                      : 'text-yellow-600'
                                  }
                                >
                                  {isFollowUpOverdue(record.followUpDate)
                                    ? `Vencido ${Math.abs(
                                        getDaysUntilFollowUp(
                                          record.followUpDate
                                        )
                                      )}d`
                                    : `${getDaysUntilFollowUp(
                                        record.followUpDate
                                      )}d`}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => onView(record)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Ver Detalles
                              </DropdownMenuItem>
                              {isDoctor && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onEdit(record)}
                                  >
                                    <Edit className='mr-2 h-4 w-4' />
                                    Editar
                                  </DropdownMenuItem>
                                  {isAdmin && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => onArchive(record)}
                                        className='text-amber-600'
                                      >
                                        <Archive className='mr-2 h-4 w-4' />
                                        Archivar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='md:hidden space-y-4'>
                {data.data.map((record) => (
                  <Card key={record.id} className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-3 flex-1'>
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(
                              isDoctor
                                ? record.patientProfile?.user?.firstName
                                : record.doctor?.firstName,
                              isDoctor
                                ? record.patientProfile?.user?.lastName
                                : record.doctor?.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <h4 className='font-medium truncate'>
                              {getUserName(record, !!isDoctor)}
                            </h4>
                            {getStatusIcon(record)}
                          </div>

                          <div className='space-y-1'>
                            <p className='text-sm text-muted-foreground'>
                              {formatDate(record.date)}
                            </p>

                            <div className='flex flex-wrap gap-1'>
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
                            </div>

                            <p className='text-sm line-clamp-2'>
                              {record.diagnosis}
                            </p>

                            {record.followUpDate && (
                              <p
                                className={`text-xs ${
                                  isFollowUpOverdue(record.followUpDate)
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                Seguimiento: {formatDate(record.followUpDate)}
                                {isFollowUpOverdue(record.followUpDate) &&
                                  ' (Vencido)'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onView(record)}>
                            <Eye className='mr-2 h-4 w-4' />
                            Ver Detalles
                          </DropdownMenuItem>
                          {isDoctor && (
                            <>
                              <DropdownMenuItem onClick={() => onEdit(record)}>
                                <Edit className='mr-2 h-4 w-4' />
                                Editar
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onArchive(record)}
                                    className='text-amber-600'
                                  >
                                    <Archive className='mr-2 h-4 w-4' />
                                    Archivar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className='flex items-center justify-between pt-4 border-t'>
                  <div className='text-sm text-muted-foreground'>
                    Página {page} de {data.meta.totalPages}
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      Anterior
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page + 1)}
                      disabled={page === data.meta.totalPages}
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
                <Search className='h-6 w-6 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-medium mb-2'>
                No se encontraron registros
              </h3>
              <p className='text-muted-foreground'>
                {filters.search ||
                filters.category !== 'ALL' ||
                filters.priority !== 'ALL'
                  ? 'Intenta ajustar los filtros para encontrar lo que buscas'
                  : 'No hay registros médicos disponibles'}
              </p>
              {(filters.search ||
                filters.category !== 'ALL' ||
                filters.priority !== 'ALL') && (
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={onResetFilters}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
