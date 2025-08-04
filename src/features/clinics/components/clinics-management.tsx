'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Star,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Globe,
  Heart,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  useClinics,
  useClinicStats,
  useClinicActions,
} from '../hooks/use-clinics'
import { ClinicForm } from './clinic-form'
import { ClinicsSkeletion } from './clinics-skeleton'
import {
  Clinic,
  QueryClinicsParams,
  formatWorkingHours,
  isClinicOpen,
} from '../types'

// ==============================================
// Componente Principal
// ==============================================

export function ClinicsManagement() {
  // Estados de filtros y búsqueda
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)

  // Estados de gestión
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Hook de acciones
  const { deleteClinic, isLoading: managementLoading } = useClinicActions()

  // Estados adicionales
  const [viewDetailsClinic, setViewDetailsClinic] = useState<Clinic | null>(
    null
  )
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Construir parámetros de query
  const queryParams: QueryClinicsParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search: search || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      location: locationFilter || undefined,
      hasServices: serviceFilter ? [serviceFilter] : undefined,
      includeDoctors: true,
      includeSpecialties: true,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
    [currentPage, pageSize, search, statusFilter, locationFilter, serviceFilter]
  )

  // Queries
  const {
    data: clinicsResponse,
    isLoading: clinicsLoading,
    error: clinicsError,
    refetch: refetchClinics,
  } = useClinics(queryParams)

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useClinicStats()

  // ==============================================
  // Handlers
  // ==============================================

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleLocationFilter = (location: string) => {
    setLocationFilter(location)
    setCurrentPage(1)
  }

  const handleServiceFilter = (service: string) => {
    setServiceFilter(service)
    setCurrentPage(1)
  }

  const handleCreateNew = () => {
    setSelectedClinic(null)
    setIsFormOpen(true)
  }

  const handleEdit = (clinic: Clinic) => {
    setSelectedClinic(clinic)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (clinic: Clinic) => {
    setSelectedClinic(clinic)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedClinic) return

    try {
      await deleteClinic.mutateAsync(selectedClinic.id)
      setIsDeleteDialogOpen(false)
      setSelectedClinic(null)
    } catch (error) {
      console.error('Error al eliminar clínica:', error)
    }
  }

  const handleToggleStatusClick = async (clinic: Clinic) => {
    // TODO: Implementar toggle de estado
    console.log('Toggle status for clinic:', clinic.id)
  }

  const handleViewDetails = (clinic: Clinic) => {
    setViewDetailsClinic(clinic)
    setIsDetailsDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedClinic(null)
    refetchClinics()
  }

  // ==============================================
  // Funciones de Utilidad
  // ==============================================

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  const getOpenStatusColor = (isOpen: boolean) => {
    return isOpen
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-orange-100 text-orange-800 border-orange-200'
  }

  // ==============================================
  // Componentes de Renderizado
  // ==============================================

  const StatsCards = () => {
    if (statsLoading) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div className='h-4 w-20 bg-muted rounded animate-pulse' />
                <div className='h-4 w-4 bg-muted rounded animate-pulse' />
              </CardHeader>
              <CardContent>
                <div className='h-6 w-16 bg-muted rounded animate-pulse mb-1' />
                <div className='h-3 w-24 bg-muted rounded animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (statsError || !statsData?.data) {
      return (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Error al cargar estadísticas.
            <Button
              variant='link'
              className='p-0 h-auto font-normal ml-1'
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    const stats = statsData.data

    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Clínicas
            </CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.active} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Clínicas Activas
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active}</div>
            <p className='text-xs text-muted-foreground'>
              {((stats.active / stats.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Doctores
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalDoctors}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.totalDoctors > 0
                ? (stats.totalDoctors / stats.active).toFixed(1)
                : '0'}{' '}
              promedio por clínica
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ClinicsGrid = () => {
    if (clinicsLoading) {
      return <ClinicsSkeletion />
    }

    if (clinicsError) {
      return (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Error al cargar las clínicas.
            <Button
              variant='link'
              className='p-0 h-auto font-normal ml-1'
              onClick={() => refetchClinics()}
            >
              Intentar de nuevo
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (
      !clinicsResponse?.data?.data ||
      clinicsResponse.data.data.length === 0
    ) {
      return (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No hay clínicas</h3>
            <p className='text-muted-foreground text-center mb-4'>
              {search ||
              statusFilter !== 'all' ||
              locationFilter ||
              serviceFilter
                ? 'No se encontraron clínicas que coincidan con los filtros seleccionados.'
                : 'Aún no hay clínicas registradas en el sistema.'}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className='mr-2 h-4 w-4' />
              Crear Primera Clínica
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {clinicsResponse.data.data.map((clinic: Clinic) => {
          const isOpen = clinic.workingHours
            ? isClinicOpen(clinic.workingHours)
            : false

          return (
            <Card key={clinic.id} className='hover:shadow-md transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={clinic.profilePhoto?.thumbnailUrl}
                        alt={clinic.name}
                      />
                      <AvatarFallback>
                        {getInitials(clinic.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-lg line-clamp-1'>
                        {clinic.name}
                      </CardTitle>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge className={getStatusColor(clinic.isActive)}>
                          {clinic.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Badge className={getOpenStatusColor(isOpen)}>
                          {isOpen ? 'Abierta' : 'Cerrada'}
                        </Badge>
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
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(clinic)}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(clinic)}>
                        <Edit className='mr-2 h-4 w-4' />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatusClick(clinic)}
                        disabled={managementLoading}
                      >
                        {clinic.isActive ? (
                          <>
                            <XCircle className='mr-2 h-4 w-4' />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(clinic)}
                        className='text-red-600'
                        disabled={managementLoading}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center text-sm text-muted-foreground'>
                  <MapPin className='h-4 w-4 mr-2 flex-shrink-0' />
                  <span className='line-clamp-2'>{clinic.address}</span>
                </div>

                <div className='flex items-center text-sm text-muted-foreground'>
                  <Phone className='h-4 w-4 mr-2 flex-shrink-0' />
                  <span>{clinic.phone}</span>
                </div>

                <div className='flex items-center text-sm text-muted-foreground'>
                  <Mail className='h-4 w-4 mr-2 flex-shrink-0' />
                  <span className='truncate'>{clinic.email}</span>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center text-muted-foreground'>
                    <Users className='h-4 w-4 mr-1' />
                    <span>{clinic.totalDoctors} doctores</span>
                  </div>
                </div>

                {clinic.services && clinic.services.length > 0 && (
                  <div className='space-y-2'>
                    <div className='text-sm font-medium'>Servicios:</div>
                    <div className='flex flex-wrap gap-1'>
                      {clinic.services.slice(0, 3).map((service) => (
                        <Badge
                          key={service}
                          variant='outline'
                          className='text-xs'
                        >
                          {service}
                        </Badge>
                      ))}
                      {clinic.services.length > 3 && (
                        <Badge variant='outline' className='text-xs'>
                          +{clinic.services.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className='text-sm text-muted-foreground'>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 mr-2' />
                    <span className='truncate'>
                      {clinic.workingHours
                        ? formatWorkingHours(clinic.workingHours)
                        : 'Horarios no configurados'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const ClinicDetailsDialog = () => {
    if (!viewDetailsClinic) return null

    const isOpen = viewDetailsClinic.workingHours
      ? isClinicOpen(viewDetailsClinic.workingHours)
      : false

    return (
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5' />
              {viewDetailsClinic.name}
            </DialogTitle>
            <DialogDescription>
              Información detallada de la clínica
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Información básica */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{viewDetailsClinic.address}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{viewDetailsClinic.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{viewDetailsClinic.email}</span>
                  </div>
                  {viewDetailsClinic.website && (
                    <div className='flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-muted-foreground' />
                      <a
                        href={viewDetailsClinic.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-blue-600 hover:underline'
                      >
                        {viewDetailsClinic.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Estado y Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Estado:</span>
                    <Badge
                      className={getStatusColor(viewDetailsClinic.isActive)}
                    >
                      {viewDetailsClinic.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Actualmente:</span>
                    <Badge className={getOpenStatusColor(isOpen)}>
                      {isOpen ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Doctores:</span>
                    <span className='text-sm'>
                      {viewDetailsClinic.totalDoctors}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Pacientes:</span>
                    <span className='text-sm'>
                      {viewDetailsClinic.totalPatients}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Descripción */}
            {viewDetailsClinic.description && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    {viewDetailsClinic.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Horarios */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Horarios de Atención</CardTitle>
              </CardHeader>
              <CardContent>
                {viewDetailsClinic.workingHours ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {Object.entries(viewDetailsClinic.workingHours).map(
                      ([day, schedule]) => {
                        const dayNames = {
                          monday: 'Lunes',
                          tuesday: 'Martes',
                          wednesday: 'Miércoles',
                          thursday: 'Jueves',
                          friday: 'Viernes',
                          saturday: 'Sábado',
                          sunday: 'Domingo',
                        }

                        return (
                          <div
                            key={day}
                            className='flex justify-between items-center py-1'
                          >
                            <span className='text-sm font-medium'>
                              {dayNames[day as keyof typeof dayNames]}:
                            </span>
                            <span className='text-sm text-muted-foreground'>
                              {schedule.isOpen
                                ? `${schedule.start} - ${schedule.end}`
                                : 'Cerrado'}
                            </span>
                          </div>
                        )
                      }
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Horarios no configurados
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Servicios y Amenidades */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {viewDetailsClinic.services &&
                viewDetailsClinic.services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Heart className='h-5 w-5' />
                        Servicios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {viewDetailsClinic.services.map((service) => (
                          <Badge key={service} variant='secondary'>
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {viewDetailsClinic.amenities &&
                viewDetailsClinic.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Star className='h-5 w-5' />
                        Amenidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {viewDetailsClinic.amenities.map((amenity) => (
                          <Badge key={amenity} variant='outline'>
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Coordenadas GPS */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Ubicación GPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='text-sm font-medium'>Latitud:</span>
                    <p className='text-sm text-muted-foreground'>
                      {viewDetailsClinic.coordinates.lat}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm font-medium'>Longitud:</span>
                    <p className='text-sm text-muted-foreground'>
                      {viewDetailsClinic.coordinates.lng}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Gestión de Clínicas</h1>
          <p className='text-muted-foreground'>
            Administra las clínicas y centros médicos del sistema
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={() => refetchClinics()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Actualizar
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className='h-4 w-4 mr-2' />
            Nueva Clínica
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className='space-y-6 pb-8'>
        {/* Resumen */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Resumen</h2>
          <StatsCards />
        </div>

        {/* Clínicas */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Clínicas</h2>

          {/* Filtros */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar clínicas...'
                className='pl-10'
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos</SelectItem>
                <SelectItem value='active'>Activas</SelectItem>
                <SelectItem value='inactive'>Inactivas</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder='Filtrar por ubicación...'
              className='w-48'
              value={locationFilter}
              onChange={(e) => handleLocationFilter(e.target.value)}
            />
            <Input
              placeholder='Filtrar por servicio...'
              className='w-48'
              value={serviceFilter}
              onChange={(e) => handleServiceFilter(e.target.value)}
            />
          </div>

          {/* Grid de clínicas */}
          <ClinicsGrid />

          {/* Paginación */}
          {clinicsResponse?.data &&
            clinicsResponse.data.meta.totalPages > 1 && (
              <div className='flex items-center justify-between'>
                <p className='text-sm text-muted-foreground'>
                  Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                  {Math.min(
                    currentPage * pageSize,
                    clinicsResponse.data.meta.total
                  )}{' '}
                  de {clinicsResponse.data.meta.total} clínicas
                </p>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!clinicsResponse.data.meta.hasPreviousPage}
                  >
                    Anterior
                  </Button>
                  <span className='text-sm'>
                    Página {currentPage} de{' '}
                    {clinicsResponse.data.meta.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!clinicsResponse.data.meta.hasNextPage}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Dialogs */}
      <ClinicForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        clinic={selectedClinic}
        onSuccess={handleFormSuccess}
      />

      <ClinicDetailsDialog />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              clínica &quot;{selectedClinic?.name}&quot; y todos sus datos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={managementLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={managementLoading}
              className='bg-red-600 hover:bg-red-700'
            >
              {managementLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
