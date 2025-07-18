// src/features/medical-records/components/patient-display.tsx

'use client'

import { useEffect, useState } from 'react'
import { User, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePatient, PatientResponseDto } from '../hooks/use-patients'

interface PatientDisplayProps {
  patientId: string
  className?: string
}

export function PatientDisplay({
  patientId,
  className = '',
}: PatientDisplayProps) {
  const [patient, setPatient] = useState<PatientResponseDto | null>(null)

  // Fetch the specific patient for display
  const {
    data: patientData,
    isLoading,
    error,
  } = usePatient(patientId, !!patientId)

  useEffect(() => {
    if (patientData) {
      setPatient(patientData)
      console.log('📋 [PatientDisplay] Patient loaded for display:', {
        patientId: patientData.id,
        patientName: `${patientData.user?.firstName} ${patientData.user?.lastName}`,
      })
    }
  }, [patientData])

  const getPatientDisplayName = (patient: PatientResponseDto) => {
    return `${patient.user?.firstName || 'N/A'} ${
      patient.user?.lastName || 'N/A'
    }`
  }

  const getPatientAge = (birthDate?: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    return age
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center space-x-2 p-3 border rounded-md bg-muted/50 ${className}`}
      >
        <Loader2 className='h-4 w-4 animate-spin' />
        <span className='text-sm text-muted-foreground'>
          Cargando información del paciente...
        </span>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div
        className={`flex items-center space-x-2 p-3 border rounded-md bg-destructive/10 ${className}`}
      >
        <User className='h-4 w-4 text-destructive' />
        <span className='text-sm text-destructive'>
          Error al cargar información del paciente
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center space-x-3 p-3 border rounded-md bg-muted/20 ${className}`}
    >
      <User className='h-5 w-5 text-muted-foreground' />
      <div className='flex flex-col flex-1'>
        <div className='flex items-center space-x-2'>
          <span className='font-medium text-sm'>
            {getPatientDisplayName(patient)}
          </span>
          <Badge variant='secondary' className='text-xs'>
            Paciente asignado
          </Badge>
        </div>
        <div className='flex items-center space-x-2 text-xs text-muted-foreground mt-1'>
          <span>{patient.user?.email}</span>
          {patient.birthDate && (
            <>
              <span>•</span>
              <span>{getPatientAge(patient.birthDate)} años</span>
            </>
          )}
          {patient.bloodType && (
            <>
              <span>•</span>
              <Badge variant='outline' className='text-xs'>
                {patient.bloodType.replace('_', '+')}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
