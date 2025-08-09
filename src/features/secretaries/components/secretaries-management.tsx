'use client'

import { useState } from 'react'
import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  UserPlus,
  Power,
  PowerOff,
  Users,
  Briefcase,
} from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useSecretaries,
  useSecretaryStats,
  useDeleteSecretary,
  useToggleSecretaryStatus,
} from '../hooks/use-secretaries'
import { SecretaryForm } from './secretary-form'
import type { Secretary } from '../types'

// Importar componentes de gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ===================================
// Componente principal
// ===================================

export function SecretariesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null)
  const [includeDoctors] = useState(true)

  // Recuperar el tab activo del localStorage al inicializar
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('secretaries-management-tab') || 'overview'
  })

  // Hooks para datos
  const {
    data: secretariesData,
    isLoading: isLoadingSecretaries,
    error: secretariesError,
    refetch: refetchSecretaries,
  } = useSecretaries({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    isActive: selectedStatus ?? undefined,
    includeDoctors,
  })

  // Hook real para estadísticas de secretarias
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSecretaryStats()

  const deleteMutation = useDeleteSecretary()
  const toggleStatusMutation = useToggleSecretaryStatus()

  // ===================================
  // Handlers
  // ===================================

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: boolean | null) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleCreateNew = () => {
    setSelectedSecretary(null)
    setShowForm(true)
  }

  const handleEdit = (secretary: Secretary) => {
    setSelectedSecretary(secretary)
    setShowForm(true)
  }

  const handleDelete = (secretary: Secretary) => {
    setSelectedSecretary(secretary)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedSecretary) return

    try {
      await deleteMutation.mutateAsync(selectedSecretary.id)
      setShowDeleteConfirm(false)
      setSelectedSecretary(null)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleToggleStatus = async (secretary: Secretary) => {
    try {
      await toggleStatusMutation.mutateAsync(secretary.id)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedSecretary(null)
    refetchSecretaries()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedSecretary(null)
  }

  const handleTabChange = (tab: string) => {
    // Guardar el tab activo en localStorage
    setActiveTab(tab)
    localStorage.setItem('secretaries-management-tab', tab)
  }

  // ===================================
  // Componentes internos
  // ===================================

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

    // Asegurar valores por defecto para evitar errores
    const safeStats = {
      total: stats.data?.total ?? 0,
      active: stats.data?.active ?? 0,
      withAssignedDoctors: stats.data?.withAssignedDoctors ?? 0,
      averageDoctorsPerSecretary: stats.data?.averageDoctorsPerSecretary ?? 0,
      totalAssignments: stats.data?.totalAssignments ?? 0,
    }

    return (
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-900'>
              Total Secretarias
            </CardTitle>
            <div className='h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <Users className='h-4 w-4 text-white' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {safeStats.total}
            </div>
            <p className='text-xs text-blue-700'>Secretarias registradas</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-900'>
              Activas
            </CardTitle>
            <div className='h-8 w-8 bg-green-500 rounded-full flex items-center justify-center'>
              <Power className='h-4 w-4 text-white' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {safeStats.active}
            </div>
            <p className='text-xs text-green-700'>Secretarias activas</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-900'>
              Con Doctores
            </CardTitle>
            <div className='h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center'>
              <Briefcase className='h-4 w-4 text-white' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {safeStats.withAssignedDoctors}
            </div>
            <p className='text-xs text-purple-700'>Con doctores asignados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-orange-900'>
              Promedio Doctores
            </CardTitle>
            <div className='h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.averageDoctorsPerSecretary.toFixed(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-900'>
              {safeStats.averageDoctorsPerSecretary.toFixed(1)}
            </div>
            <p className='text-xs text-orange-700'>Doctores por secretaria</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ===================================
  // Componentes de Gráficos
  // ===================================

  const StatusDistributionChart = () => {
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

    // Preparar datos para el gráfico de estado de secretarias
    const statusData = [
      {
        name: 'Activas',
        value: stats.data?.active || 0,
        color: '#10b981', // green-500
      },
      {
        name: 'Inactivas',
        value: (stats.data?.total || 0) - (stats.data?.active || 0),
        color: '#6b7280', // gray-500
      },
    ].filter((item) => item.value > 0)

    if (statusData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Secretarias</CardTitle>
            <CardDescription>Secretarias activas vs inactivas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              No hay datos disponibles
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Secretarias</CardTitle>
          <CardDescription>Secretarias activas vs inactivas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Secretarias']} />
              <Bar dataKey='value' fill='#3b82f6' name='Secretarias' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const AssignmentDistributionChart = () => {
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

    // Preparar datos para el gráfico de distribución de asignaciones
    const assignmentData = [
      {
        name: 'Con Doctores',
        value: stats.data?.withAssignedDoctors || 0,
        color: '#3b82f6', // blue-500
      },
      {
        name: 'Sin Doctores',
        value:
          (stats.data?.total || 0) - (stats.data?.withAssignedDoctors || 0),
        color: '#e5e7eb', // gray-200
      },
    ].filter((item) => item.value > 0)

    if (assignmentData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Asignación de Doctores</CardTitle>
            <CardDescription>
              Secretarias con y sin doctores asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              No hay secretarias registradas
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Asignación de Doctores</CardTitle>
          <CardDescription>
            Secretarias con y sin doctores asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={assignmentData}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                }
              >
                {assignmentData.map((entry, index) => (
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

  const SecretariesTable = () => {
    if (isLoadingSecretaries) {
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

    if (secretariesError) {
      return (
        <Card>
          <CardContent className='pt-6'>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar secretarias: {secretariesError.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (!secretariesData?.data || secretariesData.data.data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Secretarias del Sistema</CardTitle>
            <CardDescription>No se encontraron secretarias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || selectedStatus !== null
                  ? 'No se encontraron secretarias que coincidan con los filtros.'
                  : 'Aún no hay secretarias registradas en el sistema.'}
              </p>
              <Button onClick={handleCreateNew}>
                <UserPlus className='mr-2 h-4 w-4' />
                Crear Primera Secretaria
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Secretarias del Sistema</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {/* Vista desktop: tabla responsive */}
          <div className='hidden md:block'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-1/4 pl-6'>Secretaria</TableHead>
                    <TableHead className='w-1/6'>Doctores Asignados</TableHead>
                    <TableHead className='w-1/6'>Estado</TableHead>
                    <TableHead className='w-1/6'>Activar/Desactivar</TableHead>
                    <TableHead className='w-1/6'>Fecha Registro</TableHead>
                    <TableHead className='w-[100px] text-center pr-6'>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secretariesData.data?.data.map((secretary: Secretary) => (
                    <TableRow key={secretary.id}>
                      <TableCell className='font-medium pl-6'>
                        <div className='flex flex-col'>
                          <div className='font-medium'>
                            {secretary.firstName} {secretary.lastName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {secretary.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {secretary.assignedDoctors?.length > 0 ? (
                            secretary.assignedDoctors.map((assignment) => (
                              <Badge
                                key={assignment.id}
                                variant='outline'
                                className='text-xs'
                              >
                                {assignment.name}
                              </Badge>
                            ))
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              Sin doctores asignados
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={secretary.isActive ? 'default' : 'secondary'}
                        >
                          {secretary.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Button
                          variant={secretary.isActive ? 'outline' : 'default'}
                          size='sm'
                          onClick={() => handleToggleStatus(secretary)}
                          className='h-8 px-3'
                          disabled={toggleStatusMutation.isPending}
                        >
                          {toggleStatusMutation.isPending ? (
                            <RefreshCw className='h-4 w-4 animate-spin' />
                          ) : secretary.isActive ? (
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
                        {new Date(secretary.createdAt).toLocaleDateString(
                          'es-ES',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )}
                      </TableCell>
                      <TableCell className='pr-6'>
                        <div className='flex justify-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(secretary)}
                            className='h-7 w-7 p-0'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(secretary)}
                            className='h-7 w-7 p-0'
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
            {secretariesData.data?.data.map((secretary: Secretary) => (
              <Card key={secretary.id} className='border-l-4 border-l-blue-500'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-medium text-lg leading-tight'>
                        {secretary.firstName} {secretary.lastName}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {secretary.email}
                      </p>
                    </div>
                    <div className='ml-3 flex space-x-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(secretary)}
                        className='h-8 w-8 p-0'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(secretary)}
                        className='h-8 w-8 p-0'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <p className='text-sm font-medium mb-1'>
                      Doctores Asignados:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {secretary.assignedDoctors?.length > 0 ? (
                        secretary.assignedDoctors.map((assignment) => (
                          <Badge
                            key={assignment.id}
                            variant='outline'
                            className='text-xs'
                          >
                            {assignment.name}
                          </Badge>
                        ))
                      ) : (
                        <span className='text-sm text-muted-foreground'>
                          Sin doctores asignados
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-sm mb-3'>
                    <Badge
                      variant={secretary.isActive ? 'default' : 'secondary'}
                    >
                      {secretary.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      Registrada:{' '}
                      {new Date(secretary.createdAt).toLocaleDateString(
                        'es-ES',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        }
                      )}
                    </span>
                  </div>

                  {/* Toggle de estado en móvil */}
                  <div className='mt-3 flex justify-center'>
                    <Button
                      variant={secretary.isActive ? 'outline' : 'default'}
                      size='sm'
                      onClick={() => handleToggleStatus(secretary)}
                      className='w-full'
                      disabled={toggleStatusMutation.isPending}
                    >
                      {toggleStatusMutation.isPending ? (
                        <RefreshCw className='h-4 w-4 animate-spin' />
                      ) : secretary.isActive ? (
                        <>
                          <PowerOff className='h-4 w-4 mr-1' />
                          Desactivar Secretaria
                        </>
                      ) : (
                        <>
                          <Power className='h-4 w-4 mr-1' />
                          Activar Secretaria
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {secretariesData.data?.meta.totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 px-6 border-t bg-gray-50/50'>
              <div className='text-sm text-muted-foreground order-2 sm:order-1'>
                Página {secretariesData.data.meta.page} de{' '}
                {secretariesData.data.meta.totalPages} (
                {secretariesData.data.meta.total} total)
              </div>
              <div className='flex space-x-2 order-1 sm:order-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!secretariesData.data.meta.hasPreviousPage}
                  className='px-3'
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!secretariesData.data.meta.hasNextPage}
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

  // ===================================
  // Render principal
  // ===================================

  if (showForm) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {selectedSecretary ? 'Editar Secretaria' : 'Nueva Secretaria'}
          </h1>
          <Button variant='outline' onClick={handleFormCancel}>
            Volver
          </Button>
        </div>
        <SecretaryForm
          secretary={selectedSecretary}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  if (showDeleteConfirm && selectedSecretary) {
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              secretaria {selectedSecretary.firstName}{' '}
              {selectedSecretary.lastName} del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert variant='destructive'>
              <AlertDescription>
                <strong>Advertencia:</strong> Esta acción eliminará
                permanentemente la secretaria y todas sus asignaciones de
                doctores.
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
            Gestión de Secretarias
          </h1>
          <p className='text-muted-foreground'>
            Administra las secretarias del sistema y sus asignaciones de
            doctores
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <UserPlus className='mr-2 h-4 w-4' />
          Nueva Secretaria
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='secretaries'>Secretarias</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='space-y-6'>
            <StatsCards />

            {/* Gráficos */}
            <div className='grid gap-6 md:grid-cols-2'>
              <StatusDistributionChart />
              <AssignmentDistributionChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='secretaries' className='space-y-6 pb-4'>
          {/* Barra de búsqueda y filtros */}
          <Card className='bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <div className='relative flex-1 min-w-0'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Buscar secretarias por nombre o email...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <Button
                    variant={selectedStatus === true ? 'default' : 'outline'}
                    onClick={() =>
                      handleStatusFilter(selectedStatus === true ? null : true)
                    }
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <Power className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Activas</span>
                    <span className='sm:hidden'>Act</span>
                  </Button>
                  <Button
                    variant={selectedStatus === false ? 'default' : 'outline'}
                    onClick={() =>
                      handleStatusFilter(
                        selectedStatus === false ? null : false
                      )
                    }
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <PowerOff className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Inactivas</span>
                    <span className='sm:hidden'>Inact</span>
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => refetchSecretaries()}
                    className='h-10'
                    size='sm'
                  >
                    <RefreshCw className='h-4 w-4' />
                    <span className='sr-only'>Actualizar</span>
                  </Button>
                </div>
              </div>
              {(searchTerm || selectedStatus !== null) && (
                <div className='mt-3 flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Filtrando por:
                    {searchTerm && ` "${searchTerm}"`}
                    {selectedStatus !== null &&
                      ` Estado: ${selectedStatus ? 'Activas' : 'Inactivas'}`}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      handleSearch('')
                      handleStatusFilter(null)
                    }}
                    className='h-6 px-2 text-xs'
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <SecretariesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
