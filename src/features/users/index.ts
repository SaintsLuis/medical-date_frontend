// ==============================================
// Exports del Módulo de Usuarios
// ==============================================

// Components
export { UsersManagement } from './components/users-management'
export { UserForm } from './components/user-form'
export { UsersSkeleton } from './components/users-skeleton'

// Actions
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

// Hooks
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

// Types
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
