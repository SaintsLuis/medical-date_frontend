'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Activity,
  Stethoscope,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Edit,
  X,
  Mail,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Gauge,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  MedicalRecord,
  getCategoryText,
  getPriorityText,
  getPriorityColor,
  getCategoryColor,
  formatDate,
  isFollowUpOverdue,
  getDaysUntilFollowUp,
  formatBloodType,
} from '../types'
import { MedicalRecordDetailsSkeleton } from './medical-records-skeleton'

interface MedicalRecordDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: MedicalRecord | null
  isLoading?: boolean
  onEdit?: (record: MedicalRecord) => void
}

export function MedicalRecordDetails({
  open,
  onOpenChange,
  record,
  isLoading,
  onEdit,
}: MedicalRecordDetailsProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getFollowUpStatus = () => {
    if (!record?.followUpDate) return null

    const isOverdue = isFollowUpOverdue(record.followUpDate)
    const days = getDaysUntilFollowUp(record.followUpDate)

    return {
      isOverdue,
      days: Math.abs(days),
      text: isOverdue
        ? `Vencido hace ${Math.abs(days)} días`
        : `En ${days} días`,
      color: isOverdue
        ? 'text-red-600'
        : days <= 3
        ? 'text-orange-600'
        : 'text-green-600',
      bgColor: isOverdue
        ? 'bg-red-50 border-red-200'
        : days <= 3
        ? 'bg-orange-50 border-orange-200'
        : 'bg-green-50 border-green-200',
    }
  }

  const followUpStatus = getFollowUpStatus()

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Cargando detalles...</DialogTitle>
          </DialogHeader>
          <MedicalRecordDetailsSkeleton />
        </DialogContent>
      </Dialog>
    )
  }

  if (!record) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              Registro no encontrado
            </DialogTitle>
          </DialogHeader>
          <div className='py-6'>
            <p className='text-muted-foreground text-center'>
              No se pudo cargar la información del registro médico.
            </p>
          </div>
          <div className='flex justify-end'>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-4'>
          <div className='flex items-start justify-between'>
            <div>
              <DialogTitle className='text-xl font-semibold'>
                Detalles del Registro Médico
              </DialogTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Información completa del registro médico
              </p>
            </div>
            <div className='flex gap-2'>
              {isDoctor && onEdit && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(record)}
                  className='shrink-0'
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Editar
                </Button>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onOpenChange(false)}
                className='shrink-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header con información principal */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100'>
            <div className='flex items-start gap-4'>
              <Avatar className='h-16 w-16 ring-2 ring-white shadow-md'>
                <AvatarFallback className='bg-blue-100 text-blue-700 text-lg font-semibold'>
                  {isDoctor
                    ? getInitials(
                        record.patient?.firstName ||
                          record.patientProfile?.user.firstName ||
                          '',
                        record.patient?.lastName ||
                          record.patientProfile?.user.lastName ||
                          ''
                      )
                    : getInitials(
                        record.doctor?.firstName || '',
                        record.doctor?.lastName || ''
                      )}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {isDoctor
                        ? `${
                            record.patient?.firstName ||
                            record.patientProfile?.user.firstName
                          } ${
                            record.patient?.lastName ||
                            record.patientProfile?.user.lastName
                          }`
                        : `${record.doctor?.firstName} ${record.doctor?.lastName}`}
                    </h3>
                    <div className='flex items-center gap-1 text-sm text-gray-600 mt-1'>
                      <Mail className='h-4 w-4' />
                      <span>
                        {isDoctor
                          ? record.patient?.email ||
                            record.patientProfile?.user.email
                          : record.doctor?.email}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-2'>
                    <div className='flex gap-2'>
                      {record.category && (
                        <Badge
                          variant='secondary'
                          className={getCategoryColor(record.category)}
                        >
                          {getCategoryText(record.category)}
                        </Badge>
                      )}
                      {record.priority && (
                        <Badge
                          variant='secondary'
                          className={getPriorityColor(record.priority)}
                        >
                          {getPriorityText(record.priority)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4 mt-3'>
                  <div className='flex items-center gap-1 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4' />
                    <span>{formatDate(record.date)}</span>
                  </div>

                  {followUpStatus && (
                    <div
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${followUpStatus.bgColor}`}
                    >
                      {followUpStatus.isOverdue ? (
                        <AlertTriangle className='h-4 w-4' />
                      ) : (
                        <Clock className='h-4 w-4' />
                      )}
                      <span className={followUpStatus.color}>
                        Seguimiento: {followUpStatus.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información médica en grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Información del Doctor/Paciente */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-base font-medium text-gray-900'>
                <User className='h-5 w-5 text-blue-600' />
                {isDoctor
                  ? 'Información del Paciente'
                  : 'Información del Doctor'}
              </div>

              <div className='space-y-3 bg-gray-50 rounded-lg p-4'>
                <div className='grid grid-cols-[80px_1fr] gap-3 items-start'>
                  <span className='text-sm font-medium text-gray-600'>
                    Nombre:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {isDoctor
                      ? `${
                          record.patient?.firstName ||
                          record.patientProfile?.user.firstName
                        } ${
                          record.patient?.lastName ||
                          record.patientProfile?.user.lastName
                        }`
                      : `${record.doctor?.firstName} ${record.doctor?.lastName}`}
                  </span>
                </div>

                <div className='grid grid-cols-[80px_1fr] gap-3 items-start'>
                  <span className='text-sm font-medium text-gray-600'>
                    Email:
                  </span>
                  <span className='text-sm text-gray-900 break-all'>
                    {isDoctor
                      ? record.patient?.email ||
                        record.patientProfile?.user.email
                      : record.doctor?.email}
                  </span>
                </div>

                {!isDoctor && record.doctor?.doctorProfile?.license && (
                  <div className='grid grid-cols-[80px_1fr] gap-3 items-start'>
                    <span className='text-sm font-medium text-gray-600'>
                      Licencia:
                    </span>
                    <span className='text-sm text-gray-900'>
                      {record.doctor.doctorProfile.license}
                    </span>
                  </div>
                )}

                {isDoctor && record.patientProfile?.gender && (
                  <div className='grid grid-cols-[80px_1fr] gap-3 items-start'>
                    <span className='text-sm font-medium text-gray-600'>
                      Género:
                    </span>
                    <span className='text-sm text-gray-900'>
                      {record.patientProfile.gender === 'MALE'
                        ? 'Masculino'
                        : 'Femenino'}
                    </span>
                  </div>
                )}

                {isDoctor && record.patientProfile?.bloodType && (
                  <div className='grid grid-cols-[80px_1fr] gap-3 items-start'>
                    <span className='text-sm font-medium text-gray-600'>
                      Tipo sangre:
                    </span>
                    <span className='text-sm text-gray-900'>
                      {formatBloodType(record.patientProfile.bloodType)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información médica */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-base font-medium text-gray-900'>
                <Stethoscope className='h-5 w-5 text-green-600' />
                Información Médica
              </div>

              <div className='space-y-4'>
                <div>
                  <span className='text-sm font-medium text-gray-600 block mb-2'>
                    Síntomas:
                  </span>
                  <div className='bg-blue-50 rounded-lg p-3 border border-blue-100'>
                    {record.symptoms.length > 0 ? (
                      <ul className='space-y-1'>
                        {record.symptoms.map((symptom, index) => (
                          <li
                            key={index}
                            className='text-sm text-blue-900 flex items-start gap-2'
                          >
                            <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0' />
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className='text-sm text-gray-500 italic'>
                        Sin síntomas registrados
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className='text-sm font-medium text-gray-600 block mb-2'>
                    Diagnóstico:
                  </span>
                  <div className='bg-green-50 rounded-lg p-3 border border-green-100'>
                    <p className='text-sm text-green-900'>{record.diagnosis}</p>
                  </div>
                </div>

                {record.treatment && (
                  <div>
                    <span className='text-sm font-medium text-gray-600 block mb-2'>
                      Tratamiento:
                    </span>
                    <div className='bg-purple-50 rounded-lg p-3 border border-purple-100'>
                      <p className='text-sm text-purple-900 whitespace-pre-wrap'>
                        {record.treatment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alergias si existen */}
          {record.allergies && record.allergies.length > 0 && (
            <div className='bg-red-50 rounded-lg p-4 border border-red-200'>
              <div className='flex items-center gap-2 mb-3'>
                <AlertTriangle className='h-5 w-5 text-red-600' />
                <span className='font-medium text-red-900'>Alergias</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {record.allergies.map((allergy, index) => (
                  <Badge key={index} variant='destructive' className='text-xs'>
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Signos vitales */}
          {record.vitalSigns && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-base font-medium text-gray-900'>
                <Activity className='h-5 w-5 text-red-600' />
                Signos Vitales
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {record.vitalSigns.bloodPressure && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Heart className='h-4 w-4 text-red-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Presión
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {record.vitalSigns.bloodPressure}
                    </p>
                    <p className='text-xs text-gray-500'>mmHg</p>
                  </div>
                )}

                {record.vitalSigns.heartRate && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Activity className='h-4 w-4 text-pink-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Freq. Cardíaca
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {record.vitalSigns.heartRate}
                    </p>
                    <p className='text-xs text-gray-500'>bpm</p>
                  </div>
                )}

                {record.vitalSigns.temperature && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Thermometer className='h-4 w-4 text-orange-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Temperatura
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {record.vitalSigns.temperature}°C
                    </p>
                    <p className='text-xs text-gray-500'>Celsius</p>
                  </div>
                )}

                {record.vitalSigns.oxygenSaturation && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Gauge className='h-4 w-4 text-cyan-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Sat. Oxígeno
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {record.vitalSigns.oxygenSaturation}%
                    </p>
                    <p className='text-xs text-gray-500'>SpO2</p>
                  </div>
                )}

                {record.vitalSigns.weight && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Weight className='h-4 w-4 text-purple-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Peso
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {record.vitalSigns.weight}
                    </p>
                    <p className='text-xs text-gray-500'>kg</p>
                  </div>
                )}

                {record.vitalSigns.height && (
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Ruler className='h-4 w-4 text-green-500' />
                      <span className='text-xs font-medium text-gray-600'>
                        Altura
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      {(Number(record.vitalSigns.height) / 100).toFixed(2)}
                    </p>
                    <p className='text-xs text-gray-500'>m</p>
                  </div>
                )}
              </div>

              {record.vitalSigns.notes && (
                <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                  <span className='text-sm font-medium text-gray-600 block mb-1'>
                    Notas sobre signos vitales:
                  </span>
                  <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                    {record.vitalSigns.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notas adicionales */}
          {record.notes && (
            <div className='bg-amber-50 rounded-lg p-4 border border-amber-200'>
              <div className='flex items-center gap-2 mb-2'>
                <FileText className='h-5 w-5 text-amber-600' />
                <span className='font-medium text-amber-900'>
                  Notas Adicionales
                </span>
              </div>
              <p className='text-sm text-amber-800 whitespace-pre-wrap'>
                {record.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
