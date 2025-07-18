// src/features/medical-records/hooks/use-patients.ts

import { useQuery } from '@tanstack/react-query'
import {
  getPatients,
  getPatientById,
} from '@/features/patients/actions/patient-actions'
import type {
  Patient,
  QueryPatientsParams,
  PaginatedPatientsResponse,
} from '@/features/patients/types'

// Re-exportar tipos para compatibilidad
export type PatientResponseDto = Patient
export type PaginatedPatientsResponseDto = PaginatedPatientsResponse

// Hook para buscar pacientes
export function usePatients(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: async (): Promise<PaginatedPatientsResponseDto> => {
      console.log('🔍 [usePatients] Fetching patients with params:', params)

      // Convertir parámetros al formato esperado
      const queryParams: QueryPatientsParams = {
        search: params?.search,
        page: params?.page || 1,
        limit: params?.limit || 20,
        includeUser: true, // Siempre incluir información del usuario
      }

      try {
        const result = await getPatients(queryParams)
        console.log('✅ [usePatients] Server action result:', result)

        if (result.success && result.data) {
          console.log('✅ [usePatients] Data received:', result.data)
          console.log(
            '✅ [usePatients] Patients count:',
            result.data.data?.length
          )
          return result.data
        } else {
          console.error('❌ [usePatients] Server action failed:', result.error)
          throw new Error(result.error || 'Failed to fetch patients')
        }
      } catch (error) {
        console.error('❌ [usePatients] Error fetching patients:', error)
        throw error
      }
    },
    enabled: true, // Always enabled for doctors
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  })
}

// Hook para obtener un paciente específico por ID
export function usePatient(patientId: string, enabled = true) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async (): Promise<PatientResponseDto> => {
      console.log('🔍 [usePatient] Fetching patient:', patientId)

      try {
        const result = await getPatientById(patientId)
        console.log('✅ [usePatient] Server action result:', result)

        if (result.success && result.data) {
          return result.data
        } else {
          console.error('❌ [usePatient] Server action failed:', result.error)
          throw new Error(result.error || 'Failed to fetch patient')
        }
      } catch (error) {
        console.error('❌ [usePatient] Error fetching patient:', error)
        throw error
      }
    },
    enabled: enabled && !!patientId,
  })
}
