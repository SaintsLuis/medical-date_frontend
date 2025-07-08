// lib/api/client.ts
import { config } from '@/config/app'
import { API_ENDPOINTS } from '@/constants/api-endpoints'

interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}

// Cliente API simplificado para fetch directo al backend NestJS
class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = config.API_BASE_URL
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // En el cliente, intentar obtener token desde localStorage para Client Components
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(config.TOKEN_STORAGE_KEY)
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // Método principal para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { params, headers = {}, ...restOptions } = options

    let url = `${this.baseURL}${endpoint}`

    // Agregar query parameters si existen
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        ...this.getAuthHeaders(),
        ...headers,
      },
      ...restOptions,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    return response.json()
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Método para Server Components que recibe token directamente
  async getWithToken<T>(
    endpoint: string,
    token: string,
    params?: Record<string, string>
  ): Promise<T> {
    let url = `${this.baseURL}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store', // Para Server Components
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    return response.json()
  }

  // Métodos específicos de la API (usando endpoints constantes)

  // Especialidades
  async getSpecialties() {
    return this.get(API_ENDPOINTS.SPECIALTIES.LIST)
  }

  async createSpecialty(data: { name: string; description?: string }) {
    return this.post(API_ENDPOINTS.SPECIALTIES.CREATE, data)
  }

  // Citas
  async getAppointments(filters?: Record<string, string>) {
    return this.get(API_ENDPOINTS.APPOINTMENTS.LIST, filters)
  }

  async createAppointment(data: unknown) {
    return this.post(API_ENDPOINTS.APPOINTMENTS.CREATE, data)
  }

  async getAppointment(id: string) {
    return this.get(API_ENDPOINTS.APPOINTMENTS.DETAIL(id))
  }

  // Doctores
  async getDoctors(filters?: Record<string, string>) {
    return this.get(API_ENDPOINTS.DOCTORS.LIST, filters)
  }

  // Pacientes
  async getPatients(filters?: Record<string, string>) {
    return this.get(API_ENDPOINTS.PATIENTS.LIST, filters)
  }

  // Clínicas
  async getClinics() {
    return this.get(API_ENDPOINTS.CLINICS.LIST)
  }

  // Analytics
  async getDashboardStats() {
    return this.get(API_ENDPOINTS.ANALYTICS.DASHBOARD)
  }

  // Método para Server Components
  async getDashboardStatsWithToken(token: string) {
    return this.getWithToken(API_ENDPOINTS.ANALYTICS.DASHBOARD, token)
  }
}

// Instancia singleton
export const apiClient = new ApiClient()
export default apiClient
