// src/features/medical-records/components/patient-selector.tsx

'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, User, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  usePatients,
  usePatient,
  PatientResponseDto,
} from '../hooks/use-patients'

interface PatientSelectorProps {
  value?: string
  onValueChange: (patientProfileId: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean // Nuevo prop para modo de solo lectura
}

export function PatientSelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar paciente...',
  disabled = false,
  readOnly = false, // Default false para compatibilidad
}: PatientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] =
    useState<PatientResponseDto | null>(null)

  // Fetch patients with search
  const {
    data: patientsData,
    isLoading,
    error,
  } = usePatients({
    search: search.trim() || undefined,
    limit: search.trim() ? 20 : 50, // Cargar más pacientes inicialmente si no hay búsqueda
  })

  // Fetch specific patient if we have a value (for edit mode or when patient is not in list)
  const { data: specificPatientData, isLoading: isLoadingSpecificPatient } =
    usePatient(
      value || '',
      !!value // Simply load if we have a value, let React Query handle caching
    )

  // Debug logging
  console.log('👥 [PatientSelector] Component render:', {
    currentValue: value,
    search: search.trim(),
    isLoading: isLoading || isLoadingSpecificPatient,
    error,
    patientsData: patientsData
      ? { count: patientsData.data?.length, meta: patientsData.meta }
      : null,
    patientsDataExists: !!patientsData,
    selectedPatient: selectedPatient
      ? {
          id: selectedPatient.id,
          name: `${selectedPatient.user?.firstName} ${selectedPatient.user?.lastName}`,
        }
      : null,
    specificPatientData: specificPatientData
      ? {
          id: specificPatientData.id,
          name: `${specificPatientData.user?.firstName} ${specificPatientData.user?.lastName}`,
        }
      : null,
    isLoadingSpecific: isLoadingSpecificPatient,
  })

  // Find selected patient when value changes
  useEffect(() => {
    console.log('🔍 [PatientSelector] useEffect triggered:', {
      value,
      hasValue: !!value,
      patientsDataExists: !!patientsData?.data,
      patientsCount: patientsData?.data?.length,
      specificPatientData: specificPatientData?.id,
      isLoadingSpecific: isLoadingSpecificPatient,
    })

    if (value) {
      let patient: PatientResponseDto | undefined = undefined

      // First priority: use specific patient data if available
      if (specificPatientData) {
        patient = specificPatientData
        console.log('🎯 [PatientSelector] Using specific patient data:', {
          patientId: patient.id,
          patientName: `${patient.user?.firstName} ${patient.user?.lastName}`,
        })
      }
      // Second priority: try to find in current list
      else if (patientsData?.data) {
        patient = patientsData.data.find((p) => p.id === value)
        if (patient) {
          console.log('🎯 [PatientSelector] Found patient in current list:', {
            patientId: patient.id,
            patientName: `${patient.user?.firstName} ${patient.user?.lastName}`,
          })
        }
      }

      console.log('🎯 [PatientSelector] Final patient selection:', {
        searchedId: value,
        foundPatient: patient?.id,
        patientName: patient
          ? `${patient.user?.firstName} ${patient.user?.lastName}`
          : 'NOT FOUND',
        source: specificPatientData
          ? 'specific'
          : patientsData?.data
          ? 'list'
          : 'none',
      })

      setSelectedPatient(patient || null)
    } else {
      console.log('🔄 [PatientSelector] Clearing selected patient (no value)')
      setSelectedPatient(null)
    }
  }, [value, patientsData, specificPatientData, isLoadingSpecificPatient])

  const handleSelect = (
    patient: PatientResponseDto,
    event?: React.MouseEvent
  ) => {
    // Prevenir propagación del evento para evitar conflictos
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    console.log('👤 [PatientSelector] Patient selected:', {
      patient,
      patientId: patient.id,
      patientName: `${patient.user?.firstName} ${patient.user?.lastName}`,
      currentValue: value,
    })

    setSelectedPatient(patient)
    console.log('🔄 [PatientSelector] Calling onValueChange with:', patient.id)
    onValueChange(patient.id)
    setOpen(false)
    console.log('✅ [PatientSelector] Selection completed')
  }

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

  return (
    <Popover open={open} onOpenChange={readOnly ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            readOnly && 'cursor-default hover:bg-background'
          )}
          disabled={disabled}
          onClick={readOnly ? (e) => e.preventDefault() : undefined}
        >
          {selectedPatient ? (
            <div className='flex items-center space-x-2 flex-1 text-left'>
              <User className='h-4 w-4 text-muted-foreground' />
              <div className='flex flex-col'>
                <span className='font-medium'>
                  {getPatientDisplayName(selectedPatient)}
                </span>
                <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                  <span>{selectedPatient.user?.email}</span>
                  {selectedPatient.birthDate && (
                    <>
                      <span>•</span>
                      <span>
                        {getPatientAge(selectedPatient.birthDate)} años
                      </span>
                    </>
                  )}
                  {selectedPatient.bloodType && (
                    <>
                      <span>•</span>
                      <Badge variant='outline' className='text-xs'>
                        {selectedPatient.bloodType.replace('_', '+')}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          {!readOnly && (
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      {!readOnly && (
        <PopoverContent className='w-full p-0' align='start'>
          <div className='flex flex-col'>
            {/* Search Input */}
            <div className='flex items-center border-b px-3'>
              <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
              <input
                type='text'
                placeholder='Buscar paciente por nombre o email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
              />
            </div>

            {/* Results */}
            <div className='max-h-60 overflow-y-auto'>
              {isLoading || isLoadingSpecificPatient ? (
                <div className='flex items-center justify-center py-6'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='ml-2 text-sm text-muted-foreground'>
                    Buscando pacientes...
                  </span>
                </div>
              ) : !patientsData?.data || patientsData.data.length === 0 ? (
                <div className='p-6 text-center text-sm text-muted-foreground'>
                  {search.trim()
                    ? 'No se encontraron pacientes con ese criterio de búsqueda.'
                    : 'No hay pacientes disponibles.'}
                </div>
              ) : (
                <div className='p-1'>
                  {patientsData.data.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={(e) => {
                        console.log(
                          '🖱️ [PatientSelector] Direct onClick triggered for:',
                          patient.id
                        )
                        handleSelect(patient, e)
                      }}
                      className={cn(
                        'flex items-center space-x-3 p-3 cursor-pointer rounded-md transition-colors duration-200 select-none',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground',
                        value === patient.id &&
                          'bg-accent text-accent-foreground'
                      )}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          console.log(
                            '⌨️ [PatientSelector] Keyboard select for:',
                            patient.id
                          )
                          handleSelect(patient)
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 pointer-events-none',
                          value === patient.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <User className='h-4 w-4 text-muted-foreground pointer-events-none' />
                      <div className='flex flex-col flex-1 pointer-events-none'>
                        <div className='font-medium'>
                          {getPatientDisplayName(patient)}
                        </div>
                        <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                          <span>{patient.user?.email}</span>
                          {patient.birthDate && (
                            <>
                              <span>•</span>
                              <span>
                                {getPatientAge(patient.birthDate)} años
                              </span>
                            </>
                          )}
                          {patient.bloodType && (
                            <>
                              <span>•</span>
                              <Badge
                                variant='outline'
                                className='text-xs pointer-events-none'
                              >
                                {patient.bloodType.replace('_', '+')}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
