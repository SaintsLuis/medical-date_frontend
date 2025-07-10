import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DoctorsSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-64' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>

      {/* Tabs */}
      <div className='space-y-4'>
        <Skeleton className='h-10 w-48' />

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-8 rounded-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-24' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-48' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-64 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
