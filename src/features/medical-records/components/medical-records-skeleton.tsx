// src/features/medical-records/components/medical-records-skeleton.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MedicalRecordsSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='h-8 w-64 bg-gray-200 rounded animate-pulse mb-2' />
          <div className='h-4 w-96 bg-gray-200 rounded animate-pulse' />
        </div>
        <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
      </div>

      {/* Tabs */}
      <Tabs defaultValue='records' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='records' disabled>
            <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
          </TabsTrigger>
          <TabsTrigger value='analytics' disabled>
            <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
          </TabsTrigger>
          <TabsTrigger value='follow-up' disabled>
            <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
          </TabsTrigger>
        </TabsList>

        <TabsContent value='records' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className='h-5 w-24 bg-gray-200 rounded animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                    <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Table header */}
                <div className='grid grid-cols-6 gap-4 pb-2 border-b'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className='h-4 bg-gray-200 rounded animate-pulse'
                    />
                  ))}
                </div>

                {/* Table rows */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='grid grid-cols-6 gap-4 py-3 border-b'>
                    {[...Array(6)].map((_, j) => (
                      <div
                        key={j}
                        className='h-4 bg-gray-200 rounded animate-pulse'
                      />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          {/* Stats cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                  <div className='h-4 w-4 bg-gray-200 rounded animate-pulse' />
                </CardHeader>
                <CardContent>
                  <div className='h-8 w-16 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-3 w-32 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className='grid gap-6 md:grid-cols-2'>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className='h-5 w-40 bg-gray-200 rounded animate-pulse' />
                </CardHeader>
                <CardContent>
                  <div className='h-64 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='follow-up' className='space-y-6'>
          {/* Follow-up list */}
          <Card>
            <CardHeader>
              <div className='h-5 w-48 bg-gray-200 rounded animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-4 border rounded'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='h-10 w-10 bg-gray-200 rounded-full animate-pulse' />
                      <div className='space-y-2'>
                        <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                        <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
                      </div>
                    </div>
                    <div className='space-y-2 text-right'>
                      <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                      <div className='h-3 w-16 bg-gray-200 rounded animate-pulse' />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function MedicalRecordTableSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Table header */}
      <div className='grid grid-cols-6 gap-4 pb-2 border-b'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='h-4 bg-gray-200 rounded animate-pulse' />
        ))}
      </div>

      {/* Table rows */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className='grid grid-cols-6 gap-4 py-3 border-b'>
          {[...Array(6)].map((_, j) => (
            <div key={j} className='h-4 bg-gray-200 rounded animate-pulse' />
          ))}
        </div>
      ))}
    </div>
  )
}

export function MedicalRecordFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Form sections */}
      {[...Array(3)].map((_, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <div className='h-5 w-40 bg-gray-200 rounded animate-pulse' />
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              {[...Array(4)].map((_, fieldIndex) => (
                <div key={fieldIndex}>
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action buttons */}
      <div className='flex justify-end space-x-2'>
        <div className='h-10 w-20 bg-gray-200 rounded animate-pulse' />
        <div className='h-10 w-24 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  )
}

export function MedicalRecordDetailsSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='h-6 w-48 bg-gray-200 rounded animate-pulse mb-2' />
          <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
        </div>
        <div className='flex space-x-2'>
          <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
          <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
        </div>
      </div>

      {/* Content sections */}
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...Array(3)].map((_, j) => (
                <div key={j}>
                  <div className='h-3 w-20 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-full bg-gray-200 rounded animate-pulse' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
