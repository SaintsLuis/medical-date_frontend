'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Icons
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search,
  Download,
  MoreHorizontal,
  Check,
  Monitor,
  MapPin,
  EyeOff,
  Loader2,
} from 'lucide-react'

import type {
  CalendarView,
  CalendarFilters,
  CalendarToolbarProps,
  AppointmentStatus,
  AppointmentType,
} from './types'

// ==============================================
// Componente Principal
// ==============================================

export function CalendarToolbar({
  view,
  date,
  onViewChange,
  onNavigate,
  filters,
  onFiltersChange,
  isLoading = false,
  enableExport = true,
  enablePrint = true,
}: CalendarToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // ==============================================
  // Handlers
  // ==============================================

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    // Aquí podrías implementar debounce si es necesario
  }, [])

  const toggleFilter = useCallback(
    (filterType: keyof CalendarFilters, value: string | boolean) => {
      const currentFilters = { ...filters }

      if (filterType === 'appointmentStatuses') {
        const statuses = currentFilters.appointmentStatuses || []
        const statusIndex = statuses.indexOf(value as AppointmentStatus)
        if (statusIndex > -1) {
          statuses.splice(statusIndex, 1)
        } else {
          statuses.push(value as AppointmentStatus)
        }
        currentFilters.appointmentStatuses = statuses
      } else if (filterType === 'appointmentTypes') {
        const types = currentFilters.appointmentTypes || []
        const typeIndex = types.indexOf(value as AppointmentType)
        if (typeIndex > -1) {
          types.splice(typeIndex, 1)
        } else {
          types.push(value as AppointmentType)
        }
        currentFilters.appointmentTypes = types
      } else if (typeof value === 'boolean') {
        ;(currentFilters as Record<string, unknown>)[filterType] = value
      }

      onFiltersChange(currentFilters)
    },
    [filters, onFiltersChange]
  )

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      ...filters,
      appointmentStatuses: [],
      appointmentTypes: [],
      showVirtualOnly: false,
      showInPersonOnly: false,
      hideCompletedAppointments: false,
    })
  }, [filters, onFiltersChange])

  const getActiveFilterCount = useCallback(() => {
    let count = 0
    if (filters.appointmentStatuses?.length)
      count += filters.appointmentStatuses.length
    if (filters.appointmentTypes?.length)
      count += filters.appointmentTypes.length
    if (filters.showVirtualOnly) count++
    if (filters.showInPersonOnly) count++
    if (filters.hideCompletedAppointments) count++
    return count
  }, [filters])

  // ==============================================
  // Renderizado de Secciones
  // ==============================================

  const renderNavigationButtons = () => (
    <div className='flex items-center gap-1'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onNavigate('prev')}
        disabled={isLoading}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onNavigate('today')}
        disabled={isLoading}
        className='min-w-[60px]'
      >
        Hoy
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onNavigate('next')}
        disabled={isLoading}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )

  const renderViewSelector = () => (
    <div className='flex items-center gap-1 border rounded-md p-1'>
      {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map(
        (viewType) => (
          <Button
            key={viewType}
            variant={view === viewType ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onViewChange(viewType)}
            disabled={isLoading}
            className='text-xs'
          >
            {viewType === 'month' && 'Mes'}
            {viewType === 'week' && 'Semana'}
            {viewType === 'day' && 'Día'}
            {viewType === 'agenda' && 'Agenda'}
          </Button>
        )
      )}
    </div>
  )

  const renderFiltersPopover = () => {
    const appointmentStatuses: {
      value: AppointmentStatus
      label: string
      color: string
    }[] = [
      {
        value: 'SCHEDULED',
        label: 'Programada',
        color: 'bg-blue-100 text-blue-800',
      },
      {
        value: 'CONFIRMED',
        label: 'Confirmada',
        color: 'bg-green-100 text-green-800',
      },
      {
        value: 'COMPLETED',
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
      },
      {
        value: 'CANCELLED',
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800',
      },
      {
        value: 'NO_SHOW',
        label: 'No Asistió',
        color: 'bg-orange-100 text-orange-800',
      },
    ]

    interface AppointmentTypeConfig {
      value: AppointmentType
      label: string
      icon: React.ComponentType<{ className?: string }>
    }

    const appointmentTypes: AppointmentTypeConfig[] = [
      { value: 'VIRTUAL', label: 'Virtual', icon: Monitor },
      { value: 'IN_PERSON', label: 'Presencial', icon: MapPin },
    ]

    return (
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='relative'>
            <Filter className='h-4 w-4 mr-2' />
            Filtros
            {getActiveFilterCount() > 0 && (
              <Badge variant='destructive' className='ml-2 h-5 w-5 p-0 text-xs'>
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-4' align='start'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Filtros del Calendario</h4>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearAllFilters}
                className='text-xs'
              >
                Limpiar todo
              </Button>
            </div>

            {/* Filtros por Estado */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Estado de Citas</Label>
              <div className='space-y-2'>
                {appointmentStatuses.map((status) => {
                  const isActive =
                    filters.appointmentStatuses?.includes(status.value) || false

                  return (
                    <div
                      key={status.value}
                      className='flex items-center space-x-2'
                    >
                      <button
                        onClick={() =>
                          toggleFilter('appointmentStatuses', status.value)
                        }
                        className={`flex items-center space-x-2 w-full p-2 rounded-md border text-left hover:bg-gray-50 ${
                          isActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {isActive && (
                          <Check className='h-3 w-3 text-blue-600' />
                        )}
                        <Badge className={status.color}>{status.label}</Badge>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filtros por Tipo */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Tipo de Citas</Label>
              <div className='space-y-2'>
                {appointmentTypes.map((type) => {
                  const isActive =
                    filters.appointmentTypes?.includes(type.value) || false
                  const IconComponent = type.icon

                  return (
                    <div
                      key={type.value}
                      className='flex items-center space-x-2'
                    >
                      <button
                        onClick={() =>
                          toggleFilter('appointmentTypes', type.value)
                        }
                        className={`flex items-center space-x-2 w-full p-2 rounded-md border text-left hover:bg-gray-50 ${
                          isActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {isActive && (
                          <Check className='h-3 w-3 text-blue-600' />
                        )}
                        <IconComponent className='h-4 w-4' />
                        <span className='text-sm'>{type.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filtros Rápidos */}
            <div className='space-y-3 border-t pt-3'>
              <Label className='text-sm font-medium'>Filtros Rápidos</Label>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <EyeOff className='h-4 w-4' />
                  <span className='text-sm'>Ocultar completadas</span>
                </div>
                <Switch
                  checked={filters.hideCompletedAppointments || false}
                  onCheckedChange={(checked) =>
                    toggleFilter('hideCompletedAppointments', checked)
                  }
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const renderActionButtons = () => (
    <div className='flex items-center gap-2'>
      {/* Búsqueda */}
      <div className='relative'>
        <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          placeholder='Buscar citas...'
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className='pl-8 w-48'
          disabled={isLoading}
        />
      </div>

      {/* Filtros */}
      {renderFiltersPopover()}

      {/* Acciones adicionales */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {enableExport && (
            <DropdownMenuItem onClick={() => console.log('Export')}>
              <Download className='h-4 w-4 mr-2' />
              Exportar calendario
            </DropdownMenuItem>
          )}
          {enablePrint && (
            <DropdownMenuItem onClick={() => window.print()}>
              <Download className='h-4 w-4 mr-2' />
              Imprimir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const renderActiveFilters = () => {
    const activeFilters: React.ReactNode[] = []

    // Mostrar filtros de estado activos
    filters.appointmentStatuses?.forEach((status) => {
      const statusConfig = {
        SCHEDULED: 'Programada',
        CONFIRMED: 'Confirmada',
        COMPLETED: 'Completada',
        CANCELLED: 'Cancelada',
        NO_SHOW: 'No Asistió',
      }[status]

      activeFilters.push(
        <Badge
          key={status}
          variant='secondary'
          className='flex items-center gap-1'
        >
          {statusConfig}
          <X
            className='h-3 w-3 cursor-pointer'
            onClick={() => toggleFilter('appointmentStatuses', status)}
          />
        </Badge>
      )
    })

    // Mostrar filtros de tipo activos
    filters.appointmentTypes?.forEach((type) => {
      const typeConfig = {
        VIRTUAL: 'Virtual',
        IN_PERSON: 'Presencial',
      }[type]

      activeFilters.push(
        <Badge
          key={type}
          variant='secondary'
          className='flex items-center gap-1'
        >
          {typeConfig}
          <X
            className='h-3 w-3 cursor-pointer'
            onClick={() => toggleFilter('appointmentTypes', type)}
          />
        </Badge>
      )
    })

    // Mostrar filtros booleanos activos
    if (filters.hideCompletedAppointments) {
      activeFilters.push(
        <Badge
          key='hideCompleted'
          variant='secondary'
          className='flex items-center gap-1'
        >
          Sin completadas
          <X
            className='h-3 w-3 cursor-pointer'
            onClick={() => toggleFilter('hideCompletedAppointments', false)}
          />
        </Badge>
      )
    }

    if (activeFilters.length === 0) return null

    return (
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='text-sm text-gray-500'>Filtros activos:</span>
        {activeFilters}
        <Button
          variant='ghost'
          size='sm'
          onClick={clearAllFilters}
          className='text-xs'
        >
          Limpiar todo
        </Button>
      </div>
    )
  }

  // ==============================================
  // Render Principal
  // ==============================================

  return (
    <div className='space-y-4'>
      {/* Toolbar Principal */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {/* Navegación */}
          {renderNavigationButtons()}

          {/* Fecha Actual */}
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-500' />
            <span className='text-lg font-semibold'>
              {format(date, 'MMMM yyyy', { locale: es })}
            </span>
            {isLoading && (
              <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
            )}
          </div>

          {/* Selector de Vista */}
          {renderViewSelector()}
        </div>

        {/* Acciones */}
        {renderActionButtons()}
      </div>

      {/* Filtros Activos */}
      {renderActiveFilters()}
    </div>
  )
}
