'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getUsers,
  getAllUsers,
  getUserById,
  getUserStats,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
  searchUsersAction,
  getUsersByRoleAction,
} from '../actions/user-actions'
import type { UpdateUserData, QueryUsersParams } from '../types'

// ==============================================
// Query Keys
// ==============================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
  byRole: (role: string) => [...userKeys.all, 'byRole', role] as const,
}

// ==============================================
// Hooks de Consulta (Queries)
// ==============================================

/**
 * Hook para obtener la lista paginada de usuarios.
 */
export function useUsers(params: QueryUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todos los usuarios (sin paginación).
 */
export function useAllUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener un usuario específico por ID.
 */
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener estadísticas de usuarios.
 */
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar usuarios.
 */
export function useUserSearch(searchTerm: string) {
  return useQuery({
    queryKey: userKeys.search(searchTerm),
    queryFn: () => searchUsersAction(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para obtener usuarios por rol.
 */
export function useUsersByRole(role: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.byRole(role),
    queryFn: () => getUsersByRoleAction(role),
    enabled: enabled && !!role,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ==============================================
// Hooks de Mutación (Mutations)
// ==============================================

/**
 * Hook para actualizar un usuario existente.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      updateUserAction(id, data),
    onSuccess: (result, { id }) => {
      if (result.success) {
        toast.success('Usuario actualizado exitosamente')
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: userKeys.stats() })
      } else {
        toast.error(result.error || 'Error al actualizar usuario')
      }
    },
    onError: (error) => {
      console.error('Update user error:', error)
      toast.error('Error al actualizar usuario')
    },
  })
}

/**
 * Hook para eliminar un usuario.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUserAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Usuario eliminado exitosamente')
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        queryClient.invalidateQueries({ queryKey: userKeys.stats() })
      } else {
        toast.error(result.error || 'Error al eliminar usuario')
      }
    },
    onError: (error) => {
      console.error('Delete user error:', error)
      toast.error('Error al eliminar usuario')
    },
  })
}

/**
 * Hook para cambiar el estado activo/inactivo de un usuario.
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleUserStatusAction,
    onSuccess: (result) => {
      if (result.success) {
        const isActive = result.data?.isActive
        toast.success(
          isActive
            ? 'Usuario activado exitosamente'
            : 'Usuario desactivado exitosamente'
        )
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        queryClient.invalidateQueries({ queryKey: userKeys.stats() })
      } else {
        toast.error(result.error || 'Error al cambiar estado del usuario')
      }
    },
    onError: (error) => {
      console.error('Toggle user status error:', error)
      toast.error('Error al cambiar estado del usuario')
    },
  })
}

// ==============================================
// Hooks de Utilidad
// ==============================================

/**
 * Hook para prefetch de un usuario específico.
 */
export function usePrefetchUser(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => getUserById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Hook para gestión completa de usuarios (combinación de hooks).
 */
export function useUserManagement() {
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const toggleUserStatus = useToggleUserStatus()

  return {
    updateUser,
    deleteUser,
    toggleUserStatus,
    isLoading:
      updateUser.isPending ||
      deleteUser.isPending ||
      toggleUserStatus.isPending,
  }
}
