'use client'

import { useState } from 'react'
import { Plus, Search, Filter, RefreshCw, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
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
  useSpecialties,
  useSpecialtyStats,
  useDeleteSpecialty,
} from '../hooks/use-specialties'
import { SpecialtyForm } from './specialty-form'
import { SpecialtyCharts } from './specialty-charts'
import type { Specialty } from '../types'

// ===================================
// Componente principal
// ===================================

export function SpecialtiesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [includeDoctorCount, setIncludeDoctorCount] = useState(true)

  // Hooks para datos
  const {
    data: specialtiesData,
    isLoading: isLoadingSpecialties,
    error: specialtiesError,
    refetch: refetchSpecialties,
  } = useSpecialties({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    includeDoctorCount,
  })

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSpecialtyStats()

  const deleteMutation = useDeleteSpecialty()

  // ===================================
  // Handlers
  // ===================================

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCreateNew = () => {
    setSelectedSpecialty(null)
    setShowForm(true)
  }

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setShowForm(true)
  }

  const handleDelete = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedSpecialty) return

    try {
      await deleteMutation.mutateAsync(selectedSpecialty.id)
      setShowDeleteConfirm(false)
      setSelectedSpecialty(null)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedSpecialty(null)
    refetchSpecialties()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedSpecialty(null)
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
      total: stats.total ?? 0,
      withDoctors: stats.withDoctors ?? 0,
      averageDoctorsPerSpecialty: stats.averageDoctorsPerSpecialty ?? 0,
    }

    return (
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-900'>
              Total
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
            <p className='text-xs text-blue-700'>Especialidades totales</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-900'>
              Con Doctores
            </CardTitle>
            <div className='h-8 w-8 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.withDoctors}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {safeStats.withDoctors}
            </div>
            <p className='text-xs text-green-700'>Tienen doctores asignados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 sm:col-span-2 lg:col-span-1'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-900'>
              Promedio
            </CardTitle>
            <div className='h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.averageDoctorsPerSpecialty.toFixed(0)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {safeStats.averageDoctorsPerSpecialty.toFixed(1)}
            </div>
            <p className='text-xs text-purple-700'>Doctores por especialidad</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const SpecialtiesTable = () => {
    if (isLoadingSpecialties) {
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

    if (specialtiesError) {
      return (
        <Card>
          <CardContent className='pt-6'>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar especialidades: {specialtiesError.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (!specialtiesData || specialtiesData.data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Especialidades Médicas</CardTitle>
            <CardDescription>No se encontraron especialidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>
                {searchTerm
                  ? 'No se encontraron especialidades que coincidan con tu búsqueda.'
                  : 'Aún no hay especialidades registradas en el sistema.'}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className='mr-2 h-4 w-4' />
                Crear Primera Especialidad
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Médicas</CardTitle>
          <CardDescription>
            Gestiona las especialidades médicas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          {/* Vista desktop: tabla responsive */}
          <div className='hidden md:block'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-1/4 pl-6'>Nombre</TableHead>
                    <TableHead className='w-2/5'>Descripción</TableHead>
                    <TableHead className='w-[100px] text-center'>
                      Doctores
                    </TableHead>
                    <TableHead className='w-[100px] text-center'>
                      Creada
                    </TableHead>
                    <TableHead className='w-[120px] text-center pr-6'>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialtiesData.data.map((specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className='font-medium pl-6'>
                        <div className='truncate pr-2'>{specialty.name}</div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        <div className='pr-2'>
                          {specialty.description ? (
                            <span
                              className='block truncate'
                              title={specialty.description}
                            >
                              {specialty.description}
                            </span>
                          ) : (
                            <span className='italic text-muted-foreground/70'>
                              Sin descripción
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {specialty.doctorCount}
                        </span>
                      </TableCell>
                      <TableCell className='text-center text-muted-foreground text-xs'>
                        {new Date(specialty.createdAt).toLocaleDateString(
                          'es-ES',
                          { day: '2-digit', month: '2-digit', year: '2-digit' }
                        )}
                      </TableCell>
                      <TableCell className='pr-6'>
                        <div className='flex justify-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(specialty)}
                            className='h-7 w-7 p-0'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(specialty)}
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
            {specialtiesData.data.map((specialty) => (
              <Card key={specialty.id} className='border-l-4 border-l-blue-500'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-medium text-lg leading-tight'>
                        {specialty.name}
                      </h3>
                      {specialty.description && (
                        <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                          {specialty.description}
                        </p>
                      )}
                    </div>
                    <div className='ml-3 flex space-x-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(specialty)}
                        className='h-8 w-8 p-0'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(specialty)}
                        className='h-8 w-8 p-0'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center space-x-2'>
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        {specialty.doctorCount} doctores
                      </span>
                    </div>
                    <span className='text-muted-foreground text-xs'>
                      {new Date(specialty.createdAt).toLocaleDateString(
                        'es-ES',
                        { day: '2-digit', month: '2-digit', year: '2-digit' }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {specialtiesData.meta.totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 px-6 border-t bg-gray-50/50'>
              <div className='text-sm text-muted-foreground order-2 sm:order-1'>
                Página {specialtiesData.meta.page} de{' '}
                {specialtiesData.meta.totalPages} ({specialtiesData.meta.total}{' '}
                total)
              </div>
              <div className='flex space-x-2 order-1 sm:order-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!specialtiesData.meta.hasPreviousPage}
                  className='px-3'
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!specialtiesData.meta.hasNextPage}
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
            {selectedSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h1>
          <Button variant='outline' onClick={handleFormCancel}>
            Volver
          </Button>
        </div>
        <SpecialtyForm
          specialty={selectedSpecialty}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  if (showDeleteConfirm && selectedSpecialty) {
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
              especialidad {selectedSpecialty.name} del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {selectedSpecialty.doctorCount > 0 && (
              <Alert variant='destructive'>
                <AlertDescription>
                  <strong>Advertencia:</strong> Esta especialidad tiene{' '}
                  {selectedSpecialty.doctorCount} doctor(es) asignado(s).
                </AlertDescription>
              </Alert>
            )}
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
            Especialidades Médicas
          </h1>
          <p className='text-muted-foreground'>
            Gestiona las especialidades médicas disponibles en el sistema
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className='mr-2 h-4 w-4' />
          Nueva Especialidad
        </Button>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='specialties'>Especialidades</TabsTrigger>
          <TabsTrigger value='analytics'>📊 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <StatsCards />
        </TabsContent>

        <TabsContent value='specialties' className='space-y-6'>
          {/* Barra de búsqueda y filtros */}
          <Card className='bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <div className='relative flex-1 min-w-0'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Buscar especialidades por nombre...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <Button
                    variant={includeDoctorCount ? 'default' : 'outline'}
                    onClick={() => setIncludeDoctorCount(!includeDoctorCount)}
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <Filter className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>
                      {includeDoctorCount ? 'Con Conteo' : 'Sin Conteo'}
                    </span>
                    <span className='sm:hidden'>
                      {includeDoctorCount ? 'Conteo' : 'Simple'}
                    </span>
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => refetchSpecialties()}
                    className='h-10'
                    size='sm'
                  >
                    <RefreshCw className='h-4 w-4' />
                    <span className='sr-only'>Actualizar</span>
                  </Button>
                </div>
              </div>
              {searchTerm && (
                <div className='mt-3 flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Filtrando por: &ldquo;{searchTerm}&rdquo;
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleSearch('')}
                    className='h-6 px-2 text-xs'
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <SpecialtiesTable />
        </TabsContent>

        <TabsContent value='analytics'>
          <SpecialtyCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
