'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Eye, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@/types/appointment'
import { format } from 'date-fns'

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    case 'NO_SHOW':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'Programada'
    case 'CONFIRMED':
      return 'Confirmada'
    case 'CANCELLED':
      return 'Cancelada'
    case 'COMPLETED':
      return 'Completada'
    case 'NO_SHOW':
      return 'No Presentó'
    default:
      return status
  }
}

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'patient',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Paciente
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const patient = row.original.patient
      return patient ? (
        <div className='flex flex-col'>
          <span className='font-medium'>
            {patient.firstName} {patient.lastName}
          </span>
          <span className='text-sm text-muted-foreground'>{patient.email}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>
          Sin información del paciente
        </span>
      )
    },
  },
  {
    accessorKey: 'doctor',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Doctor
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const doctor = row.original.doctor
      return doctor ? (
        <div className='flex flex-col'>
          <span className='font-medium'>
            Dr. {doctor.firstName} {doctor.lastName}
          </span>
          <span className='text-sm text-muted-foreground'>
            {doctor.specialties?.[0] || 'General'}
          </span>
        </div>
      ) : (
        <span className='text-muted-foreground'>
          Sin información del doctor
        </span>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Fecha y Hora
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'))
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{format(date, 'dd/MM/yyyy')}</span>
          <span className='text-sm text-muted-foreground'>
            {format(date, 'HH:mm')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as AppointmentType
      return (
        <Badge variant='outline'>
          {type === AppointmentType.IN_PERSON
            ? 'Presencial'
            : type === AppointmentType.VIRTUAL
            ? 'Virtual'
            : type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as AppointmentStatus
      return (
        <Badge className={getStatusColor(status)}>
          {getStatusText(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'clinic',
    header: 'Clínica',
    cell: ({ row }) => {
      const clinic = row.original.clinic
      return clinic ? (
        <div className='flex flex-col'>
          <span className='font-medium'>{clinic.name}</span>
          <span className='text-sm text-muted-foreground'>
            {clinic.address}
          </span>
        </div>
      ) : (
        <span className='text-muted-foreground'>
          Sin información de clínica
        </span>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Abrir menú</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(appointment.id)}
            >
              Copiar ID de cita
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar cita</DropdownMenuItem>
            <DropdownMenuItem>Cancelar cita</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface AppointmentsTableProps {
  data: Appointment[]
}

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filtrar citas...'
          value={(table.getColumn('patient')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('patient')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columnas <Search className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No se encontraron citas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
