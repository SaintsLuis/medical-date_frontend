'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { MoreHorizontal, Eye, Edit, Download, AlertCircle } from 'lucide-react'
import {
  Prescription,
  getPrescriptionStatusText,
  getPrescriptionStatusColor,
} from '../types'
import { useDownloadPrescriptionPdf } from '../hooks/use-prescriptions'

interface PrescriptionsTableProps {
  prescriptions: Prescription[]
  loading?: boolean
  onView: (prescription: Prescription) => void
  onEdit: (prescription: Prescription) => void
}

export function PrescriptionsTable({
  prescriptions,
  loading = false,
  onView,
  onEdit,
}: PrescriptionsTableProps) {
  const downloadMutation = useDownloadPrescriptionPdf()

  const handleDownload = async (prescription: Prescription) => {
    downloadMutation.mutate(prescription.id)
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-12 bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className='p-8 text-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='p-4 bg-gray-100 rounded-full'>
              <AlertCircle className='h-8 w-8 text-gray-400' />
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                No hay prescripciones
              </h3>
              <p className='text-gray-500'>
                No se encontraron prescripciones con los filtros aplicados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescripciones ({prescriptions.length})</CardTitle>
      </CardHeader>
      <CardContent className='pb-8'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Medicamentos</TableHead>
                <TableHead>Válida Hasta</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id} className='hover:bg-gray-50'>
                  <TableCell>
                    <div>
                      <p className='font-medium'>
                        {prescription.patient
                          ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
                          : 'Paciente no encontrado'}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {prescription.patient?.email || 'Sin email'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className={getPrescriptionStatusColor(
                          prescription.status
                        )}
                      >
                        {getPrescriptionStatusText(prescription.status)}
                      </Badge>
                      {isExpired(prescription.validUntil) && (
                        <Badge variant='destructive' className='text-xs'>
                          Vencida
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className='font-medium'>
                        {prescription.medications.length} medicamento
                        {prescription.medications.length !== 1 ? 's' : ''}
                      </p>
                      {prescription.medications.length > 0 && (
                        <p className='text-sm text-gray-500'>
                          {prescription.medications[0].medicineName}
                          {prescription.medications.length > 1 &&
                            ` +${prescription.medications.length - 1} más`}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p
                        className={`text-sm ${
                          isExpired(prescription.validUntil)
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        {new Date(prescription.validUntil).toLocaleDateString(
                          'es-ES',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </p>
                      {isExpired(prescription.validUntil) && (
                        <p className='text-xs text-red-500'>Vencida</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className='text-sm'>
                      {new Date(prescription.createdAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </TableCell>

                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Abrir menú</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onView(prescription)}>
                          <Eye className='mr-2 h-4 w-4' />
                          Ver detalles
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDownload(prescription)}
                        >
                          <Download className='mr-2 h-4 w-4' />
                          Descargar PDF
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => onEdit(prescription)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
