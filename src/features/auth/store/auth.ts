import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import {
  User,
  UserRole,
  Permission,
  AuthState,
  LoginRequest,
  RegisterRequest,
  ROLE_PERMISSIONS,
  AuthResponse,
} from '@/types/auth'
import { apiClient } from '@/lib/api/client'
import { config, DEMO_PASSWORDS } from '@/config/app'

// Mock users for development (remove when connecting to real API)
const mockUsers: Record<string, User> = {
  'admin@medicaldate.com': {
    id: 'admin-1',
    email: 'admin@medicaldate.com',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+1 (555) 123-4567',
    isActive: true,
    roles: [UserRole.ADMIN],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'doctor@medicaldate.com': {
    id: 'doctor-1',
    email: 'doctor@medicaldate.com',
    firstName: 'Dr. John',
    lastName: 'Smith',
    phoneNumber: '+1 (555) 987-6543',
    isActive: true,
    roles: [UserRole.DOCTOR],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'superadmin@medicaldate.com': {
    id: 'superadmin-1',
    email: 'superadmin@medicaldate.com',
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '+1 (555) 555-5555',
    isActive: true,
    roles: [UserRole.SUPER_ADMIN],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'patient@medicaldate.com': {
    id: 'patient-1',
    email: 'patient@medicaldate.com',
    firstName: 'María',
    lastName: 'García',
    phoneNumber: '+1 (555) 111-2222',
    isActive: true,
    roles: [UserRole.PATIENT],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

// Environment flag to determine if we use mocks or real API
const USE_MOCK_AUTH = config.USE_MOCK_AUTH

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  register: (data: RegisterRequest) => Promise<void>
  checkAuth: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  setLoading: (loading: boolean) => void
  setToken: (token: string) => void
  // Mock-specific methods for development
  getMockUsers: () => User[]
  addMockUser: (user: User, password: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true })

          let response: AuthResponse

          if (USE_MOCK_AUTH) {
            // Use mock data for development
            const user = Object.values(mockUsers).find(
              (u) => u.email === credentials.email
            )

            if (!user) {
              throw new Error('Credenciales inválidas')
            }

            // Check demo password
            const expectedPassword =
              DEMO_PASSWORDS[credentials.email as keyof typeof DEMO_PASSWORDS]
            if (credentials.password !== expectedPassword) {
              throw new Error('Contraseña incorrecta')
            }

            const mockToken = `mock-token:${user.id}:${Date.now()}`

            response = {
              user,
              accessToken: mockToken,
              refreshToken: `refresh-${mockToken}`,
            }
          } else {
            // Use real API
            response = await apiClient.post<AuthResponse>(
              '/auth/login',
              credentials
            )
          }

          const { user, accessToken } = response

          // Calculate permissions based on user roles
          const permissions = user.roles.flatMap(
            (role: UserRole) => ROLE_PERMISSIONS[role] || []
          )

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            permissions,
            isLoading: false,
          })

          // Store token in localStorage for interceptor
          localStorage.setItem('access_token', accessToken)

          // Store token in cookies for middleware
          Cookies.set('access_token', accessToken, {
            expires: 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        console.log('logout called')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
          isLoading: false, // Ensure loading is false
        })

        // Clear tokens from localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth-storage')

        // Clear tokens from cookies
        Cookies.remove('access_token')
      },
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true })

          let response: AuthResponse

          if (USE_MOCK_AUTH) {
            // Check if user already exists
            if (mockUsers[data.email]) {
              throw new Error('El usuario ya existe')
            }

            // For mock, create a new user
            const newUser: User = {
              id: `user-${Date.now()}`,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phoneNumber: data.phoneNumber || '',
              isActive: true,
              roles: [data.role || UserRole.PATIENT],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }

            // Add to mock users
            mockUsers[data.email] = newUser

            const mockToken = `mock-token:${newUser.id}:${Date.now()}`

            response = {
              user: newUser,
              accessToken: mockToken,
              refreshToken: `refresh-${mockToken}`,
            }
          } else {
            // Use real API
            response = await apiClient.post<AuthResponse>(
              '/auth/register',
              data
            )
          }

          const { user, accessToken } = response

          // Calculate permissions based on user roles
          const permissions = user.roles.flatMap(
            (role: UserRole) => ROLE_PERMISSIONS[role] || []
          )

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            permissions,
            isLoading: false,
          })

          // Store token in localStorage for interceptor
          localStorage.setItem('access_token', accessToken)

          // Store token in cookies for middleware
          Cookies.set('access_token', accessToken, {
            expires: 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      checkAuth: async () => {
        console.log('checkAuth called')
        const { token } = get()
        let authToken = token

        // If no token in state, check cookies
        if (!authToken) {
          authToken = Cookies.get('access_token') || null
          if (authToken) {
            set({ token: authToken })
          }
        }

        console.log('Auth token:', authToken)

        if (!authToken) {
          console.log('No token found, setting unauthenticated')
          set({
            isAuthenticated: false,
            user: null,
            permissions: [],
            isLoading: false,
          })
          return
        }

        try {
          console.log('Setting loading to true')
          set({ isLoading: true })

          let user: User

          if (USE_MOCK_AUTH) {
            console.log('Using mock auth')
            // Extract user ID from mock token
            // Token format: mock-token:{userId}:{timestamp}
            const tokenParts = authToken.split(':')
            if (tokenParts.length < 3) {
              console.log('Invalid token format')
              throw new Error('Token inválido')
            }
            const userId = tokenParts[1] // Get the user ID part
            console.log('Extracted user ID:', userId)
            const mockUser = Object.values(mockUsers).find(
              (u) => u.id === userId
            )

            if (!mockUser) {
              console.log(
                'Mock user not found, available users:',
                Object.keys(mockUsers)
              )
              throw new Error('Token inválido')
            }

            console.log('Found mock user:', mockUser.email)
            user = mockUser
          } else {
            // Use real API
            user = await apiClient.get<User>('/auth/me')
          }

          // Calculate permissions based on user roles
          const permissions = user.roles.flatMap(
            (role: UserRole) => ROLE_PERMISSIONS[role] || []
          )

          console.log('Setting authenticated state')
          set({
            user,
            isAuthenticated: true,
            permissions,
            isLoading: false,
          })
        } catch (error) {
          console.log('checkAuth error:', error)
          // Token is invalid, logout
          get().logout()
          set({ isLoading: false }) // Ensure loading is set to false
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

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setToken: (token: string) => {
        set({ token })
        localStorage.setItem('access_token', token)

        // Store token in cookies for middleware
        Cookies.set('access_token', token, {
          expires: 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      },

      // Mock-specific methods for development
      getMockUsers: () => {
        return Object.values(mockUsers)
      },

      addMockUser: (user: User, password: string) => {
        if (USE_MOCK_AUTH) {
          mockUsers[user.email] = user
          // Add password to DEMO_PASSWORDS
          ;(DEMO_PASSWORDS as Record<string, string>)[user.email] = password
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)

// Initialize auth on app load
export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState()
  await checkAuth()
}
