'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function BillingSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-24 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
          </div>
          <Skeleton className='h-9 w-28' />
        </div>

        {/* Filters Skeleton */}
        <div className='flex items-center space-x-2'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 w-40' />
          <Skeleton className='h-10 w-40' />
          <Skeleton className='h-10 w-10' />
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardContent className='p-0'>
            <div className='divide-y'>
              {/* Table Header */}
              <div className='grid grid-cols-8 gap-4 p-4 bg-muted/50'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
              </div>

              {/* Table Rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className='grid grid-cols-8 gap-4 p-4'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <Skeleton className='h-4 w-16' />
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-6 w-20 rounded-full' />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <Skeleton className='h-4 w-16' />
                  <div className='flex justify-end space-x-2'>
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-8 w-8' />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-48' />
          <div className='space-x-2 flex'>
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20' />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BillingAnalyticsSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-20 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Large Chart */}
        <Card className='col-span-2'>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full' />
          </CardContent>
        </Card>

        {/* Small Charts */}
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[250px] w-full' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className='grid gap-6 md:grid-cols-3'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
            </CardHeader>
            <CardContent className='space-y-3'>
              {[...Array(3)].map((_, j) => (
                <div key={j} className='flex justify-between'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-16' />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function InvoiceFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Appointment Selection */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Amount */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Payment Method */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Due Date */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end space-x-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-28' />
      </div>
    </div>
  )
}
