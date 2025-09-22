'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Filter, Activity, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { usePrescriptions } from '../hooks/use-prescriptions'
import { usePatients } from '../../medical-records/hooks/use-patients'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import { useDebounce } from '@/hooks/use-debounce'
import { PrescriptionsTable } from './prescriptions-table'
import { PrescriptionForm } from './prescription-form'
import { PrescriptionDetails } from './prescription-details'
import { PrescriptionsSkeleton } from './prescriptions-skeleton'

import type { PrescriptionFilters, Prescription } from '../types'

interface PrescriptionsManagementProps {
  initialFilters?: Partial<PrescriptionFilters>
  showCreateButton?: boolean
  doctorId?: string
  patientId?: string
}

export function PrescriptionsManagement({
  initialFilters = {},
  showCreateButton = true,
  doctorId,
  patientId,
}: PrescriptionsManagementProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const isAdmin = user?.roles.includes(UserRole.ADMIN)

  // Solo los doctores pueden crear prescripciones, no los administradores
  const canCreatePrescription = isDoctor && !isAdmin

  const [filters, setFilters] = useState<PrescriptionFilters>({
    page: 1,
    pageSize: 10,
    status: 'ALL',
    search: '',
    ...initialFilters,
    ...(doctorId && { doctorId }),
    ...(patientId && { patientId }),
  })

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Aplicar debounce a la búsqueda
  const debouncedSearch = useDebounce(searchInput, 500)

  // Efecto para resetear página cuando cambia la búsqueda
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({
        ...prev,
        search: debouncedSearch,
        page: 1, // Reset page when searching
      }))
    }
  }, [debouncedSearch, filters.search])

  // Pacientes para filtro (solo para doctores)
  const { data: patientsData } = usePatients({
    search: '',
    limit: 100, // Cargar muchos pacientes para el dropdown
  })

  // Query parameters
  const queryParams = useMemo(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      status: filters.status !== 'ALL' ? filters.status : undefined,
      doctorId: filters.doctorId,
      patientId:
        filters.patientId && filters.patientId !== 'ALL_PATIENTS'
          ? filters.patientId
          : undefined,
      medicalRecordId: filters.medicalRecordId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: debouncedSearch, // Usar búsqueda con debounce
    }),
    [filters, debouncedSearch] // Dependencia en debouncedSearch en lugar de filters.search
  )

  // Data fetching with React Query
  const {
    data: prescriptionsData,
    isLoading: loading,
    error,
    refetch,
  } = usePrescriptions(queryParams)

  // Force refetch when query params change
  useEffect(() => {
    refetch()
  }, [queryParams, refetch])

  const prescriptions = prescriptionsData?.data || []
  const pagination = {
    page: prescriptionsData?.meta?.page || 1,
    pageSize: prescriptionsData?.meta?.limit || 10,
    total: prescriptionsData?.meta?.total || 0,
    totalPages: prescriptionsData?.meta?.totalPages || 0,
  }

  const handleFilterChange = (
    key: keyof PrescriptionFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when changing filters
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      status: 'ALL',
      search: '',
      ...(doctorId && { doctorId }),
      ...(patientId && { patientId }),
    })
    setSearchInput('')
  }

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailsDialog(true)
  }

  const handleEditPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowEditDialog(true)
  }

  if (loading && prescriptions.length === 0) {
    return <PrescriptionsSkeleton />
  }

  return (
    <div className='space-y-6 pb-12'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Recetas Médicas</h1>
          <p className='text-muted-foreground'>
            Gestiona las recetas médicas y medicamentos
          </p>
        </div>
        {showCreateButton && canCreatePrescription && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                Nueva Prescripción
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Crear Nueva Prescripción</DialogTitle>
                <DialogDescription>
                  Complete la información de la prescripción médica
                </DialogDescription>
              </DialogHeader>
              <PrescriptionForm
                isOpen={true}
                onClose={() => setShowCreateDialog(false)}
                selectedPatientId={patientId}
                medicalRecordId={undefined}
                onSuccess={() => {
                  setShowCreateDialog(false)
                  // Force refetch to ensure UI is updated
                  // The mutation already invalidates queries, but we can force a refetch for extra safety
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-lg'>
            <Filter className='w-5 h-5 mr-2' />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Búsqueda
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                {searchInput !== debouncedSearch && (
                  <Loader2 className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin' />
                )}
                <Input
                  placeholder='Buscar por paciente, medicamento, diagnóstico...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className='pl-10 pr-10'
                />
              </div>
            </div>

            {/* Patient Filter - Only for doctors */}
            {isDoctor && (
              <div>
                <label className='text-sm font-medium text-gray-700 mb-1 block'>
                  Paciente
                </label>
                <Select
                  value={filters.patientId || ''}
                  onValueChange={(value) =>
                    handleFilterChange('patientId', value)
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

            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Estado
              </label>
              <Select
                value={filters.status || 'ALL'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Todos los estados</SelectItem>
                  <SelectItem value='ACTIVE'>Activa</SelectItem>
                  <SelectItem value='COMPLETED'>Completada</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelada</SelectItem>
                  <SelectItem value='EXPIRED'>Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Elementos por página
              </label>
              <Select
                value={filters.pageSize?.toString() || '10'}
                onValueChange={(value) =>
                  handleFilterChange('pageSize', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5 por página</SelectItem>
                  <SelectItem value='10'>10 por página</SelectItem>
                  <SelectItem value='20'>20 por página</SelectItem>
                  <SelectItem value='50'>50 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Fecha Inicio
              </label>
              <Input
                type='date'
                value={filters.startDate || ''}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Fecha Fin
              </label>
              <Input
                type='date'
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Clear filters button */}
          <div className='flex justify-end mt-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleClearFilters}
              className='flex items-center gap-2'
            >
              <X className='w-4 h-4' />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-red-600'>
              <Activity className='h-4 w-4' />
              <p>Error al cargar las prescripciones: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions Table */}
      <PrescriptionsTable
        prescriptions={prescriptions}
        loading={loading}
        onView={handleViewDetails}
        onEdit={handleEditPrescription}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}{' '}
                de {pagination.total} prescripciones
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className='text-sm'>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <PrescriptionDetails
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        prescription={selectedPrescription}
        onEdit={() => {
          setShowDetailsDialog(false)
          setShowEditDialog(true)
        }}
      />

      {/* Edit Dialog */}
      {selectedPrescription && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Editar Prescripción</DialogTitle>
              <DialogDescription>
                Modifica la información de la prescripción médica
              </DialogDescription>
            </DialogHeader>
            <PrescriptionForm
              isOpen={true}
              onClose={() => setShowEditDialog(false)}
              prescription={selectedPrescription}
              selectedPatientId={selectedPrescription.patientId}
              medicalRecordId={selectedPrescription.medicalRecordId}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedPrescription(null)
                // Force refetch to ensure UI is updated
                // The mutation already invalidates queries, but we can force a refetch for extra safety
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
