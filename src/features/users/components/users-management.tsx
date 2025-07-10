'use client'

import { useState } from 'react'
import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Shield,
  Stethoscope,
  Power,
  PowerOff,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useUsers,
  useUserStats,
  useDeleteUser,
  useToggleUserStatus,
} from '../hooks/use-users'
import { UserForm } from './user-form'
import type { User } from '../types'

// Importar componentes de gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ===================================
// Componente principal
// ===================================

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUserType, setSelectedUserType] = useState<string>('')
  const [includePatientProfile] = useState(true)
  const [includeDoctorProfile] = useState(true)
  const [includeRoles] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Hooks para datos
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    userType: selectedUserType || undefined,
    includePatientProfile,
    includeDoctorProfile,
    includeRoles,
  })

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useUserStats()

  const deleteMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  // ===================================
  // Handlers
  // ===================================

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleUserTypeFilter = (userType: string) => {
    setSelectedUserType(userType)
    setCurrentPage(1)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteMutation.mutateAsync(selectedUser.id)
      setShowDeleteConfirm(false)
      setSelectedUser(null)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatusMutation.mutateAsync(user.id)
    } catch {
      // El error se maneja en el hook
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedUser(null)
    refetchUsers()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedUser(null)
  }

  // ===================================
  // Componentes internos
  // ===================================

  const StatsCards = () => {
    if (isLoadingStats) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
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
      )
    }

    if (statsError || !stats) {
      return (
        <Alert>
          <AlertDescription>
            Error al cargar estadísticas:{' '}
            {statsError?.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      )
    }

    // Asegurar valores por defecto para evitar errores
    const safeStats = {
      total: stats.data?.total ?? 0,
      active: stats.data?.active ?? 0,
      patients: stats.data?.patients ?? 0,
      doctors: stats.data?.doctors ?? 0,
      byRole: stats.data?.byRole ?? [],
    }

    return (
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-900'>
              Total Usuarios
            </CardTitle>
            <div className='h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.total}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {safeStats.total}
            </div>
            <p className='text-xs text-blue-700'>Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-900'>
              Activos
            </CardTitle>
            <div className='h-8 w-8 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.active}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {safeStats.active}
            </div>
            <p className='text-xs text-green-700'>Cuentas activas</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-900'>
              Doctores
            </CardTitle>
            <div className='h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.doctors}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {safeStats.doctors}
            </div>
            <p className='text-xs text-purple-700'>Médicos registrados</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-orange-900'>
              Pacientes
            </CardTitle>
            <div className='h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {safeStats.patients}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-900'>
              {safeStats.patients}
            </div>
            <p className='text-xs text-orange-700'>Pacientes registrados</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ===================================
  // Componentes de Gráficos
  // ===================================

  const RoleDistributionChart = () => {
    if (isLoadingStats || !stats) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      )
    }

    // Preparar datos para el gráfico de distribución de roles
    const roleData =
      stats.data?.byRole
        ?.map((role: { roleName: string; count: number }) => ({
          name:
            role.roleName === 'ADMIN'
              ? 'Administradores'
              : role.roleName === 'DOCTOR'
              ? 'Doctores'
              : role.roleName === 'PATIENT'
              ? 'Pacientes'
              : role.roleName,
          value: role.count,
          color:
            role.roleName === 'ADMIN'
              ? '#ef4444'
              : role.roleName === 'DOCTOR'
              ? '#10b981'
              : role.roleName === 'PATIENT'
              ? '#3b82f6'
              : '#6b7280',
        }))
        .filter((item: { value: number }) => item.value > 0) || [] // Solo mostrar roles con usuarios

    if (roleData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Roles</CardTitle>
            <CardDescription>
              Usuarios por tipo de rol en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              No hay usuarios registrados
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Roles</CardTitle>
          <CardDescription>
            Usuarios por tipo de rol en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={roleData}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                }
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const StatusChart = () => {
    if (isLoadingStats || !stats) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      )
    }

    // Preparar datos para el gráfico de estado de usuarios
    const statusData = [
      {
        name: 'Activos',
        value: stats.data?.active || 0,
        color: '#10b981', // green-500
      },
      {
        name: 'Inactivos',
        value: (stats.data?.total || 0) - (stats.data?.active || 0),
        color: '#6b7280', // gray-500
      },
    ].filter((item) => item.value > 0)

    if (statusData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Usuarios</CardTitle>
            <CardDescription>Usuarios activos vs inactivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              No hay datos disponibles
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Usuarios</CardTitle>
          <CardDescription>Usuarios activos vs inactivos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Usuarios']} />
              <Bar dataKey='value' fill='#3b82f6' name='Usuarios' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const UsersTable = () => {
    if (isLoadingUsers) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (usersError) {
      return (
        <Card>
          <CardContent className='pt-6'>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar usuarios: {usersError.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (!usersData?.data || usersData.data.data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>No se encontraron usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || selectedUserType
                  ? 'No se encontraron usuarios que coincidan con los filtros.'
                  : 'Aún no hay usuarios registrados en el sistema.'}
              </p>
              <p className='text-sm text-muted-foreground'>
                Los usuarios se crean desde el módulo de doctores o mediante el
                registro automático de pacientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    const getRoleIcon = (roles: Array<{ roleName: string }>) => {
      const roleNames = roles.map((role) => role.roleName.toLowerCase())
      if (roleNames.includes('admin')) return <Shield className='h-4 w-4' />
      if (roleNames.includes('doctor'))
        return <Stethoscope className='h-4 w-4' />
      return <UserIcon className='h-4 w-4' />
    }
    const getRoleColor = (roles: Array<{ roleName: string }>) => {
      const roleNames = roles.map((role) => role.roleName.toLowerCase())
      if (roleNames.includes('admin')) return 'bg-red-100 text-red-800'
      if (roleNames.includes('doctor')) return 'bg-green-100 text-green-800'
      return 'bg-blue-100 text-blue-800'
    }

    const getRoleText = (roles: Array<{ roleName: string }>) => {
      const roleNames = roles.map((role) => role.roleName.toLowerCase())
      if (roleNames.includes('admin')) return 'Admin'
      if (roleNames.includes('doctor')) return 'Doctor'
      if (roleNames.includes('patient')) return 'Paciente'
      return roleNames.join(', ')
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {/* Vista desktop: tabla responsive */}
          <div className='hidden md:block'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-1/4 pl-6'>Usuario</TableHead>
                    <TableHead className='w-1/6'>Rol</TableHead>
                    <TableHead className='w-1/6'>Estado</TableHead>
                    <TableHead className='w-1/6'>Activar/Desactivar</TableHead>
                    <TableHead className='w-1/6'>Registrado</TableHead>
                    <TableHead className='w-[100px] text-center pr-6'>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.data?.data.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className='font-medium pl-6'>
                        <div className='flex flex-col'>
                          <div className='font-medium'>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.roles)}>
                          <div className='flex items-center gap-1'>
                            {getRoleIcon(user.roles)}
                            {getRoleText(user.roles)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                        >
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Button
                          variant={user.isActive ? 'outline' : 'default'}
                          size='sm'
                          onClick={() => handleToggleStatus(user)}
                          className='h-8 px-3'
                          disabled={toggleStatusMutation.isPending}
                        >
                          {toggleStatusMutation.isPending ? (
                            <RefreshCw className='h-4 w-4 animate-spin' />
                          ) : user.isActive ? (
                            <>
                              <PowerOff className='h-4 w-4 mr-1' />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power className='h-4 w-4 mr-1' />
                              Activar
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {new Date(user.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className='pr-6'>
                        <div className='flex justify-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(user)}
                            className='h-7 w-7 p-0'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(user)}
                            className='h-7 w-7 p-0'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Vista móvil: cards apiladas */}
          <div className='md:hidden space-y-3 p-6'>
            {usersData.data?.data.map((user: User) => (
              <Card key={user.id} className='border-l-4 border-l-blue-500'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-medium text-lg leading-tight'>
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {user.email}
                      </p>
                    </div>
                    <div className='ml-3 flex space-x-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(user)}
                        className='h-8 w-8 p-0'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(user)}
                        className='h-8 w-8 p-0'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center space-x-2'>
                      <Badge className={getRoleColor(user.roles)}>
                        <div className='flex items-center gap-1'>
                          {getRoleIcon(user.roles)}
                          {getRoleText(user.roles)}
                        </div>
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <span className='text-muted-foreground text-xs'>
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Toggle de estado en móvil */}
                  <div className='mt-3 flex justify-center'>
                    <Button
                      variant={user.isActive ? 'outline' : 'default'}
                      size='sm'
                      onClick={() => handleToggleStatus(user)}
                      className='w-full'
                      disabled={toggleStatusMutation.isPending}
                    >
                      {toggleStatusMutation.isPending ? (
                        <RefreshCw className='h-4 w-4 animate-spin' />
                      ) : user.isActive ? (
                        <>
                          <PowerOff className='h-4 w-4 mr-1' />
                          Desactivar Usuario
                        </>
                      ) : (
                        <>
                          <Power className='h-4 w-4 mr-1' />
                          Activar Usuario
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {usersData.data?.meta.totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 px-6 border-t bg-gray-50/50'>
              <div className='text-sm text-muted-foreground order-2 sm:order-1'>
                Página {usersData.data.meta.page} de{' '}
                {usersData.data.meta.totalPages} ({usersData.data.meta.total}{' '}
                total)
              </div>
              <div className='flex space-x-2 order-1 sm:order-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!usersData.data.meta.hasPreviousPage}
                  className='px-3'
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!usersData.data.meta.hasNextPage}
                  className='px-3'
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // ===================================
  // Render principal
  // ===================================

  if (showForm && selectedUser) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>Editar Usuario</h1>
          <Button variant='outline' onClick={handleFormCancel}>
            Volver
          </Button>
        </div>
        <UserForm
          user={selectedUser}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  if (showDeleteConfirm && selectedUser) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Confirmar Eliminación
          </h1>
          <Button variant='outline' onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>¿Estás seguro?</CardTitle>
            <CardDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario {selectedUser.firstName} {selectedUser.lastName} del
              sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert variant='destructive'>
              <AlertDescription>
                <strong>Advertencia:</strong> Esta acción eliminará
                permanentemente la cuenta del usuario y todos sus datos
                asociados.
              </AlertDescription>
            </Alert>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Usuarios
          </h1>
          <p className='text-muted-foreground'>
            Administra los usuarios del sistema (administradores, doctores y
            pacientes)
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='users'>Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='space-y-6'>
            <StatsCards />

            {/* Gráficos */}
            <div className='grid gap-6 md:grid-cols-2'>
              <RoleDistributionChart />
              <StatusChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='users' className='space-y-6'>
          {/* Barra de búsqueda y filtros */}
          <Card className='bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <div className='relative flex-1 min-w-0'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Buscar usuarios por nombre o email...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <Button
                    variant={
                      selectedUserType === 'ADMIN' ? 'default' : 'outline'
                    }
                    onClick={() =>
                      handleUserTypeFilter(
                        selectedUserType === 'ADMIN' ? '' : 'ADMIN'
                      )
                    }
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <Shield className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Admins</span>
                    <span className='sm:hidden'>Admin</span>
                  </Button>
                  <Button
                    variant={
                      selectedUserType === 'DOCTOR' ? 'default' : 'outline'
                    }
                    onClick={() =>
                      handleUserTypeFilter(
                        selectedUserType === 'DOCTOR' ? '' : 'DOCTOR'
                      )
                    }
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <Stethoscope className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Doctores</span>
                    <span className='sm:hidden'>Docs</span>
                  </Button>
                  <Button
                    variant={
                      selectedUserType === 'PATIENT' ? 'default' : 'outline'
                    }
                    onClick={() =>
                      handleUserTypeFilter(
                        selectedUserType === 'PATIENT' ? '' : 'PATIENT'
                      )
                    }
                    className='whitespace-nowrap h-10'
                    size='sm'
                  >
                    <UserIcon className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Pacientes</span>
                    <span className='sm:hidden'>Pac</span>
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => refetchUsers()}
                    className='h-10'
                    size='sm'
                  >
                    <RefreshCw className='h-4 w-4' />
                    <span className='sr-only'>Actualizar</span>
                  </Button>
                </div>
              </div>
              {(searchTerm || selectedUserType) && (
                <div className='mt-3 flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Filtrando por:
                    {searchTerm && ` "${searchTerm}"`}
                    {selectedUserType && ` Tipo: ${selectedUserType}`}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      handleSearch('')
                      handleUserTypeFilter('')
                    }}
                    className='h-6 px-2 text-xs'
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <UsersTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
