'use server'

import { revalidatePath } from 'next/cache'
import { getServerToken } from '@/features/auth/actions/auth-actions'
import { config } from '@/config/app'

interface UpdateProfileResult {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

interface UpdateDoctorData {
  bio?: string
  consultationFee?: number
  experience?: number
  publicPhone?: string
  address?: string
  timeZone?: string
  meetingLink?: string
  languages?: string[]
  education?: string[]
}

interface UpdateSecretaryData {
  notes?: string
  phoneNumber?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// Server Action para actualizar información básica del usuario
export async function updateUserProfileAction(
  userId: string,
  userData: UpdateUserData
): Promise<UpdateProfileResult> {
  try {
    const token = await getServerToken()

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor, inicia sesión nuevamente.',
      }
    }

    console.log(`🔄 Updating user profile for ID: ${userId}`)

    const response = await fetch(`${config.API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ User update failed:', errorData)
      return {
        success: false,
        error: errorData.message || 'Error al actualizar el perfil de usuario',
      }
    }

    const responseData = await response.json()
    console.log('✅ User profile updated successfully')

    // Revalidar páginas relacionadas
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/settings')

    return {
      success: true,
      data: responseData.data || responseData,
    }
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para obtener el ID del perfil de doctor usando el ID del usuario
export async function getDoctorProfileIdAction(
  userId: string
): Promise<{ success: boolean; doctorProfileId?: string; error?: string }> {
  try {
    const token = await getServerToken()

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor, inicia sesión nuevamente.',
      }
    }

    console.log(`🔍 Getting doctor profile ID for user: ${userId}`)

    // Usar el endpoint que ya tiene fallback para buscar por User.id
    const response = await fetch(`${config.API_BASE_URL}/doctors/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Failed to get doctor profile:', errorData)
      return {
        success: false,
        error: errorData.message || 'Error al obtener el perfil de doctor',
      }
    }

    const responseData = await response.json()
    const doctorData = responseData.data || responseData

    console.log('✅ Doctor profile fetched successfully')
    console.log('🆔 Doctor profile ID:', doctorData.id)

    return {
      success: true,
      doctorProfileId: doctorData.id,
    }
  } catch (error) {
    console.error('❌ Error getting doctor profile ID:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para actualizar perfil de doctor
export async function updateDoctorProfileAction(
  doctorId: string,
  doctorData: UpdateDoctorData
): Promise<UpdateProfileResult> {
  try {
    const token = await getServerToken()

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor, inicia sesión nuevamente.',
      }
    }

    console.log(`🔄 Updating doctor profile for ID: ${doctorId}`)

    const response = await fetch(`${config.API_BASE_URL}/doctors/${doctorId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(doctorData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Doctor update failed:', errorData)
      return {
        success: false,
        error: errorData.message || 'Error al actualizar el perfil de doctor',
      }
    }

    const responseData = await response.json()
    console.log('✅ Doctor profile updated successfully')

    // Revalidar páginas relacionadas
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/settings')
    revalidatePath('/doctors')

    return {
      success: true,
      data: responseData.data || responseData,
    }
  } catch (error) {
    console.error('❌ Error updating doctor profile:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para actualizar perfil de secretaria
export async function updateSecretaryProfileAction(
  secretaryId: string,
  secretaryData: UpdateSecretaryData
): Promise<UpdateProfileResult> {
  try {
    const token = await getServerToken()

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor, inicia sesión nuevamente.',
      }
    }

    console.log(`🔄 Updating secretary profile for ID: ${secretaryId}`)

    const response = await fetch(
      `${config.API_BASE_URL}/secretaries/${secretaryId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(secretaryData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Secretary update failed:', errorData)
      return {
        success: false,
        error:
          errorData.message || 'Error al actualizar el perfil de secretaria',
      }
    }

    const responseData = await response.json()
    console.log('✅ Secretary profile updated successfully')

    // Revalidar páginas relacionadas
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/settings')

    return {
      success: true,
      data: responseData.data || responseData,
    }
  } catch (error) {
    console.error('❌ Error updating secretary profile:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

// Server Action para cambiar contraseña
export async function changePasswordAction(
  passwordData: ChangePasswordData
): Promise<UpdateProfileResult> {
  try {
    const token = await getServerToken()

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor, inicia sesión nuevamente.',
      }
    }

    console.log('🔄 Changing user password...')

    const response = await fetch(
      `${config.API_BASE_URL}/auth/change-password`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(passwordData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Password change failed:', errorData)
      return {
        success: false,
        error: errorData.message || 'Error al cambiar la contraseña',
      }
    }

    const responseData = await response.json()
    console.log('✅ Password changed successfully')

    return {
      success: true,
      data: responseData.data || responseData,
    }
  } catch (error) {
    console.error('❌ Error changing password:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}
