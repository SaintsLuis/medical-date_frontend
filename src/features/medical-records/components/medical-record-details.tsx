'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Activity,
  Stethoscope,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  X,
  Mail,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Gauge,
  Wind,
  Droplets,
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
  const [activeTab, setActiveTab] = useState('general')

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
        ? 'text-yellow-600'
        : 'text-green-600',
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registro no encontrado</DialogTitle>
            <DialogDescription>
              No se pudo cargar la información del registro médico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <FileText className='mr-2 h-5 w-5' />
              <div>
                <DialogTitle>Detalles del Registro Médico</DialogTitle>
                <DialogDescription>
                  Información completa del registro médico
                </DialogDescription>
              </div>
            </div>
            {isDoctor && onEdit && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onEdit(record)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Header Summary */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarFallback>
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

                <div>
                  <h3 className='font-semibold text-lg'>
                    {isDoctor
                      ? `${
                          record.patient?.firstName ||
                          record.patientProfile?.user.firstName
                        } ${
                          record.patient?.lastName ||
                          record.patientProfile?.user.lastName
                        }`
                      : `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`}
                  </h3>
                  <p className='text-muted-foreground'>
                    {isDoctor
                      ? record.patient?.email ||
                        record.patientProfile?.user.email
                      : record.doctor?.email}
                  </p>
                  <div className='flex items-center space-x-2 mt-1'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      {formatDate(record.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className='text-right space-y-2'>
                <div className='flex items-center space-x-2'>
                  {record.category && (
                    <Badge
                      variant='outline'
                      className={getCategoryColor(record.category)}
                    >
                      {getCategoryText(record.category)}
                    </Badge>
                  )}
                  {record.priority && (
                    <Badge
                      variant='outline'
                      className={getPriorityColor(record.priority)}
                    >
                      {getPriorityText(record.priority)}
                    </Badge>
                  )}
                </div>

                {followUpStatus && (
                  <div className='flex items-center space-x-2'>
                    {followUpStatus.isOverdue ? (
                      <AlertTriangle className='h-4 w-4 text-red-500' />
                    ) : (
                      <Clock className='h-4 w-4 text-yellow-500' />
                    )}
                    <span className={`text-sm ${followUpStatus.color}`}>
                      Seguimiento: {followUpStatus.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='general' className='flex items-center'>
              <FileText className='mr-1 h-4 w-4' />
              <span className='hidden sm:inline'>General</span>
            </TabsTrigger>
            <TabsTrigger value='vitals' className='flex items-center'>
              <Activity className='mr-1 h-4 w-4' />
              <span className='hidden sm:inline'>Signos Vitales</span>
              <span className='sm:hidden'>Vitales</span>
            </TabsTrigger>
            <TabsTrigger value='treatment' className='flex items-center'>
              <Stethoscope className='mr-1 h-4 w-4' />
              <span className='hidden sm:inline'>Tratamiento</span>
            </TabsTrigger>
            <TabsTrigger value='followup' className='flex items-center'>
              <Clock className='mr-1 h-4 w-4' />
              <span className='hidden sm:inline'>Seguimiento</span>
            </TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value='general' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Patient/Doctor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <User className='mr-2 h-5 w-5' />
                    {isDoctor
                      ? 'Información del Paciente'
                      : 'Información del Doctor'}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Nombre:</span>
                    <span>
                      {isDoctor
                        ? `${
                            record.patient?.firstName ||
                            record.patientProfile?.user.firstName
                          } ${
                            record.patient?.lastName ||
                            record.patientProfile?.user.lastName
                          }`
                        : `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`}
                    </span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Email:</span>
                    <span>
                      {isDoctor
                        ? record.patient?.email ||
                          record.patientProfile?.user.email
                        : record.doctor?.email}
                    </span>
                  </div>

                  {isDoctor && record.patientProfile?.birthDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Fecha de Nacimiento:</span>
                      <span>{formatDate(record.patientProfile.birthDate)}</span>
                    </div>
                  )}

                  {isDoctor && record.patientProfile?.gender && (
                    <div className='flex items-center space-x-2'>
                      <User className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Género:</span>
                      <span>{record.patientProfile.gender}</span>
                    </div>
                  )}

                  {isDoctor && record.patientProfile?.bloodType && (
                    <div className='flex items-center space-x-2'>
                      <Droplets className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Tipo de Sangre:</span>
                      <span>{record.patientProfile.bloodType}</span>
                    </div>
                  )}

                  {!isDoctor && record.doctor?.doctorProfile?.license && (
                    <div className='flex items-center space-x-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Licencia:</span>
                      <span>{record.doctor.doctorProfile.license}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <Stethoscope className='mr-2 h-5 w-5' />
                    Información Médica
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <span className='font-medium text-sm text-muted-foreground block mb-1'>
                      Síntomas:
                    </span>
                    <div className='space-y-1'>
                      {Array.isArray(record.symptoms) ? (
                        record.symptoms.map((symptom, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='mr-1 mb-1'
                          >
                            {symptom}
                          </Badge>
                        ))
                      ) : (
                        <p className='text-sm'>{record.symptoms}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className='font-medium text-sm text-muted-foreground block mb-1'>
                      Diagnóstico:
                    </span>
                    <p className='text-sm'>{record.diagnosis}</p>
                  </div>

                  {record.allergies && record.allergies.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className='font-medium text-sm text-muted-foreground block mb-1'>
                          Alergias:
                        </span>
                        <div className='space-y-1'>
                          {record.allergies.map((allergy, index) => (
                            <Badge
                              key={index}
                              variant='destructive'
                              className='mr-1 mb-1'
                            >
                              <AlertTriangle className='mr-1 h-3 w-3' />
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {record.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Notas Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                    {record.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value='vitals' className='space-y-4'>
            {record.vitalSigns ? (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {/* Blood Pressure */}
                {record.vitalSigns.bloodPressure && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Heart className='h-5 w-5 text-red-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Presión Arterial
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.bloodPressure}
                          </p>
                          <p className='text-xs text-muted-foreground'>mmHg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Heart Rate */}
                {record.vitalSigns.heartRate && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Activity className='h-5 w-5 text-pink-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Frecuencia Cardíaca
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.heartRate}
                          </p>
                          <p className='text-xs text-muted-foreground'>bpm</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Temperature */}
                {record.vitalSigns.temperature && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Thermometer className='h-5 w-5 text-orange-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Temperatura
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.temperature}°
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Celsius
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Respiratory Rate */}
                {record.vitalSigns.respiratoryRate && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Wind className='h-5 w-5 text-blue-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Frecuencia Respiratoria
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.respiratoryRate}
                          </p>
                          <p className='text-xs text-muted-foreground'>rpm</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Oxygen Saturation */}
                {record.vitalSigns.oxygenSaturation && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Gauge className='h-5 w-5 text-cyan-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Saturación de Oxígeno
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.oxygenSaturation}%
                          </p>
                          <p className='text-xs text-muted-foreground'>SpO2</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weight */}
                {record.vitalSigns.weight && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Weight className='h-5 w-5 text-purple-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Peso
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.weight}
                          </p>
                          <p className='text-xs text-muted-foreground'>kg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Height */}
                {record.vitalSigns.height && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Ruler className='h-5 w-5 text-green-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Altura
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.height}
                          </p>
                          <p className='text-xs text-muted-foreground'>cm</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* BMI */}
                {record.vitalSigns.bmi && (
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center space-x-2'>
                        <Gauge className='h-5 w-5 text-indigo-500' />
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>
                            Índice de Masa Corporal
                          </p>
                          <p className='text-2xl font-bold'>
                            {record.vitalSigns.bmi}
                          </p>
                          <p className='text-xs text-muted-foreground'>kg/m²</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className='pt-6'>
                  <div className='text-center py-8'>
                    <Activity className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                    <h3 className='text-lg font-medium mb-2'>
                      Sin signos vitales registrados
                    </h3>
                    <p className='text-muted-foreground'>
                      No se registraron signos vitales para este registro
                      médico.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vital Signs Notes */}
            {record.vitalSigns?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Notas sobre Signos Vitales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                    {record.vitalSigns.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value='treatment' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center'>
                  <Stethoscope className='mr-2 h-5 w-5' />
                  Plan de Tratamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {record.treatment ? (
                  <p className='text-sm whitespace-pre-wrap'>
                    {record.treatment}
                  </p>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>
                    No se especificó un plan de tratamiento.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Follow-up Tab */}
          <TabsContent value='followup' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center'>
                  <Clock className='mr-2 h-5 w-5' />
                  Información de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {record.followUpDate ? (
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='font-medium'>Fecha programada:</span>
                        <span>{formatDate(record.followUpDate)}</span>
                      </div>

                      {followUpStatus && (
                        <div className='flex items-center space-x-2'>
                          {followUpStatus.isOverdue ? (
                            <AlertTriangle className='h-4 w-4 text-red-500' />
                          ) : (
                            <CheckCircle className='h-4 w-4 text-green-500' />
                          )}
                          <span
                            className={`text-sm font-medium ${followUpStatus.color}`}
                          >
                            {followUpStatus.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <Clock className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                    <h3 className='text-lg font-medium mb-2'>
                      Sin seguimiento programado
                    </h3>
                    <p className='text-muted-foreground'>
                      No se programó una fecha de seguimiento para este
                      registro.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            <X className='mr-2 h-4 w-4' />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
