import { redirect } from 'next/navigation'
import { SettingsDashboard } from '@/features/settings/components/settings-dashboard'
import { getServerToken } from '@/features/auth/actions/auth-actions'
import { config } from '@/config/app'

export default async function SettingsPage() {
  const token = await getServerToken()

  if (!token) {
    redirect('/auth/login')
  }

  // Obtener datos del usuario
  let userData
  try {
    const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    userData = await response.json()
  } catch (error) {
    console.error('Error fetching user data:', error)
    redirect('/auth/login')
  }

  return (
    <div className='flex-1 space-y-4 p-4 pt-6'>
      <SettingsDashboard userData={userData} />
    </div>
  )
}
