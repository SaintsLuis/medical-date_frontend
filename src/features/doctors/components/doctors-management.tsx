'use client'

import { useState } from 'react'
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Power,
  PowerOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAllActiveSpecialties } from '@/features/specialties/hooks/use-specialties'
import { useAllActiveClinics } from '@/features/clinics'
import {
  useDoctors,
  useDoctorStats,
  useDeleteDoctor,
  useToggleDoctorStatus,
} from '../hooks/use-doctors'
import { DoctorForm } from './doctor-form'
import type { Doctor } from '../types'
import Link from 'next/link'

// Importar componentes de gráficos
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ==============================================
// Función para asignar colores a especialidades
// ==============================================

const getSpecialtyColor = (specialtyName: string): string => {
  const colorMap: Record<string, string> = {
    // Especialidades principales - Colores vibrantes
    Cardiología: '#ef4444', // Rojo
    Ortopedia: '#10b981', // Verde esmeralda
    Pediatría: '#3b82f6', // Azul
    Dermatología: '#8b5cf6', // Púrpura
    Neurología: '#f59e0b', // Ámbar
    Psiquiatría: '#ec4899', // Rosa
    Ginecología: '#06b6d4', // Cian
    Oftalmología: '#84cc16', // Verde lima
    Otorrinolaringología: '#f97316', // Naranja
    Urología: '#6366f1', // Índigo

    // Especialidades secundarias - Colores más suaves
    Endocrinología: '#14b8a6', // Verde azulado
    Gastroenterología: '#f43f5e', // Rosa rojizo
    Hematología: '#a855f7', // Violeta
    Infectología: '#eab308', // Amarillo
    Nefrología: '#22c55e', // Verde
    Oncología: '#dc2626', // Rojo oscuro
    Neumología: '#0891b2', // Azul cian
    Reumatología: '#7c3aed', // Violeta oscuro
    Traumatología: '#059669', // Verde esmeralda oscuro
    'Cirugía General': '#be185d', // Rosa oscuro

    // Especialidades adicionales
    'Medicina Interna': '#0d9488', // Verde azulado oscuro
    'Medicina Familiar': '#65a30d', // Verde lima oscuro
    Anestesiología: '#9333ea', // Violeta medio
    Radiología: '#0ea5e9', // Azul cielo
    Patología: '#64748b', // Gris azulado
    'Medicina de Emergencia': '#dc2626', // Rojo
    'Medicina Preventiva': '#16a34a', // Verde
    'Medicina Deportiva': '#ea580c', // Naranja oscuro
  }

  return colorMap[specialtyName] || '#6b7280' // Gris por defecto
}

// ==============================================
// Componente principal
// ==============================================

