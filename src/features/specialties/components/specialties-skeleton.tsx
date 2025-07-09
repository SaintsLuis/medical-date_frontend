// ===================================
// Loading component
// ===================================

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SpecialtiesSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64 mb-2' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>

      {/* Tabs skeleton */}
      <div className='space-y-4'>
        <div className='flex space-x-1'>
          <Skeleton className='h-10 w-20' />
          <Skeleton className='h-10 w-24' />
        </div>

        {/* Stats cards skeleton */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-20' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-24' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
