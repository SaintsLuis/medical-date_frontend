import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  User,
  UserRole,
  Permission,
  AuthState,
  ROLE_PERMISSIONS,
  BackendUser,
} from '@/types/auth'
import { config } from '@/config/app'
import { logoutAction, getProfileAction } from '../actions/auth-actions'

// Transformador para convertir BackendUser a User
const transformBackendUser = (backendUser: BackendUser): User => {
  console.log('🔄 Transforming backend user:', {
    id: backendUser.id,
    email: backendUser.email,
    roles: backendUser.roles,
    rolesType: typeof backendUser.roles,
    rolesIsArray: Array.isArray(backendUser.roles),
  })

  // El backend devuelve roles como array de strings: ["admin", "doctor"]
  const roles: UserRole[] = Array.isArray(backendUser.roles)
    ? backendUser.roles.map((role) => {
        if (typeof role === 'string') {
          return role as UserRole
        }
        console.warn('⚠️ Unexpected role type:', typeof role, role)
        return 'patient' as UserRole
      })
    : []

  console.log('✅ Transformed roles:', roles)

  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    phoneNumber: backendUser.phoneNumber,
    isActive: backendUser.isActive,
    emailVerified: backendUser.emailVerified || true, // Fallback
    roles,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    lastLoginAt: backendUser.lastLoginAt,
    patientProfile: backendUser.patientProfile,
    doctorProfile: backendUser.doctorProfile,
  }
}

interface AuthStore extends AuthState {
  // Métodos simplificados para trabajar con Server Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null, // Ya no manejamos tokens en el cliente, solo en cookies HTTP-only
      isAuthenticated: false,
      isLoading: false,
      permissions: [],

      setUser: (user: User | null) => {
        if (user) {
          const permissions = user.roles.flatMap(
            (role: UserRole) => ROLE_PERMISSIONS[role] || []
          )
          set({
            user,
            isAuthenticated: true,
            permissions,
          })
        } else {
          set({
            user: null,
            isAuthenticated: false,
            permissions: [],
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      logout: async () => {
        try {
          set({ isLoading: true })

          // Usar Server Action para logout (maneja cookies y backend)
          await logoutAction()

          // Limpiar estado local
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            permissions: [],
            isLoading: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
          // Limpiar estado de todas formas
          get().clearAuth()
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })

          // Usar Server Action para obtener perfil
          const userData = await getProfileAction()

          if (userData) {
            const user = transformBackendUser(userData)
            const permissions = user.roles.flatMap(
              (role: UserRole) => ROLE_PERMISSIONS[role] || []
            )

            set({
              user,
              token: 'cookie-based', // Indicar que usamos cookies
              isAuthenticated: true,
              permissions,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              permissions: [],
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('CheckAuth error:', error)
          get().clearAuth()
        }
      },

      hasPermission: (permission: Permission) => {
        const { permissions } = get()
        return permissions.includes(permission)
      },

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.roles.includes(role) || false
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
          isLoading: false,
        })

        // Limpiar storage local
        if (typeof window !== 'undefined') {
          localStorage.removeItem(config.TOKEN_STORAGE_KEY)
          localStorage.removeItem(config.REFRESH_TOKEN_STORAGE_KEY)
          localStorage.removeItem(config.AUTH_STORAGE_KEY)
        }
      },
    }),
    {
      name: config.AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        // No persistir token ya que usamos cookies HTTP-only
      }),
    }
  )
)

// Función para inicializar auth al cargar la app
export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState()
  await checkAuth()
}
