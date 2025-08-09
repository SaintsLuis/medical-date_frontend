'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ===================================
// Componente de Loading para Secretarias
// ===================================

export function SecretariesSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>

      {/* Tabs skeleton */}
      <div className='space-y-4'>
        <div className='flex space-x-1'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-24' />
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-8 rounded-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-32' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <Skeleton className='h-10 flex-1' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-10 w-20' />
                <Skeleton className='h-10 w-20' />
                <Skeleton className='h-10 w-10' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent className='p-0'>
            <div className='hidden md:block'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>
                      <Skeleton className='h-4 w-20' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-24' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-16' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-32' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-28' />
                    </TableHead>
                    <TableHead className='pr-6'>
                      <Skeleton className='h-4 w-16' />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className='pl-6'>
                        <div className='space-y-1'>
                          <Skeleton className='h-4 w-32' />
                          <Skeleton className='h-3 w-48' />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          <Skeleton className='h-5 w-20' />
                          <Skeleton className='h-5 w-24' />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-16' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-8 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-16' />
                      </TableCell>
                      <TableCell className='pr-6'>
                        <div className='flex justify-center space-x-1'>
                          <Skeleton className='h-7 w-7' />
                          <Skeleton className='h-7 w-7' />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista móvil skeleton */}
            <div className='md:hidden space-y-3 p-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-5 w-32' />
                        <Skeleton className='h-4 w-48' />
                      </div>
                      <div className='flex space-x-1'>
                        <Skeleton className='h-8 w-8' />
                        <Skeleton className='h-8 w-8' />
                      </div>
                    </div>

                    <div className='space-y-2 mb-3'>
                      <Skeleton className='h-4 w-24' />
                      <div className='flex gap-1'>
                        <Skeleton className='h-5 w-20' />
                        <Skeleton className='h-5 w-24' />
                      </div>
                    </div>

                    <div className='flex items-center justify-between mb-3'>
                      <Skeleton className='h-5 w-16' />
                      <Skeleton className='h-4 w-20' />
                    </div>

                    <Skeleton className='h-9 w-full' />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===================================
// Skeleton para el formulario de secretarias
// ===================================

export function SecretaryFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-10 w-20' />
      </div>

      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5' />
            <Skeleton className='h-6 w-32' />
          </div>
          <Skeleton className='h-4 w-64' />
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Información Personal */}
          <div className='space-y-4'>
            <Skeleton className='h-6 w-40' />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>

            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-16 w-full' />
            </div>
          </div>

          {/* Separador */}
          <Skeleton className='h-px w-full' />

          {/* Información Laboral */}
          <div className='space-y-4'>
            <Skeleton className='h-6 w-36' />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-3 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </div>

          {/* Separador */}
          <Skeleton className='h-px w-full' />

          {/* Asignación de Doctores */}
          <div className='space-y-4'>
            <Skeleton className='h-6 w-36' />

            <div className='space-y-4'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-64' />

              <div className='border rounded-md p-2 space-y-2'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-48' />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Separador */}
          <Skeleton className='h-px w-full' />

          {/* Notas */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-3 w-56' />
          </div>

          {/* Botones */}
          <div className='flex items-center justify-end space-x-2 pt-6'>
            <Skeleton className='h-10 w-20' />
            <Skeleton className='h-10 w-32' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
