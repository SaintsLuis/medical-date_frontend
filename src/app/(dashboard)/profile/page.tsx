import { Suspense } from 'react'
import { getProfileAction } from '@/features/auth/actions/auth-actions'
import { UserProfile } from '@/features/auth/components/user-profile'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading component para Suspense
function ProfileSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ProfilePage() {
  console.log('🔍 Profile Page Loading...')

  let userData = null

  try {
    userData = await getProfileAction()
    console.log('✅ Profile data loaded:', !!userData)
  } catch (error) {
    console.error('❌ Profile Page Error:', error)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mi Perfil</h1>
        <p className='text-muted-foreground'>
          Información de tu cuenta y configuración personal
        </p>
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userData={userData} />
      </Suspense>
    </div>
  )
}
