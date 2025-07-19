'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Activity,
  CheckCircle,
} from 'lucide-react'
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
import {
  usePrescriptions,
  useDeletePrescription,
} from '../hooks/use-prescriptions'
import { PrescriptionsTable } from './prescriptions-table'
import { PrescriptionForm } from './prescription-form'
import { PrescriptionDetails } from './prescription-details'
import { PrescriptionsSkeleton } from './prescriptions-skeleton'
import { PrescriptionStatus } from '../types'
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

  // Query parameters
  const queryParams = {
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    doctorId: filters.doctorId,
    patientId: filters.patientId,
    medicalRecordId: filters.medicalRecordId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
  }

  // Data fetching with React Query
  const {
    data: prescriptionsData,
    isLoading: loading,
    error,
  } = usePrescriptions(queryParams)
  const deleteMutation = useDeletePrescription()

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

  const handleDeletePrescription = async (prescription: Prescription) => {
    deleteMutation.mutate(prescription.id)
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
          <h1 className='text-2xl font-bold tracking-tight'>Prescripciones</h1>
          <p className='text-muted-foreground'>
            Gestiona las prescripciones médicas y medicamentos
          </p>
        </div>
        {showCreateButton && (
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
                <Input
                  placeholder='Buscar prescripciones...'
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

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
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <p className='text-red-600 text-sm'>{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <FileText className='w-6 h-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {pagination.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-yellow-100 rounded-lg'>
                <Clock className='w-6 h-6 text-yellow-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pendientes</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {
                    prescriptions.filter(
                      (p) => p.status === PrescriptionStatus.ACTIVE
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <Activity className='w-6 h-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Activas</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {
                    prescriptions.filter(
                      (p) => p.status === PrescriptionStatus.ACTIVE
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <CheckCircle className='w-6 h-6 text-purple-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Completadas</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {
                    prescriptions.filter(
                      (p) => p.status === PrescriptionStatus.COMPLETED
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className='space-y-6 pb-8'>
        <PrescriptionsTable
          prescriptions={prescriptions}
          loading={loading}
          onView={handleViewDetails}
          onEdit={handleEditPrescription}
          onDelete={handleDeletePrescription}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='flex items-center justify-between border-t pt-6 mt-6'>
            <p className='text-sm text-muted-foreground'>
              Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{' '}
              de {pagination.total} resultados
            </p>

            <div className='flex items-center gap-2'>
              {/* Previous button */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>

              {/* Page numbers - simplified for better performance */}
              <div className='flex items-center gap-1'>
                {/* Show current page info */}
                <span className='px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md'>
                  {pagination.page}
                </span>
                <span className='text-sm text-muted-foreground'>
                  de {pagination.totalPages}
                </span>
              </div>

              {/* Next button */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
              </Button>

              {/* Quick jump to page */}
              {pagination.totalPages > 5 && (
                <div className='flex items-center gap-2 ml-4 border-l pl-4'>
                  <span className='text-sm text-muted-foreground'>
                    Ir a página:
                  </span>
                  <Select
                    value={pagination.page.toString()}
                    onValueChange={(value) => handlePageChange(parseInt(value))}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Detalles de la Prescripción</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionDetails
              isOpen={true}
              onClose={() => setShowDetailsDialog(false)}
              prescription={selectedPrescription}
              onEdit={() => {
                setShowDetailsDialog(false)
                setShowEditDialog(true)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Editar Prescripción</DialogTitle>
            <DialogDescription>
              Modifique la información de la prescripción médica
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionForm
              isOpen={true}
              onClose={() => {
                setShowEditDialog(false)
                setSelectedPrescription(null)
              }}
              prescription={selectedPrescription}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedPrescription(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
