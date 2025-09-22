// src/features/medical-records/actions/medical-records-actions.ts

'use server'

import { revalidateTag } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  ArchiveMedicalRecordDto,
  QueryMedicalRecordsParams,
  MedicalRecord,
  PaginatedMedicalRecordsResponse,
  DoctorMedicalRecordAnalytics,
} from '../types'

// ==============================================
// Query Actions
// ==============================================

export async function getMedicalRecordsAction(
  params: QueryMedicalRecordsParams = {}
): Promise<ServerApiResponse<PaginatedMedicalRecordsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.patientProfileId)
    queryParams.append('patientProfileId', params.patientProfileId)
  if (params.doctorId) queryParams.append('doctorId', params.doctorId)
  if (params.category) queryParams.append('category', params.category)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)
  if (params.followUpOnly) queryParams.append('followUpOnly', 'true')

  const url = `/medical-records${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  console.log('🔍 Medical Records API Request:', { url, params })
  const result = await serverApi.get<PaginatedMedicalRecordsResponse>(url)
  console.log('📦 Medical Records API Response:', result)

  if (result.success && result.data) {
    console.log('📋 Medical Records Data:', result.data.data)
    if (result.data.data.length > 0) {
      console.log('👤 First Record Doctor Data:', result.data.data[0].doctor)
      console.log(
        '🏥 First Record Patient Data:',
        result.data.data[0].patientProfile
      )
    }
  }

  return result
}

export async function getMedicalRecordByIdAction(
  id: string
): Promise<ServerApiResponse<MedicalRecord>> {
  return serverApi.get<MedicalRecord>(`/medical-records/${id}`)
}

export async function getPatientMedicalRecordsAction(
  patientProfileId: string,
  params: QueryMedicalRecordsParams = {}
): Promise<ServerApiResponse<PaginatedMedicalRecordsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.category) queryParams.append('category', params.category)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)
  if (params.followUpOnly) queryParams.append('followUpOnly', 'true')

  const url = `/medical-records/patient/${patientProfileId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedMedicalRecordsResponse>(url)
}

export async function getPatientMedicalRecordsByUserIdAction(
  userId: string,
  params: QueryMedicalRecordsParams = {}
): Promise<ServerApiResponse<PaginatedMedicalRecordsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.category) queryParams.append('category', params.category)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)
  if (params.followUpOnly) queryParams.append('followUpOnly', 'true')

  const url = `/medical-records/patient-by-user/${userId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedMedicalRecordsResponse>(url)
}

export async function getDoctorMedicalRecordsAction(
  doctorId: string,
  params: QueryMedicalRecordsParams = {}
): Promise<ServerApiResponse<PaginatedMedicalRecordsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.patientProfileId)
    queryParams.append('patientProfileId', params.patientProfileId)
  if (params.category) queryParams.append('category', params.category)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)
  if (params.followUpOnly) queryParams.append('followUpOnly', 'true')

  const url = `/medical-records/doctor/${doctorId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedMedicalRecordsResponse>(url)
}

export async function getFollowUpRecordsAction(): Promise<
  ServerApiResponse<MedicalRecord[]>
> {
  return serverApi.get<MedicalRecord[]>('/medical-records/follow-up')
}

export async function getDoctorMedicalRecordAnalyticsAction(
  doctorId: string
): Promise<ServerApiResponse<DoctorMedicalRecordAnalytics>> {
  return serverApi.get<DoctorMedicalRecordAnalytics>(
    `/medical-records/doctor/${doctorId}/analytics`
  )
}

// ==============================================
// Mutation Actions
// ==============================================

export async function createMedicalRecordAction(
  data: CreateMedicalRecordDto
): Promise<ServerApiResponse<MedicalRecord>> {
  const result = await serverApi.post<MedicalRecord>('/medical-records', data)

  if (result.success) {
    // Revalidate relevant caches
    revalidateTag('medical-records')
    revalidateTag(`medical-records-patient-${data.patientProfileId}`)
    revalidateTag(`medical-records-doctor-${data.doctorId}`)
    revalidateTag('follow-up-records')
  }

  return result
}

export async function updateMedicalRecordAction(
  id: string,
  data: UpdateMedicalRecordDto
): Promise<ServerApiResponse<MedicalRecord>> {
  const result = await serverApi.patch<MedicalRecord>(
    `/medical-records/${id}`,
    data
  )

  if (result.success) {
    // Revalidate relevant caches
    revalidateTag('medical-records')
    revalidateTag(`medical-record-${id}`)
    revalidateTag('follow-up-records')
  }

  return result
}

export async function deleteMedicalRecordAction(
  id: string
): Promise<ServerApiResponse<void>> {
  const result = await serverApi.delete<void>(`/medical-records/${id}`)

  if (result.success) {
    // Revalidate relevant caches
    revalidateTag('medical-records')
    revalidateTag(`medical-record-${id}`)
    revalidateTag('follow-up-records')
  }

  return result
}

export async function archiveMedicalRecordAction(
  id: string,
  data: ArchiveMedicalRecordDto
): Promise<ServerApiResponse<MedicalRecord>> {
  const result = await serverApi.patch<MedicalRecord>(
    `/medical-records/${id}/archive`,
    data
  )

  if (result.success) {
    // Revalidate relevant caches
    revalidateTag('medical-records')
    revalidateTag(`medical-record-${id}`)
    revalidateTag('archived-medical-records')
  }

  return result
}

export async function getArchivedMedicalRecordsAction(
  params: QueryMedicalRecordsParams = {}
): Promise<ServerApiResponse<PaginatedMedicalRecordsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.doctorId) queryParams.append('doctorId', params.doctorId)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)

  const url = `/medical-records/archived${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedMedicalRecordsResponse>(url)
}
