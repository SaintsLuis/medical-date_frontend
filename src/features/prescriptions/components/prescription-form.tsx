'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pill, FileText, Clock, Save, X, Plus, Minus } from 'lucide-react'
import {
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionStatus,
  getPrescriptionStatusText,
} from '../types'
import {
  useCreatePrescription,
  useUpdatePrescription,
} from '../hooks/use-prescriptions'
import {
  usePatients,
  PatientResponseDto,
} from '@/features/medical-records/hooks/use-patients'
import { usePatientMedicalRecordsByUserId } from '@/features/medical-records/hooks/use-medical-records'
import { useAuthStore } from '@/features/auth/store/auth'
import { cn } from '@/lib/utils'

interface PrescriptionFormProps {
  isOpen: boolean
  onClose: () => void
  prescription?: Prescription
  selectedPatientId?: string
  medicalRecordId?: string
  onSuccess?: () => void
}

// Nuevo modelo para medicamentos de texto libre - estilo dominicano
interface MedicationForm {
  medicineName: string
  concentration: string
  form: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: string
}

export function PrescriptionForm({
  isOpen,
  onClose,
  prescription,
  selectedPatientId: propSelectedPatientId,
  medicalRecordId,
  onSuccess,
}: PrescriptionFormProps) {
  const createMutation = useCreatePrescription()
  const updateMutation = useUpdatePrescription()
  const loading = createMutation.isPending || updateMutation.isPending

  // Auth store para obtener el doctor logueado
  const { user } = useAuthStore()

  // Obtener datos necesarios
  const { data: patientsData } = usePatients()

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    propSelectedPatientId || ''
  )

  // Encontrar el paciente seleccionado para obtener su patientProfileId
  const selectedPatient = patientsData?.data?.find(
    (patient: PatientResponseDto) => patient.user.id === selectedPatientId
  )

  const { data: medicalRecordsData, isLoading: medicalRecordsLoading } =
    usePatientMedicalRecordsByUserId(selectedPatientId, {}, !!selectedPatientId)

  const [formData, setFormData] = useState({
    medicalRecordId: '',
    doctorId: '',
    patientId: '',
    status: PrescriptionStatus.ACTIVE,
    validUntil: '',
    notes: '',
    appointmentId: '',
  })

  const [medications, setMedications] = useState<MedicationForm[]>([
    {
      medicineName: '',
      concentration: '',
      form: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: '',
    },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (prescription) {
        setFormData({
          medicalRecordId: prescription.medicalRecordId,
          doctorId: prescription.doctorId,
          patientId: prescription.patientId,
          status: prescription.status,
          validUntil: prescription.validUntil.split('T')[0],
          notes: prescription.notes || '',
          appointmentId: prescription.appointmentId || '',
        })

        setMedications(
          prescription.medications.map((pm) => ({
            medicineName: pm.medicineName,
            concentration: pm.concentration || '',
            form: pm.form || '',
            dosage: pm.dosage,
            frequency: pm.frequency,
            duration: pm.duration,
            instructions: pm.instructions || '',
            quantity: pm.quantity || '',
          }))
        )
      } else {
        setFormData({
          medicalRecordId: medicalRecordId || '',
          doctorId: user?.id || '', // Auto-seleccionar el doctor logueado
          patientId: selectedPatient?.id || '', // Usar el patientProfileId
          status: PrescriptionStatus.ACTIVE,
          validUntil: '',
          notes: '',
          appointmentId: '',
        })

        setMedications([
          {
            medicineName: '',
            concentration: '',
            form: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: '',
          },
        ])
      }
      setErrors({})
    }
  }, [
    isOpen,
    prescription,
    selectedPatientId,
    medicalRecordId,
    user?.id,
    selectedPatient?.id,
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.medicalRecordId) {
      newErrors.medicalRecordId = 'ID de historial médico es requerido'
    }
    if (!formData.doctorId) {
      newErrors.doctorId = 'ID del doctor es requerido'
    }
    if (!formData.patientId) {
      newErrors.patientId = 'ID del paciente es requerido'
    }
    if (!formData.validUntil) {
      newErrors.validUntil = 'Fecha de vencimiento es requerida'
    }

    medications.forEach((med, index) => {
      if (!med.medicineName.trim()) {
        newErrors[`medication_${index}_name`] =
          'Nombre del medicamento es requerido'
      }
      if (!med.dosage.trim()) {
        newErrors[`medication_${index}_dosage`] = 'Dosis es requerida'
      }
      if (!med.frequency.trim()) {
        newErrors[`medication_${index}_frequency`] = 'Frecuencia es requerida'
      }
      if (!med.duration.trim()) {
        newErrors[`medication_${index}_duration`] = 'Duración es requerida'
      }
    })

    if (medications.length === 0) {
      newErrors.medications = 'Al menos un medicamento es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const medicationsData = medications.map((med) => ({
        medicineName: med.medicineName,
        concentration: med.concentration || undefined,
        form: med.form || undefined,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || undefined,
        quantity: med.quantity || undefined,
      }))

      if (prescription) {
        const updateData: UpdatePrescriptionDto = {
          status: formData.status,
          validUntil: formData.validUntil,
          notes: formData.notes || undefined,
          medications: medicationsData,
        }
        updateMutation.mutate(
          { id: prescription.id, data: updateData },
          {
            onSuccess: () => {
              onSuccess?.()
            },
          }
        )
      } else {
        const createData: CreatePrescriptionDto = {
          medicalRecordId: formData.medicalRecordId,
          doctorId: formData.doctorId,
          patientId: selectedPatient?.id || formData.patientId, // Usar el patientProfileId, no el userId
          status: formData.status,
          validUntil: formData.validUntil,
          notes: formData.notes || undefined,
          appointmentId: formData.appointmentId || undefined,
          medications: medicationsData,
        }
        createMutation.mutate(createData, {
          onSuccess: () => {
            onSuccess?.()
          },
        })
      }

      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving prescription:', error)
    }
  }

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        medicineName: '',
        concentration: '',
        form: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: '',
      },
    ])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (
    index: number,
    field: keyof MedicationForm,
    value: string
  ) => {
    const updatedMedications = [...medications]
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    }
    setMedications(updatedMedications)
  }

  const isEditMode = !!prescription

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Pill className='h-5 w-5' />
            {isEditMode ? 'Editar Prescripción' : 'Nueva Prescripción'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica los datos de la prescripción'
              : 'Completa los datos para crear una nueva prescripción'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <Tabs defaultValue='general' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='general' className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                General
              </TabsTrigger>
              <TabsTrigger
                value='medications'
                className='flex items-center gap-2'
              >
                <Pill className='h-4 w-4' />
                Medicamentos
              </TabsTrigger>
              <TabsTrigger
                value='additional'
                className='flex items-center gap-2'
              >
                <Clock className='h-4 w-4' />
                Adicional
              </TabsTrigger>
            </TabsList>

            <TabsContent value='general' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Información de la Prescripción
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Paciente *
                      </label>
                      <Select
                        value={selectedPatientId}
                        onValueChange={(value) => {
                          const newSelectedPatient = patientsData?.data?.find(
                            (patient: PatientResponseDto) =>
                              patient.user.id === value
                          )
                          setSelectedPatientId(value)
                          setFormData({
                            ...formData,
                            patientId: newSelectedPatient?.id || '', // Usar el patientProfileId
                            medicalRecordId: '', // Reset medical record when patient changes
                          })
                        }}
                        disabled={isEditMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar paciente' />
                        </SelectTrigger>
                        <SelectContent>
                          {patientsData?.data?.map(
                            (patient: PatientResponseDto) => (
                              <SelectItem
                                key={patient.id}
                                value={patient.user.id}
                              >
                                {patient.user.firstName} {patient.user.lastName}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      {errors.patientId && (
                        <p className='text-sm text-red-500 mt-1'>
                          {errors.patientId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Historial Médico *
                      </label>
                      <Select
                        value={formData.medicalRecordId}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            medicalRecordId: value,
                          })
                        }
                        disabled={isEditMode || !selectedPatientId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedPatientId
                                ? 'Primero selecciona un paciente'
                                : medicalRecordsLoading
                                ? 'Cargando historiales...'
                                : medicalRecordsData?.data?.length === 0
                                ? 'No hay historiales médicos disponibles'
                                : 'Seleccionar historial médico'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {medicalRecordsData?.data?.map((record) => (
                            <SelectItem key={record.id} value={record.id}>
                              {record.diagnosis ||
                                record.symptoms?.[0] ||
                                'Sin diagnóstico'}{' '}
                              -{' '}
                              {new Date(record.createdAt).toLocaleDateString()}
                            </SelectItem>
                          ))}
                          {medicalRecordsData?.data?.length === 0 && (
                            <SelectItem value='' disabled>
                              No hay historiales disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.medicalRecordId && (
                        <p className='text-sm text-red-500 mt-1'>
                          {errors.medicalRecordId}
                        </p>
                      )}
                      {selectedPatientId && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Cargando historiales para paciente ID:{' '}
                          {selectedPatientId}
                          {medicalRecordsData &&
                            ` (${
                              medicalRecordsData.data?.length || 0
                            } encontrados)`}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Doctor
                      </label>
                      <Input
                        value={
                          user
                            ? `Dr. ${user.firstName} ${user.lastName}`
                            : 'Cargando...'
                        }
                        readOnly
                        disabled
                        className='bg-muted'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        Auto-seleccionado (doctor actual)
                      </p>
                    </div>

                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Válida Hasta *
                      </label>
                      <Input
                        type='date'
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validUntil: e.target.value,
                          })
                        }
                      />
                      {errors.validUntil && (
                        <p className='text-sm text-red-500 mt-1'>
                          {errors.validUntil}
                        </p>
                      )}
                    </div>

                    <div className='md:col-span-2'>
                      <label className='text-sm font-medium mb-2 block'>
                        Estado
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: PrescriptionStatus) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar estado' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PrescriptionStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className='flex items-center gap-2'>
                                <div
                                  className={cn(
                                    'h-2 w-2 rounded-full',
                                    status === PrescriptionStatus.ACTIVE &&
                                      'bg-green-500',
                                    status === PrescriptionStatus.COMPLETED &&
                                      'bg-blue-500',
                                    status === PrescriptionStatus.CANCELLED &&
                                      'bg-red-500',
                                    status === PrescriptionStatus.EXPIRED &&
                                      'bg-yellow-500'
                                  )}
                                />
                                {getPrescriptionStatusText(status)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='medications' className='space-y-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='text-lg'>
                    Lista de Medicamentos
                  </CardTitle>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addMedication}
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Agregar
                  </Button>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className='border rounded-lg p-4 space-y-4'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-medium'>Medicamento {index + 1}</h4>
                        {medications.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeMedication(index)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <Minus className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      <div className='space-y-4'>
                        {/* Nombre del Medicamento */}
                        <div>
                          <label className='text-sm font-medium mb-2 block'>
                            Nombre del Medicamento *
                          </label>
                          <Input
                            value={medication.medicineName}
                            onChange={(e) =>
                              updateMedication(
                                index,
                                'medicineName',
                                e.target.value
                              )
                            }
                            placeholder='Ej: Amoxicilina, Acetaminofén, Ibuprofeno'
                          />
                          {errors[`medication_${index}_name`] && (
                            <p className='text-sm text-red-500 mt-1'>
                              {errors[`medication_${index}_name`]}
                            </p>
                          )}
                        </div>

                        {/* Concentración y Forma */}
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Concentración
                            </label>
                            <Input
                              value={medication.concentration}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'concentration',
                                  e.target.value
                                )
                              }
                              placeholder='Ej: 500mg, 250mg/5ml, 200mg'
                            />
                          </div>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Forma Farmacéutica
                            </label>
                            <Input
                              value={medication.form}
                              onChange={(e) =>
                                updateMedication(index, 'form', e.target.value)
                              }
                              placeholder='Ej: tabletas, jarabe, cápsulas'
                            />
                          </div>
                        </div>

                        {/* Dosis y Frecuencia */}
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Dosis *
                            </label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'dosage',
                                  e.target.value
                                )
                              }
                              placeholder='Ej: 1 tableta, 5ml, 2 cápsulas'
                            />
                            {errors[`medication_${index}_dosage`] && (
                              <p className='text-sm text-red-500 mt-1'>
                                {errors[`medication_${index}_dosage`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Frecuencia *
                            </label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'frequency',
                                  e.target.value
                                )
                              }
                              placeholder='Ej: cada 8 horas, dos veces al día'
                            />
                            {errors[`medication_${index}_frequency`] && (
                              <p className='text-sm text-red-500 mt-1'>
                                {errors[`medication_${index}_frequency`]}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Duración y Cantidad */}
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Duración *
                            </label>
                            <Input
                              value={medication.duration}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'duration',
                                  e.target.value
                                )
                              }
                              placeholder='Ej: por 7 días, por 10 días, hasta terminar'
                            />
                            {errors[`medication_${index}_duration`] && (
                              <p className='text-sm text-red-500 mt-1'>
                                {errors[`medication_${index}_duration`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className='text-sm font-medium mb-2 block'>
                              Cantidad a Dispensar
                            </label>
                            <Input
                              value={medication.quantity}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              placeholder='Ej: 30 tabletas, 120ml, 1 frasco'
                            />
                          </div>
                        </div>

                        {/* Instrucciones Especiales */}
                        <div>
                          <label className='text-sm font-medium mb-2 block'>
                            Instrucciones Especiales
                          </label>
                          <Textarea
                            value={medication.instructions}
                            onChange={(e) =>
                              updateMedication(
                                index,
                                'instructions',
                                e.target.value
                              )
                            }
                            placeholder='Ej: con las comidas, en ayunas, antes de dormir'
                            className='min-h-[60px]'
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.medications && (
                    <p className='text-sm text-red-500'>{errors.medications}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='additional' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>
                      Notas Adicionales
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder='Notas adicionales, recomendaciones, etc...'
                      className='min-h-[100px]'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-2 block'>
                      ID de Cita (Opcional)
                    </label>
                    <Input
                      value={formData.appointmentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentId: e.target.value,
                        })
                      }
                      placeholder='ID de la cita relacionada'
                    />
                  </div>

                  {isEditMode && prescription && (
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          Fecha de Creación
                        </label>
                        <p className='text-sm'>
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
                        <p className='text-sm'>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
            >
              <X className='h-4 w-4 mr-2' />
              Cancelar
            </Button>
            <Button type='submit' disabled={loading}>
              <Save className='h-4 w-4 mr-2' />
              {loading
                ? 'Guardando...'
                : isEditMode
                ? 'Actualizar'
                : 'Crear Prescripción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
