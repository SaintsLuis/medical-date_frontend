// src/features/users/index.ts

// ==============================================
// Exports principales
// ==============================================

export { UsersManagement } from './components/users-management'
export { UserForm } from './components/user-form'
export { UsersSkeleton } from './components/users-skeleton'

// ==============================================
// Exports de hooks
// ==============================================

export {
  useUsers,
  useAllUsers,
  useUser,
  useUserStats,
  useUserSearch,
  useUsersByRole,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  usePrefetchUser,
  useUserManagement,
  userKeys,
} from './hooks/use-users'

// ==============================================
// Exports de tipos
// ==============================================

export type {
  User,
  UserWithDetails,
  UpdateUserData,
  QueryUsersParams,
  PaginatedUsersResponse,
  BackendUserStats,
  UserStats,
  UserFormData,
  UserFilters,
  UserAnalytics,
} from './types'

export {
  USER_FORM_DEFAULTS,
  USER_VALIDATION,
  USER_FILTER_DEFAULTS,
} from './types'

// ==============================================
// Exports de actions
// ==============================================

export {
  getUsers,
  getAllUsers,
  getUserById,
  getUserStats,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
  searchUsersAction,
  getUsersByRoleAction,
} from './actions/user-actions'
