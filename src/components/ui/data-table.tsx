'use client'

import * as React from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from '@tabler/icons-react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { z } from 'zod'

import { useIsMobile } from '@/hooks/use-mobile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant='ghost'
      size='icon'
      className='text-muted-foreground size-7 hover:bg-transparent'
    >
      <IconGripVertical className='text-muted-foreground size-3' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <input
          type='checkbox'
          checked={table.getIsAllPageRowsSelected()}
          ref={(input) => {
            if (input) {
              input.indeterminate =
                !table.getIsAllPageRowsSelected() &&
                table.getIsSomePageRowsSelected()
            }
          }}
          onChange={(event) =>
            table.toggleAllPageRowsSelected(event.target.checked)
          }
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <input
          type='checkbox'
          checked={row.getIsSelected()}
          onChange={(event) => row.toggleSelected(event.target.checked)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'header',
    header: 'Header',
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: 'Section Type',
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-muted-foreground px-1.5'>
        {row.original.status === 'Done' ? <IconLoader /> : <IconLoader />}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'target',
    header: 'Target',
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          {row.original.target}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'limit',
    header: 'Limit',
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          {row.original.limit}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'reviewer',
    header: 'Reviewer',
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          {row.original.reviewer}
        </Badge>
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <IconDotsVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.header)}
            >
              Copy header
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && 'selected'}
      className={isDragging ? 'opacity-50' : ''}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

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
    onGlobalFilterChange: setGlobalFilter,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        toast.success('Items reordered successfully')
        return newItems
      })
    }
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Filter items...'
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        </div>
        <div className='flex items-center space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns <IconLayoutColumns className='ml-2 h-4 w-4' />
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
          <Button>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Item
          </Button>
        </div>
      </div>
      <div className='rounded-md border'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
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
            <SortableContext
              items={table.getRowModel().rows.map((row) => row.original.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => <DraggableRow key={row.id} row={row} />)
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant='ghost' className='h-auto p-0'>
            <div className='flex flex-col items-start space-y-1'>
              <div className='text-sm font-medium leading-none'>
                {item.header}
              </div>
              <div className='text-xs text-muted-foreground'>
                {item.type} • {item.status}
              </div>
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className='mx-auto w-full max-w-sm'>
            <DrawerHeader>
              <DrawerTitle>{item.header}</DrawerTitle>
              <DrawerDescription>
                Detailed view of the selected item.
              </DrawerDescription>
            </DrawerHeader>
            <div className='p-4'>
              <div className='space-y-4'>
                <div>
                  <Label>Type</Label>
                  <Badge variant='outline'>{item.type}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant='outline'>{item.status}</Badge>
                </div>
                <div>
                  <Label>Target</Label>
                  <Badge variant='outline'>{item.target}</Badge>
                </div>
                <div>
                  <Label>Limit</Label>
                  <Badge variant='outline'>{item.limit}</Badge>
                </div>
                <div>
                  <Label>Reviewer</Label>
                  <Badge variant='outline'>{item.reviewer}</Badge>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant='outline'>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-auto p-0'>
          <div className='flex flex-col items-start space-y-1'>
            <div className='text-sm font-medium leading-none'>
              {item.header}
            </div>
            <div className='text-xs text-muted-foreground'>
              {item.type} • {item.status}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-80'>
        <DropdownMenuLabel>Item Details</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='p-2'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Type:</span>
              <Badge variant='outline'>{item.type}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Status:</span>
              <Badge variant='outline'>{item.status}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Target:</span>
              <Badge variant='outline'>{item.target}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Limit:</span>
              <Badge variant='outline'>{item.limit}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Reviewer:</span>
              <Badge variant='outline'>{item.reviewer}</Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconTrendingUp className='mr-2 h-4 w-4' />
          View Analytics
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconDotsVertical className='mr-2 h-4 w-4' />
          More Actions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