export function DoctorsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [includeAvailability] = useState(true)
  const [includeSpecialties] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar el tab activo del localStorage al inicializar
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doctors-management-tab') || 'overview'
    }
    return 'overview'
  })

  // Hooks para datos
  const {
    data: doctorsData,
    isLoading: isLoadingDoctors,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useDoctors({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    specialtyId: selectedSpecialty || undefined,
    location: selectedLocation || undefined,
    includeAvailability,
    includeSpecialties,
  })

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useDoctorStats()

  const deleteMutation = useDeleteDoctor()
  const toggleStatusMutation = useToggleDoctorStatus()

  // ==============================================
  // Handlers
  // ==============================================

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSpecialtyFilter = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId)
    setCurrentPage(1)
  }

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location)
    setCurrentPage(1)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Guardar el tab activo en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('doctors-management-tab', tab)
    }
  }

  const handleCreateNew = () => {
    setSelectedDoctor(null)
    setShowForm(true)
  }

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowForm(true)
  }

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedDoctor) return

    try {
      await deleteMutation.mutateAsync(selectedDoctor.id)
      setShowDeleteConfirm(false)
      setSelectedDoctor(null)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await toggleStatusMutation.mutateAsync(doctor.id)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedDoctor(null)
    refetchDoctors()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedDoctor(null)
  }

  // ==============================================
  // Componentes internos
  // ==============================================

  const StatsCards = () => {
    if (isLoadingStats) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 3 }).map((_, i) => (
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

    // Asegurar valores por defecto para evitar errores
    const safeStats = {
      total: stats.data?.total ?? 0,
      active: stats.data?.active ?? 0,
      bySpecialty: stats.data?.bySpecialty ?? [],
    }

    return (
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-900'>
              Total Doctores
            </CardTitle>
            <div className='h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.total}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {safeStats.total}
            </div>
            <p className='text-xs text-blue-700'>Médicos registrados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-900'>
              Activos
            </CardTitle>
            <div className='h-8 w-8 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.active}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {safeStats.active}
            </div>
            <p className='text-xs text-green-700'>Doctores activos</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-900'>
              Especialidades
            </CardTitle>
            <div className='h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.bySpecialty.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {safeStats.bySpecialty.length}
            </div>
            <p className='text-xs text-purple-700'>
              Especialidades con doctores
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==============================================
  // Componentes de Gráficos
  // ==============================================

  const SpecialtyDistributionChart = () => {
    if (isLoadingStats || !stats) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      )
    }

    // Preparar datos para el gráfico de distribución de especialidades
    const specialtyData =
      stats.data?.bySpecialty
        ?.map((specialty) => ({
          name: specialty.specialtyName,
          value: specialty.count,
          color: getSpecialtyColor(specialty.specialtyName),
        }))
        .filter((item) => item.value > 0) || [] // Solo mostrar especialidades con doctores

    if (specialtyData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Especialidad</CardTitle>
            <CardDescription>Doctores por especialidad médica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              No hay doctores registrados
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Especialidad</CardTitle>
          <CardDescription>Doctores por especialidad médica</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={specialtyData}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                }
              >
                {specialtyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const DoctorsTable = () => {
    if (isLoadingDoctors) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (doctorsError) {
      return (
        <Card>
          <CardContent className='pt-6'>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar doctores: {doctorsError.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (!doctorsData?.data || doctorsData.data.data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Doctores del Sistema</CardTitle>
            <CardDescription>No se encontraron doctores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || selectedSpecialty || selectedLocation
                  ? 'No se encontraron doctores que coincidan con los filtros.'
                  : 'Aún no hay doctores registrados en el sistema.'}
              </p>
              <Button onClick={handleCreateNew} className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Crear Primer Doctor
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    const getInitials = (firstName: string, lastName: string) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const getSpecialtyDisplay = (specialties: Array<{ name: string }>) => {
      if (specialties.length === 0) return 'Sin especialidad'
      if (specialties.length === 1) return specialties[0].name
      return `${specialties[0].name} +${specialties.length - 1}`
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctores del Sistema</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {/* Vista desktop: tabla responsive */}
          <div className='hidden md:block'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-1/4 pl-6'>Doctor</TableHead>
                    <TableHead className='w-1/6'>Especialidad</TableHead>
                    <TableHead className='w-1/6'>Estado</TableHead>
                    <TableHead className='w-1/6'>Activar/Desactivar</TableHead>
                    <TableHead className='w-1/6'>Tarifa</TableHead>
                    <TableHead className='w-[120px] text-center pr-6'>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorsData.data?.data.map((doctor: Doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className='font-medium pl-6'>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={doctor.profilePhoto?.thumbnailUrl}
                              alt={`${doctor.user.firstName} ${doctor.user.lastName}`}
                            />
                            <AvatarFallback>
                              {getInitials(
                                doctor.user.firstName,
                                doctor.user.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col'>
                            <div className='font-medium'>
                              {doctor.user.firstName} {doctor.user.lastName}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {doctor.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {getSpecialtyDisplay(doctor.specialties)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doctor.user.isActive ? 'default' : 'secondary'
                          }
                        >
                          {doctor.user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Button
                          variant={doctor.user.isActive ? 'outline' : 'default'}
                          size='sm'
                          onClick={() => handleToggleStatus(doctor)}
                          className='h-8 px-3'
                          disabled={toggleStatusMutation.isPending}
                        >
                          {toggleStatusMutation.isPending ? (
                            <RefreshCw className='h-4 w-4 animate-spin' />
                          ) : doctor.user.isActive ? (
                            <>
                              <PowerOff className='h-4 w-4 mr-1' />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power className='h-4 w-4 mr-1' />
                              Activar
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        ${doctor.consultationFee}
                      </TableCell>
                      <TableCell className='pr-6'>
                        <div className='flex justify-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(doctor)}
                            className='h-7 w-7 p-0'
                            title='Editar doctor'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(doctor)}
                            className='h-7 w-7 p-0'
                            title='Eliminar doctor'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Vista móvil: cards apiladas */}
          <div className='md:hidden space-y-3 p-6'>
            {doctorsData.data?.data.map((doctor: Doctor) => (
              <Card key={doctor.id} className='border-l-4 border-l-blue-500'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center space-x-3 flex-1'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage
                          src={doctor.profilePhoto?.thumbnailUrl}
                          alt={`${doctor.user.firstName} ${doctor.user.lastName}`}
                        />
                        <AvatarFallback>
                          {getInitials(
                            doctor.user.firstName,
                            doctor.user.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <h3 className='font-medium text-lg leading-tight'>
                          Dr. {doctor.user.firstName} {doctor.user.lastName}
                        </h3>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {doctor.user.email}
                        </p>
                      </div>
                    </div>
                    <div className='ml-3 flex space-x-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(doctor)}
                        className='h-8 w-8 p-0'
                        title='Editar doctor'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(doctor)}
                        className='h-8 w-8 p-0'
                        title='Eliminar doctor'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='outline'>
                        {getSpecialtyDisplay(doctor.specialties)}
                      </Badge>
                      <Badge
                        variant={doctor.user.isActive ? 'default' : 'secondary'}
                      >
                        {doctor.user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <span className='text-muted-foreground text-xs'>
                      ${doctor.consultationFee}
                    </span>
                  </div>

                  {/* Toggle de estado en móvil */}
                  <div className='mt-3 flex justify-center'>
                    <Button
                      variant={doctor.user.isActive ? 'outline' : 'default'}
                      size='sm'
                      onClick={() => handleToggleStatus(doctor)}
                      className='w-full'
                      disabled={toggleStatusMutation.isPending}
                    >
                      {toggleStatusMutation.isPending ? (
                        <RefreshCw className='h-4 w-4 animate-spin' />
                      ) : doctor.user.isActive ? (
                        <>
                          <PowerOff className='h-4 w-4 mr-1' />
                          Desactivar Doctor
                        </>
                      ) : (
                        <>
                          <Power className='h-4 w-4 mr-1' />
                          Activar Doctor
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {doctorsData.data?.meta.totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 px-6 border-t bg-gray-50/50'>
              <div className='text-sm text-muted-foreground order-2 sm:order-1'>
                Página {doctorsData.data.meta.page} de{' '}
                {doctorsData.data.meta.totalPages} (
                {doctorsData.data.meta.total} total)
              </div>
              <div className='flex space-x-2 order-1 sm:order-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!doctorsData.data.meta.hasPreviousPage}
                  className='px-3'
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!doctorsData.data.meta.hasNextPage}
                  className='px-3'
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // ==============================================
  // Render principal
  // ==============================================

  if (showForm) {
    return (
      <div className='space-y-6 pb-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {selectedDoctor ? 'Editar Doctor' : 'Crear Doctor'}
          </h1>
          <Button variant='outline' onClick={handleFormCancel}>
            Volver
          </Button>
        </div>
        <DoctorForm
          doctor={selectedDoctor}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          title={selectedDoctor ? 'Editar Doctor' : 'Crear Doctor'}
          description={
            selectedDoctor
              ? 'Actualiza la información del doctor'
              : 'Completa la información para crear un nuevo doctor'
          }
        />
      </div>
    )
  }

  if (showDeleteConfirm && selectedDoctor) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Confirmar Eliminación
          </h1>
          <Button variant='outline' onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>¿Estás seguro?</CardTitle>
            <CardDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              doctor Dr. {selectedDoctor.user.firstName}{' '}
              {selectedDoctor.user.lastName} del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert variant='destructive'>
              <AlertDescription>
                <strong>Advertencia:</strong> Esta acción eliminará
                permanentemente la cuenta del doctor y todos sus datos
                asociados.
              </AlertDescription>
            </Alert>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Doctores
          </h1>
          <p className='text-muted-foreground'>
            Administra los doctores del sistema y sus especialidades
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className='mr-2 h-4 w-4' />
          Crear Doctor
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='doctors'>Doctores</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='space-y-6'>
            <StatsCards />

            {/* Gráficos */}
            <div className='space-y-6'>
              <SpecialtyDistributionChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='doctors' className='space-y-6 pb-4'>
          {/* Barra de búsqueda y filtros */}
          <Card className='bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <div className='relative flex-1 min-w-0'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Buscar doctores por nombre o email...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <Button
                    variant='outline'
                    onClick={() => refetchDoctors()}
                    className='h-10'
                    size='sm'
                  >
                    <RefreshCw className='h-4 w-4' />
                    <span className='sr-only'>Actualizar</span>
                  </Button>
                </div>
              </div>
              {(searchTerm || selectedSpecialty || selectedLocation) && (
                <div className='mt-3 flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Filtrando por:
                    {searchTerm && ` "${searchTerm}"`}
                    {selectedSpecialty && ` Especialidad: ${selectedSpecialty}`}
                    {selectedLocation && ` Ubicación: ${selectedLocation}`}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      handleSearch('')
                      handleSpecialtyFilter('')
                      handleLocationFilter('')
                    }}
                    className='h-6 px-2 text-xs'
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <DoctorsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
