'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Pill,
  User,
  Calendar,
  Clock,
  FileText,
  Download,
  X,
  Stethoscope,
  CalendarDays,
} from 'lucide-react'
import {
  Prescription,
  getPrescriptionStatusText,
  getPrescriptionStatusColor,
} from '../types'
import {
  getCategoryText,
  getPriorityText,
  MedicalRecordCategory,
  Priority,
} from '@/features/medical-records/types'
import { useDownloadPrescriptionPdf } from '../hooks/use-prescriptions'

interface PrescriptionDetailsProps {
  isOpen: boolean
  onClose: () => void
  prescription: Prescription | null
  onEdit?: () => void
}

export function PrescriptionDetails({
  isOpen,
  onClose,
  prescription,
  onEdit,
}: PrescriptionDetailsProps) {
  const downloadMutation = useDownloadPrescriptionPdf()

  if (!prescription) {
    return null
  }

  const handleDownloadPdf = async () => {
    downloadMutation.mutate(prescription.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Pill className='h-5 w-5' />
            Detalles de Prescripción
          </DialogTitle>
          <DialogDescription>
            Información completa de la prescripción médica
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Información General</CardTitle>
                <Badge
                  className={getPrescriptionStatusColor(prescription.status)}
                >
                  {getPrescriptionStatusText(prescription.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    ID de Prescripción
                  </label>
                  <p className='font-mono text-sm'>{prescription.id}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Válida Hasta
                  </label>
                  <p className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    {new Date(prescription.validUntil).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Fecha de Creación
                  </label>
                  <p className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    {new Date(prescription.createdAt).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Última Actualización
                  </label>
                  <p className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    {new Date(prescription.updatedAt).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          {prescription.patient && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Nombre Completo
                    </label>
                    <p className='font-medium'>
                      {prescription.patient.firstName}{' '}
                      {prescription.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Email
                    </label>
                    <p>{prescription.patient.email || 'No especificado'}</p>
                  </div>
                  {prescription.patient.patientProfile && (
                    <>
                      {prescription.patient.patientProfile.birthDate && (
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Fecha de Nacimiento
                          </label>
                          <p>
                            {new Date(
                              prescription.patient.patientProfile.birthDate
                            ).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}
                      {prescription.patient.patientProfile.gender && (
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Género
                          </label>
                          <p>{prescription.patient.patientProfile.gender}</p>
                        </div>
                      )}
                      {prescription.patient.patientProfile.bloodType && (
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Tipo de Sangre
                          </label>
                          <p>{prescription.patient.patientProfile.bloodType}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Information */}
          {prescription.doctor && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Stethoscope className='h-5 w-5' />
                  Información del Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Nombre Completo
                    </label>
                    <p className='font-medium'>
                      {prescription.doctor.firstName}{' '}
                      {prescription.doctor.lastName}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Email
                    </label>
                    <p className='break-all text-sm'>
                      {prescription.doctor.email}
                    </p>
                  </div>
                  {prescription.doctor.doctorProfile && (
                    <>
                      {prescription.doctor.doctorProfile.license && (
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Licencia Médica
                          </label>
                          <p className='font-mono'>
                            {prescription.doctor.doctorProfile.license}
                          </p>
                        </div>
                      )}
                      {prescription.doctor.doctorProfile.specialties &&
                        prescription.doctor.doctorProfile.specialties.length >
                          0 && (
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Especialidades
                            </label>
                            <div className='flex flex-wrap gap-2 mt-1'>
                              {prescription.doctor.doctorProfile.specialties.map(
                                (spec, index) => (
                                  <Badge key={index} variant='outline'>
                                    {spec.specialty.name}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Record Information */}
          {prescription.medicalRecord && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Historial Médico Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Fecha del Registro
                    </label>
                    <p>
                      {new Date(
                        prescription.medicalRecord.date
                      ).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Diagnóstico
                    </label>
                    <p>{prescription.medicalRecord.diagnosis}</p>
                  </div>
                  {prescription.medicalRecord.category && (
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        Categoría
                      </label>
                      <p>
                        {getCategoryText(
                          prescription.medicalRecord
                            .category as MedicalRecordCategory
                        )}
                      </p>
                    </div>
                  )}
                  {prescription.medicalRecord.priority && (
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        Prioridad
                      </label>
                      <p>
                        {getPriorityText(
                          prescription.medicalRecord.priority as Priority
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Information */}
          {prescription.appointment && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CalendarDays className='h-5 w-5' />
                  Cita Relacionada
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Fecha de la Cita
                    </label>
                    <p>
                      {new Date(
                        prescription.appointment.date
                      ).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Tipo de Cita
                    </label>
                    <p>{prescription.appointment.type}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Estado de la Cita
                    </label>
                    <p>{prescription.appointment.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Pill className='h-5 w-5' />
                Medicamentos Prescritos ({prescription.medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {prescription.medications.map(
                  (prescriptionMedication, index) => (
                    <div key={index} className='border rounded-lg p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-medium text-lg'>
                            {prescriptionMedication.medicineName}
                          </h4>
                          {prescriptionMedication.concentration && (
                            <p className='text-sm text-gray-600 mt-1'>
                              {prescriptionMedication.concentration}
                              {prescriptionMedication.form &&
                                ` - ${prescriptionMedication.form}`}
                            </p>
                          )}
                        </div>
                        {prescriptionMedication.quantity && (
                          <Badge variant='outline'>
                            Cantidad: {prescriptionMedication.quantity}
                          </Badge>
                        )}
                      </div>

                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4'>
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Dosis
                          </label>
                          <p>{prescriptionMedication.dosage}</p>
                        </div>
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Frecuencia
                          </label>
                          <p>{prescriptionMedication.frequency}</p>
                        </div>
                        <div>
                          <label className='text-sm font-medium text-gray-500'>
                            Duración
                          </label>
                          <p>{prescriptionMedication.duration}</p>
                        </div>
                        {prescriptionMedication.form && (
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Forma
                            </label>
                            <p>{prescriptionMedication.form}</p>
                          </div>
                        )}
                      </div>

                      {prescriptionMedication.instructions && (
                        <div className='mb-4'>
                          <label className='text-sm font-medium text-gray-500'>
                            Instrucciones Especiales
                          </label>
                          <p className='mt-1 p-3 bg-gray-50 rounded border'>
                            {prescriptionMedication.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {prescription.notes && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='p-4 bg-gray-50 rounded border'>
                  <p className='whitespace-pre-wrap'>{prescription.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onClose}>
            <X className='h-4 w-4 mr-2' />
            Cerrar
          </Button>

          <Button variant='outline' onClick={handleDownloadPdf}>
            <Download className='h-4 w-4 mr-2' />
            Descargar PDF
          </Button>

          {onEdit && (
            <Button onClick={onEdit}>
              <FileText className='h-4 w-4 mr-2' />
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
